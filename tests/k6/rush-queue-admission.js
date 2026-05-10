import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { sleep } from 'k6';
import { getConfig, getUserByVu, getAdminToken, baseUrl } from './lib/context.js';
import { request, authHeaders } from './lib/request.js';
import { queueAllowed, queueQueued, joinLatency, buildSummary } from './lib/metrics.js';

const cfg = getConfig();
const scenario = cfg.scenarios.queueAdmission;

export const options = {
  scenarios: {
    queue_admission: {
      executor: 'per-vu-iterations',
      vus: scenario.vus,
      iterations: 1,
      maxDuration: scenario.duration
    }
  },
  thresholds: {
    http_req_failed: [`rate<${cfg.thresholds.httpFailRate}`],
    'http_req_duration{endpoint:queue_join}': [`p(95)<${cfg.thresholds.joinP95Ms}`],
    server_error_rate: [`rate<${cfg.thresholds.serverErrorRate}`]
  }
};

export function setup() {
  const adminToken = getAdminToken();
  request(
    'POST',
    `${baseUrl()}/api/queue/admin/${cfg.fixtures.eventId}/toggle`,
    { isActive: true },
    { headers: authHeaders(adminToken), tags: { endpoint: 'queue_toggle' } },
    [200]
  );
  return { adminToken };
}

export default function () {
  const user = getUserByVu(__VU);
  const joinRes = request(
    'POST',
    `${baseUrl()}/api/queue/${cfg.fixtures.eventId}/join`,
    {},
    { headers: authHeaders(user.token), tags: { endpoint: 'queue_join' } },
    [200, 202, 429]
  );

  joinLatency.add(joinRes.timings.duration);

  if (joinRes.status === 200) {
    queueAllowed.add(1);
  }
  if (joinRes.status === 202) {
    queueQueued.add(1);
  }

  sleep(1);
}

export function teardown(data) {
  request(
    'POST',
    `${baseUrl()}/api/queue/admin/${cfg.fixtures.eventId}/toggle`,
    { isActive: false },
    { headers: authHeaders(data.adminToken), tags: { endpoint: 'queue_toggle' } },
    [200]
  );
}

export function handleSummary(data) {
  const summary = buildSummary(data);
  return {
    stdout: JSON.stringify(summary, null, 2),
    'tests/k6/artifacts/rush-queue-admission-summary.json': JSON.stringify(summary, null, 2),
    'tests/k6/artifacts/rush-queue-admission.html': htmlReport(data, { title: 'Queue Admission Rush' })
  };
}
