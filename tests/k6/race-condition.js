import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { getConfig, getUserByVu, getAdminToken, baseUrl } from './lib/context.js';
import { request, authHeaders } from './lib/request.js';
import {
  raceSuccess,
  raceConflict,
  holdLatency,
  serverErrorRate,
  buildSummary
} from './lib/metrics.js';

// ───────────────────────────────────────────────────────────────
// RACE CONDITION TEST
// 50 VU cùng giành 1 ghế → chỉ đúng 1 người thành công
// Nếu > 1 → BUG DOUBLE-BOOKING (FOR UPDATE lock bị hỏng)
// ───────────────────────────────────────────────────────────────

const cfg = getConfig();
const scenario = cfg.scenarios.raceCondition;

// Tất cả 50 VU sẽ đánh vào CÙNG 1 ghế này
const TARGET_SEAT = cfg.fixtures.seatIds[0];

export const options = {
  scenarios: {
    race_condition: {
      executor: 'per-vu-iterations',
      vus: scenario.vus,
      iterations: scenario.iterations,
      maxDuration: '30s'
    }
  },
  thresholds: {
    // race_success_count phải <= 1 (k6 counter thresholds dùng count)
    // Nếu > 1 → double-booking → FAIL pipeline
    race_success_count: ['count<=1'],
    server_error_rate: [`rate<${cfg.thresholds.serverErrorRate}`],
    http_req_failed: [`rate<${cfg.thresholds.httpFailRate}`]
  },
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'max']
};

export function setup() {
  // 1. Tắt virtual queue để request đi thẳng vào hold
  const adminToken = getAdminToken();
  request(
    'POST',
    `${baseUrl()}/api/queue/admin/${cfg.fixtures.eventId}/toggle`,
    { isActive: false },
    { headers: authHeaders(adminToken), tags: { endpoint: 'queue_toggle' } },
    [200]
  );

  // 2. Trả ghế target nếu nó đang bị lock từ test trước
  const user = getUserByVu(1);
  request(
    'POST',
    `${baseUrl()}/api/Booking/return`,
    { eventId: cfg.fixtures.eventId },
    { headers: authHeaders(user.token), tags: { endpoint: 'cleanup' } },
    [200]
  );

  return { targetSeat: TARGET_SEAT };
}

export default function (data) {
  const user = getUserByVu(__VU);
  const url = `${baseUrl()}/api/Booking/hold`;

  const res = request(
    'POST',
    url,
    { eventId: cfg.fixtures.eventId, seatIds: [data.targetSeat] },
    { headers: authHeaders(user.token), tags: { endpoint: 'race_hold' } },
    [200, 400, 403]
  );

  holdLatency.add(res.timings.duration);

  if (res.status === 200) {
    raceSuccess.add(1);     // Giữ ghế thành công
    raceConflict.add(0);
  } else if (res.status === 400) {
    raceSuccess.add(0);
    raceConflict.add(1);    // Ghế đã bị người khác lock → đúng hành vi
  }
  // 403, 429, 5xx = không đếm vào race metric (đã đếm bởi serverErrorRate)
}

export function teardown() {
  // Nhả ghế sau test để không ảnh hưởng test tiếp theo
  const user = getUserByVu(1);
  request(
    'POST',
    `${baseUrl()}/api/Booking/return`,
    { eventId: cfg.fixtures.eventId },
    { headers: authHeaders(user.token), tags: { endpoint: 'teardown_return' } },
    [200]
  );
}

export function handleSummary(data) {
  const summary = buildSummary(data);

  // In kết quả race condition rõ ràng
  const successCount = summary.metrics.race_success_count
    ? summary.metrics.race_success_count.values.count
    : 0;
  const conflictCount = summary.metrics.race_conflict_count
    ? summary.metrics.race_conflict_count.values.count
    : 0;

  console.log('\n══════════════════════════════════════════');
  console.log('  RACE CONDITION RESULT');
  console.log('══════════════════════════════════════════');
  console.log(`  Seats won:    ${successCount} (expected: 1)`);
  console.log(`  Conflicts:    ${conflictCount} (expected: ${scenario.vus - 1})`);
  if (successCount === 1) {
    console.log('  ✅ PASS — FOR UPDATE lock works correctly');
  } else if (successCount === 0) {
    console.log('  ⚠️  WARN — No one got the seat (all blocked?)');
  } else {
    console.log('  ❌ FAIL — DOUBLE BOOKING DETECTED!');
  }
  console.log('══════════════════════════════════════════\n');

  return {
    stdout: JSON.stringify(summary, null, 2),
    'tests/k6/artifacts/race-condition-summary.json': JSON.stringify(summary, null, 2),
    'tests/k6/artifacts/race-condition.html': htmlReport(data, { title: 'Race Condition Test' })
  };
}
