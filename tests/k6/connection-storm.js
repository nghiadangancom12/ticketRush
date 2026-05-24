import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import exec from 'k6/execution';
import { Counter, Rate, Trend } from 'k6/metrics';
import { sleep } from 'k6';
import { getAdminToken, getConfig, getUserByVu, baseUrl } from './lib/context.js';
import { authHeaders } from './lib/request.js';
import { dbRequest } from './lib/db-signals.js';

const cfg = getConfig();
const provider = cfg.provider || 'unknown';
const storm = cfg.connectionStorm || {};
const profile = 'connection_storm';
const artifactPrefix = storm.artifactPrefix || `${provider}-connection-storm`;

const defaults = {
  maxVUs: 300,
  gracefulRampDown: '30s',
  sleepSeconds: 0.01,
  thresholds: {
    readP95Ms: 8000,
    writeP95Ms: 8000,
    cycleP95Ms: 20000,
    failedRate: 0.05,
    serverErrorRate: 0.02,
    poolPressureRate: 0.01,
    timeoutRate: 0.01
  }
};

const maxVUs = Number(__ENV.STORM_MAX_VUS || storm.maxVUs || defaults.maxVUs);
const sleepSeconds = Number(__ENV.STORM_SLEEP_SECONDS || storm.sleepSeconds || defaults.sleepSeconds);
const thresholds = {
  ...defaults.thresholds,
  ...(storm.thresholds || {})
};

function buildStages() {
  if (Array.isArray(storm.stages) && storm.stages.length > 0) return storm.stages;

  return [
    { duration: '30s', target: Math.max(1, Math.round(maxVUs * 0.25)) },
    { duration: '45s', target: Math.max(1, Math.round(maxVUs * 0.5)) },
    { duration: '1m', target: maxVUs },
    { duration: '45s', target: maxVUs },
    { duration: '30s', target: 0 }
  ];
}

const stages = buildStages();

const stormReadLatency = new Trend('storm_read_latency_ms');
const stormWriteLatency = new Trend('storm_write_latency_ms');
const stormCycleLatency = new Trend('storm_cycle_latency_ms');
const stormRequestFailed = new Rate('storm_request_failed_rate');
const stormServerError = new Rate('storm_server_error_rate');
const stormPoolPressure = new Rate('storm_pool_pressure_rate');
const stormTimeout = new Rate('storm_timeout_rate');
const stormHoldSuccess = new Rate('storm_hold_success_rate');
const stormHoldConflict = new Rate('storm_hold_conflict_rate');
const stormPoolPressureCount = new Counter('storm_pool_pressure_count');

const POOL_PRESSURE_NEEDLES = [
  'pool',
  'pgbouncer',
  'too many clients',
  'remaining connection slots',
  'connection limit',
  'p2024',
  'timed out fetching a new connection',
  'max client connections'
];

function textFor(res) {
  const body = typeof res.body === 'string' ? res.body : '';
  const error = res.error ? String(res.error) : '';
  return `${body} ${error}`.toLowerCase();
}

function isTimeout(res) {
  const text = textFor(res);
  return res.status === 0 || text.includes('timeout') || text.includes('timed out');
}

function isPoolPressure(res) {
  const text = textFor(res);
  return res.status >= 500 && POOL_PRESSURE_NEEDLES.some((needle) => text.includes(needle));
}

function recordOutcome(res, expectedStatuses, tags) {
  const ok = expectedStatuses.includes(res.status);
  const poolPressure = isPoolPressure(res);

  stormRequestFailed.add(ok ? 0 : 1, tags);
  stormServerError.add(res.status >= 500 ? 1 : 0, tags);
  stormTimeout.add(isTimeout(res) ? 1 : 0, tags);
  stormPoolPressure.add(poolPressure ? 1 : 0, tags);

  if (poolPressure) stormPoolPressureCount.add(1, tags);
}

function addReadLatency(res, tags) {
  stormReadLatency.add(res.timings.duration, tags);
}

function addWriteLatency(res, tags) {
  stormWriteLatency.add(res.timings.duration, tags);
}

export const options = {
  scenarios: {
    connection_storm: {
      executor: 'ramping-vus',
      stages,
      gracefulRampDown: storm.gracefulRampDown || defaults.gracefulRampDown,
      exec: 'stormPath'
    }
  },
  thresholds: {
    [`storm_read_latency_ms{profile:${profile}}`]: [`p(95)<${thresholds.readP95Ms}`],
    [`storm_write_latency_ms{profile:${profile}}`]: [`p(95)<${thresholds.writeP95Ms}`],
    [`storm_cycle_latency_ms{profile:${profile}}`]: [`p(95)<${thresholds.cycleP95Ms}`],
    [`storm_request_failed_rate{profile:${profile}}`]: [`rate<${thresholds.failedRate}`],
    [`storm_server_error_rate{profile:${profile}}`]: [`rate<${thresholds.serverErrorRate}`],
    [`storm_pool_pressure_rate{profile:${profile}}`]: [`rate<${thresholds.poolPressureRate}`],
    [`storm_timeout_rate{profile:${profile}}`]: [`rate<${thresholds.timeoutRate}`]
  },
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max']
};

export function setup() {
  const adminToken = getAdminToken();
  dbRequest(
    'POST',
    `${baseUrl()}/api/queue/admin/${cfg.fixtures.eventId}/toggle`,
    { isActive: false },
    { headers: authHeaders(adminToken), tags: { endpoint: 'storm_queue_toggle' } },
    [200]
  );
}

function seatForCurrentIteration() {
  const seats = cfg.fixtures.seatIds;
  const index = (exec.scenario.iterationInTest + __VU) % seats.length;
  return seats[index];
}

