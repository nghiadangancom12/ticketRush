import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { sleep } from 'k6';
import { getConfig, getUserByVu, getSeatByIteration, getAdminToken, baseUrl } from './lib/context.js';
import { request, authHeaders } from './lib/request.js';
import {
  stressLatency,
  serverErrorRate,
  buildSummary
} from './lib/metrics.js';

// ───────────────────────────────────────────────────────────────
// STRESS TEST
// Tăng dần tải từ 10 → 200 req/s → giảm về 10
// Mục đích: tìm điểm mà latency bắt đầu tăng đột biến
// Đánh song song 2 scenario:
//   - public_events:  GET /api/events (không auth) → đo raw Express
//   - hold_under_load: POST /api/Booking/hold (auth + DB lock) → đo nghiệp vụ
// ───────────────────────────────────────────────────────────────

const cfg = getConfig();
const scenario = cfg.scenarios.stressTest;

export const options = {
  scenarios: {
    // Scenario 1: Đánh API public (không auth, không DB lock)
    public_events: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: scenario.timeUnit,
      preAllocatedVUs: 20,
      maxVUs: 70,
      stages: scenario.stages,
      exec: 'stressPublic'
    },
    // Scenario 2: Đánh API hold (auth + Postgres row lock)
    hold_under_load: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: scenario.timeUnit,
      preAllocatedVUs: 10,
      maxVUs: 30,
      stages: scenario.stages.map(s => ({
        // Hold chạy ở 1/4 tốc độ events để không quá tải DB
        target: Math.max(1, Math.round(s.target / 4)),
        duration: s.duration
      })),
      exec: 'stressHold'
    }
  },
  thresholds: {
    'http_req_duration{endpoint:events}': [`p(95)<${cfg.thresholds.stressP95Ms}`],
    'http_req_duration{endpoint:stress_hold}': [`p(95)<${cfg.thresholds.stressP95Ms}`],
    server_error_rate: [`rate<${cfg.thresholds.stressErrorRate}`]
  },
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max']
};

export function setup() {
  // Tắt queue để hold không bị 403
  const adminToken = getAdminToken();
  request(
    'POST',
    `${baseUrl()}/api/queue/admin/${cfg.fixtures.eventId}/toggle`,
    { isActive: false },
    { headers: authHeaders(adminToken), tags: { endpoint: 'queue_toggle' } },
    [200]
  );
}

// ── Scenario 1: GET /api/events (public) ──────────────────────
export function stressPublic() {
  const res = request(
    'GET',
    `${baseUrl()}/api/events`,
    null,
    { tags: { endpoint: 'events' } },
    [200]
  );

  stressLatency.add(res.timings.duration);
  sleep(0.1);
}

// ── Scenario 2: POST /api/Booking/hold (auth + DB) ───────────
export function stressHold() {
  const user = getUserByVu(__VU);
  const seatId = getSeatByIteration(__ITER);

  const res = request(
    'POST',
    `${baseUrl()}/api/Booking/hold`,
    { eventId: cfg.fixtures.eventId, seatIds: [seatId] },
    { headers: authHeaders(user.token), tags: { endpoint: 'stress_hold' } },
    [200, 400, 403]
  );

  stressLatency.add(res.timings.duration);
  sleep(0.1);
}

export function handleSummary(data) {
  const summary = buildSummary(data);

  // Tính latency theo từng endpoint
  const eventsP95 = data.metrics['http_req_duration{endpoint:events}']
    ? data.metrics['http_req_duration{endpoint:events}'].values['p(95)']
    : 'N/A';
  const holdP95 = data.metrics['http_req_duration{endpoint:stress_hold}']
    ? data.metrics['http_req_duration{endpoint:stress_hold}'].values['p(95)']
    : 'N/A';

  console.log('\n══════════════════════════════════════════');
  console.log('  STRESS TEST RESULT');
  console.log('══════════════════════════════════════════');
  console.log(`  GET /api/events      p95: ${typeof eventsP95 === 'number' ? eventsP95.toFixed(1) : eventsP95}ms`);
  console.log(`  POST /api/Booking/hold p95: ${typeof holdP95 === 'number' ? holdP95.toFixed(1) : holdP95}ms`);
  console.log(`  Threshold:           p95 < ${cfg.thresholds.stressP95Ms}ms`);
  console.log('══════════════════════════════════════════\n');

  return {
    stdout: JSON.stringify(summary, null, 2),
    'tests/k6/artifacts/stress-test-summary.json': JSON.stringify(summary, null, 2),
    'tests/k6/artifacts/stress-test.html': htmlReport(data, { title: 'Stress Test — Latency vs Load' })
  };
}
