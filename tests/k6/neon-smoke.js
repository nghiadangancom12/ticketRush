import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { sleep } from 'k6';
import { getAdminToken, getConfig, getSeatByIteration, getUserByVu, baseUrl } from './lib/context.js';
import { authHeaders } from './lib/request.js';
import { holdLatency, buildSummary } from './lib/metrics.js';
import { dbWriteCycleLatency, firstRequestLatency, dbRequest } from './lib/db-signals.js';

const cfg = getConfig();
const scenario = cfg.scenarios.neonSmoke;

export const options = {
  scenarios: {
    neon_smoke: {
      executor: 'per-vu-iterations',
      vus: scenario.vus,
      iterations: scenario.iterations,
      maxDuration: scenario.maxDuration
    }
  },
  thresholds: {
    http_req_failed: [`rate<${cfg.thresholds.httpFailRate}`],
    'http_req_duration{endpoint:neon_events}': [`p(95)<${cfg.thresholds.neonReadP95Ms}`],
    'http_req_duration{endpoint:neon_hold}': [`p(95)<${cfg.thresholds.neonWriteP95Ms}`],
    first_request_latency_ms: [`p(95)<${cfg.thresholds.firstRequestP95Ms}`],
    db_error_rate: [`rate<${cfg.thresholds.dbErrorRate}`],
    db_pool_pressure_rate: [`rate<${cfg.thresholds.dbPoolPressureRate}`],
    server_error_rate: [`rate<${cfg.thresholds.serverErrorRate}`]
  },
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max']
};

export function setup() {
  const adminToken = getAdminToken();

  const firstRes = dbRequest(
    'GET',
    `${baseUrl()}/api/events`,
    null,
    { tags: { endpoint: 'neon_first_events' } },
    [200]
  );
  firstRequestLatency.add(firstRes.timings.duration);

  dbRequest(
    'POST',
    `${baseUrl()}/api/queue/admin/${cfg.fixtures.eventId}/toggle`,
    { isActive: false },
    { headers: authHeaders(adminToken), tags: { endpoint: 'neon_queue_toggle' } },
    [200]
  );
}

export default function () {
  const user = getUserByVu(__VU);
  const headers = authHeaders(user.token);
  const seatId = getSeatByIteration(__ITER);

  dbRequest(
    'POST',
    `${baseUrl()}/api/Booking/return`,
    { eventId: cfg.fixtures.eventId },
    { headers, tags: { endpoint: 'neon_return_cleanup' } },
    [200]
  );

  dbRequest(
    'GET',
    `${baseUrl()}/api/events`,
    null,
    { tags: { endpoint: 'neon_events' } },
    [200]
  );

  dbRequest(
    'GET',
    `${baseUrl()}/api/events/${cfg.fixtures.eventId}/landing`,
    null,
    { tags: { endpoint: 'neon_landing' } },
    [200]
  );

  dbRequest(
    'GET',
    `${baseUrl()}/api/events/${cfg.fixtures.eventId}`,
    null,
    { headers, tags: { endpoint: 'neon_event_detail' } },
    [200]
  );

  const started = Date.now();
  const holdRes = dbRequest(
    'POST',
    `${baseUrl()}/api/Booking/hold`,
    { eventId: cfg.fixtures.eventId, seatIds: [seatId] },
    { headers, tags: { endpoint: 'neon_hold' } },
    [200]
  );
  holdLatency.add(holdRes.timings.duration);

  dbRequest(
    'POST',
    `${baseUrl()}/api/Booking/return`,
    { eventId: cfg.fixtures.eventId },
    { headers, tags: { endpoint: 'neon_return' } },
    [200]
  );
  dbWriteCycleLatency.add(Date.now() - started);

  sleep(0.2);
}

export function handleSummary(data) {
  const summary = buildSummary(data);
  return {
    stdout: JSON.stringify(summary, null, 2),
    'tests/k6/artifacts/neon-smoke-summary.json': JSON.stringify(summary, null, 2),
    'tests/k6/artifacts/neon-smoke.html': htmlReport(data, { title: 'Neon Smoke Test' })
  };
}