export function stormPath() {
  const user = getUserByVu(__VU);
  const headers = authHeaders(user.token);
  const tags = { profile };
  const started = Date.now();

  const eventsRes = dbRequest(
    'GET',
    `${baseUrl()}/api/events`,
    null,
    { tags: { ...tags, endpoint: 'storm_events' } },
    [200]
  );
  addReadLatency(eventsRes, { ...tags, endpoint: 'storm_events' });
  recordOutcome(eventsRes, [200], { ...tags, endpoint: 'storm_events' });

  const detailRes = dbRequest(
    'GET',
    `${baseUrl()}/api/events/${cfg.fixtures.eventId}`,
    null,
    { headers, tags: { ...tags, endpoint: 'storm_event_detail' } },
    [200]
  );
  addReadLatency(detailRes, { ...tags, endpoint: 'storm_event_detail' });
  recordOutcome(detailRes, [200], { ...tags, endpoint: 'storm_event_detail' });

  const cleanupRes = dbRequest(
    'POST',
    `${baseUrl()}/api/Booking/return`,
    { eventId: cfg.fixtures.eventId },
    { headers, tags: { ...tags, endpoint: 'storm_return_cleanup' } },
    [200]
  );
  addWriteLatency(cleanupRes, { ...tags, endpoint: 'storm_return_cleanup' });
  recordOutcome(cleanupRes, [200], { ...tags, endpoint: 'storm_return_cleanup' });

  const holdRes = dbRequest(
    'POST',
    `${baseUrl()}/api/Booking/hold`,
    { eventId: cfg.fixtures.eventId, seatIds: [seatForCurrentIteration()] },
    { headers, tags: { ...tags, endpoint: 'storm_hold' } },
    [200, 400]
  );
  addWriteLatency(holdRes, { ...tags, endpoint: 'storm_hold' });
  recordOutcome(holdRes, [200, 400], { ...tags, endpoint: 'storm_hold' });
  stormHoldSuccess.add(holdRes.status === 200 ? 1 : 0, tags);
  stormHoldConflict.add(holdRes.status === 400 ? 1 : 0, tags);

  if (holdRes.status === 200) {
    const returnRes = dbRequest(
      'POST',
      `${baseUrl()}/api/Booking/return`,
      { eventId: cfg.fixtures.eventId },
      { headers, tags: { ...tags, endpoint: 'storm_return' } },
      [200]
    );
    addWriteLatency(returnRes, { ...tags, endpoint: 'storm_return' });
    recordOutcome(returnRes, [200], { ...tags, endpoint: 'storm_return' });
  }

  stormCycleLatency.add(Date.now() - started, tags);
  if (sleepSeconds > 0) sleep(sleepSeconds);
}

function findMetric(data, name, tags = {}) {
  const exact = `${name}{${Object.entries(tags).map(([k, v]) => `${k}:${v}`).join(',')}}`;
  if (data.metrics[exact]) return data.metrics[exact];

  const key = Object.keys(data.metrics).find((candidate) => {
    if (!candidate.startsWith(`${name}{`)) return false;
    return Object.entries(tags).every(([tag, value]) => candidate.includes(`${tag}:${value}`));
  });
  return key ? data.metrics[key] : null;
}

function value(data, metricName, valueName) {
  const metric = findMetric(data, metricName, { profile });
  return metric && metric.values ? metric.values[valueName] : null;
}

function fmtMs(v) {
  return typeof v === 'number' ? `${v.toFixed(1)}ms` : 'N/A';
}

function fmtPct(v) {
  return typeof v === 'number' ? `${(v * 100).toFixed(2)}%` : 'N/A';
}

export function handleSummary(data) {
  const result = {
    provider,
    profile,
    maxVUs,
    stages,
    sleepSeconds,
    thresholds,
    metrics: {
      readP95: value(data, 'storm_read_latency_ms', 'p(95)'),
      writeP95: value(data, 'storm_write_latency_ms', 'p(95)'),
      cycleP95: value(data, 'storm_cycle_latency_ms', 'p(95)'),
      failedRate: value(data, 'storm_request_failed_rate', 'rate'),
      serverErrorRate: value(data, 'storm_server_error_rate', 'rate'),
      poolPressureRate: value(data, 'storm_pool_pressure_rate', 'rate'),
      timeoutRate: value(data, 'storm_timeout_rate', 'rate'),
      holdSuccessRate: value(data, 'storm_hold_success_rate', 'rate'),
      holdConflictRate: value(data, 'storm_hold_conflict_rate', 'rate')
    }
  };

  console.log('');
  console.log(`CONNECTION STORM RESULT (${provider})`);
  console.log(`Max VUs: ${maxVUs}, sleep: ${sleepSeconds}s`);
  console.log(`read p95: ${fmtMs(result.metrics.readP95)}`);
  console.log(`write p95: ${fmtMs(result.metrics.writeP95)}`);
  console.log(`cycle p95: ${fmtMs(result.metrics.cycleP95)}`);
  console.log(`fail: ${fmtPct(result.metrics.failedRate)}, 5xx: ${fmtPct(result.metrics.serverErrorRate)}, pool: ${fmtPct(result.metrics.poolPressureRate)}, timeout: ${fmtPct(result.metrics.timeoutRate)}`);
  console.log('');

  return {
    stdout: JSON.stringify(result, null, 2),
    [`tests/k6/artifacts/${artifactPrefix}-summary.json`]: JSON.stringify(result, null, 2),
    [`tests/k6/artifacts/${artifactPrefix}.html`]: htmlReport(data, { title: `${provider} Connection Storm` })
  };
}
