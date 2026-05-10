import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { sleep } from 'k6';
import { getConfig, getUserByVu, getAdminToken, getSeatByIteration, baseUrl } from './lib/context.js';
import { request, authHeaders } from './lib/request.js';
import { holdLatency, checkoutLatency, buildSummary } from './lib/metrics.js';

const cfg = getConfig();
const scenario = cfg.scenarios.mixedE2E;

export const options = {
  scenarios: {
    mixed_e2e: {
      executor: 'constant-vus',
      vus: scenario.vus,
      duration: scenario.duration
    }
  },
  thresholds: {
    http_req_failed: [`rate<${cfg.thresholds.httpFailRate}`],
    'http_req_duration{endpoint:hold}': [`p(95)<${cfg.thresholds.holdP95Ms}`],
    'http_req_duration{endpoint:checkout}': [`p(95)<${cfg.thresholds.checkoutP95Ms}`],
    server_error_rate: [`rate<${cfg.thresholds.serverErrorRate}`]
  }
};

export function setup() {
  const adminToken = getAdminToken();
  request(
    'POST',
    `${baseUrl()}/api/queue/admin/${cfg.fixtures.eventId}/toggle`,
    { isActive: false },
    { headers: authHeaders(adminToken), tags: { endpoint: 'queue_toggle' } },
    [200]
  );
}

export default function () {
  const user = getUserByVu(__VU);
  const seatId = getSeatByIteration(__ITER + __VU);

  const holdRes = request(
    'POST',
    `${baseUrl()}/api/Booking/hold`,
    { eventId: cfg.fixtures.eventId, seatIds: [seatId] },
    { headers: authHeaders(user.token), tags: { endpoint: 'hold' } },
    [200, 400, 403]
  );

  holdLatency.add(holdRes.timings.duration);

  if (holdRes.status === 200) {
    const checkoutRes = request(
      'POST',
      `${baseUrl()}/api/Booking/checkout`,
      { eventId: cfg.fixtures.eventId },
      { headers: authHeaders(user.token), tags: { endpoint: 'checkout' } },
      [200, 400, 403]
    );

    checkoutLatency.add(checkoutRes.timings.duration);

    if (checkoutRes.status !== 200) {
      request(
        'POST',
        `${baseUrl()}/api/Booking/return`,
        { eventId: cfg.fixtures.eventId },
        { headers: authHeaders(user.token), tags: { endpoint: 'return' } },
        [200]
      );
    }
  }

  sleep(0.5);
}

export function handleSummary(data) {
  const summary = buildSummary(data);
  return {
    stdout: JSON.stringify(summary, null, 2),
    'tests/k6/artifacts/rush-mixed-e2e-summary.json': JSON.stringify(summary, null, 2),
    'tests/k6/artifacts/rush-mixed-e2e.html': htmlReport(data, { title: 'Mixed E2E Rush' })
  };
}
