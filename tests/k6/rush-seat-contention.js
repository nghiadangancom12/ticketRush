import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { sleep } from 'k6';
import { getConfig, getSeatByIteration, getUserByVu, getAdminToken, baseUrl } from './lib/context.js';
import { request, authHeaders } from './lib/request.js';
import {
  lockSuccess,
  lockConflict,
  holdSuccessRate,
  holdConflictRate,
  holdLatency,
  buildSummary
} from './lib/metrics.js';

const cfg = getConfig();
const scenario = cfg.scenarios.seatContention;

export const options = {
  scenarios: {
    seat_contention: {
      executor: 'ramping-arrival-rate',
      startRate: scenario.startRate,
      timeUnit: scenario.timeUnit,
      preAllocatedVUs: scenario.preAllocatedVUs,
      maxVUs: scenario.maxVUs,
      stages: [
        { target: scenario.peakRate, duration: scenario.rampUp },
        { target: scenario.peakRate, duration: scenario.peak },
        { target: 0, duration: scenario.rampDown }
      ]
    }
  },
  thresholds: {
    http_req_failed: [`rate<${cfg.thresholds.httpFailRate}`],
    'http_req_duration{endpoint:hold}': [`p(95)<${cfg.thresholds.holdP95Ms}`],
    hold_success_rate: [`rate>${cfg.thresholds.minHoldSuccessRate}`],
    hold_conflict_rate: [`rate<${cfg.thresholds.maxHoldConflictRate}`],
    server_error_rate: [`rate<${cfg.thresholds.serverErrorRate}`]
  },
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'max']
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
  const seatId = getSeatByIteration(__ITER);
  const url = `${baseUrl()}/api/Booking/hold`;

  const res = request(
    'POST',
    url,
    { eventId: cfg.fixtures.eventId, seatIds: [seatId] },
    { headers: authHeaders(user.token), tags: { endpoint: 'hold' } },
    [200, 400, 403]
  );

  holdLatency.add(res.timings.duration);

  if (res.status === 200) {
    lockSuccess.add(1);
    holdSuccessRate.add(1);
    holdConflictRate.add(0);
  } else if (res.status === 400) {
    lockConflict.add(1);
    holdSuccessRate.add(0);
    holdConflictRate.add(1);
  } else {
    holdSuccessRate.add(0);
    holdConflictRate.add(0);
  }

  sleep(0.2);
}

export function handleSummary(data) {
  const summary = buildSummary(data);
  return {
    stdout: JSON.stringify(summary, null, 2),
    'tests/k6/artifacts/rush-seat-contention-summary.json': JSON.stringify(summary, null, 2),
    'tests/k6/artifacts/rush-seat-contention.html': htmlReport(data, { title: 'Seat Contention Rush' })
  };
}
