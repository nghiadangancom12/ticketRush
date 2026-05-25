import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import exec from 'k6/execution';
import { Rate, Trend } from 'k6/metrics';
import { sleep } from 'k6';
import { getAdminToken, getConfig, getSeatByIteration, getUserByVu, baseUrl } from './lib/context.js';
import { authHeaders } from './lib/request.js';
import { dbRequest } from './lib/db-signals.js';

const cfg = getConfig();
const bench = cfg.benchmark;
const thresholds = bench.thresholds;
const provider = cfg.provider || 'unknown';
const artifactPrefix = cfg.artifactPrefix || `${provider}-final`;
const mode = (__ENV.BENCHMARK_MODE || 'mixed').toLowerCase();

const readLatency = new Trend('benchmark_read_latency_ms');
const eventsLatency = new Trend('benchmark_events_latency_ms');
const landingLatency = new Trend('benchmark_landing_latency_ms');
const detailLatency = new Trend('benchmark_detail_latency_ms');
const holdLatency = new Trend('benchmark_hold_latency_ms');
const returnLatency = new Trend('benchmark_return_latency_ms');
const writeCycleLatency = new Trend('benchmark_write_cycle_latency_ms');
const requestFailed = new Rate('benchmark_request_failed_rate');
const serverError = new Rate('benchmark_server_error_rate');
const timeoutRate = new Rate('benchmark_timeout_rate');

function hasTimedOut(res) {
  const error = res.error ? String(res.error).toLowerCase() : '';
  return res.status === 0 || error.includes('timeout') || error.includes('timed out');
}

function recordOutcome(res, expectedStatuses, tags) {
  requestFailed.add(expectedStatuses.includes(res.status) ? 0 : 1, tags);
  serverError.add(res.status >= 500 ? 1 : 0, tags);
  timeoutRate.add(hasTimedOut(res) ? 1 : 0, tags);
}

function addCommonThresholds(out, profile) {
  out[`benchmark_request_failed_rate{profile:${profile}}`] = [`rate<${thresholds.requestFailedRate}`];
  out[`benchmark_server_error_rate{profile:${profile}}`] = [`rate<${thresholds.serverErrorRate}`];
  out[`benchmark_timeout_rate{profile:${profile}}`] = [`rate<${thresholds.timeoutRate}`];
}

function buildOptions() {
  const scenarios = {};
  const t = {};

  if (mode === 'read') {
    scenarios.read_capacity = {
      executor: 'constant-arrival-rate',
      rate: bench.read.rate,
      timeUnit: '1s',
      duration: bench.duration,
      preAllocatedVUs: bench.read.preAllocatedVUs,
      maxVUs: bench.read.maxVUs,
      exec: 'readPath',
      gracefulStop: '30s'
    };
    addCommonThresholds(t, 'read');
    t['benchmark_read_latency_ms{profile:read}'] = [`p(95)<${thresholds.readP95Ms}`];
  }

  if (mode === 'write') {
    scenarios.write_capacity = {
      executor: 'constant-arrival-rate',
      rate: bench.write.rate,
      timeUnit: '1s',
      duration: bench.duration,
      preAllocatedVUs: bench.write.preAllocatedVUs,
      maxVUs: bench.write.maxVUs,
      exec: 'writePath',
      gracefulStop: '30s'
    };
    addCommonThresholds(t, 'write');
    t['benchmark_hold_latency_ms{profile:write}'] = [`p(95)<${thresholds.holdP95Ms}`];
    t['benchmark_return_latency_ms{profile:write}'] = [`p(95)<${thresholds.returnP95Ms}`];
    t['benchmark_write_cycle_latency_ms{profile:write}'] = [`p(95)<${thresholds.writeCycleP95Ms}`];
  }

  if (mode === 'mixed') {
    scenarios.mixed_read_capacity = {
      executor: 'constant-arrival-rate',
      rate: bench.mixed.readRate,
      timeUnit: '1s',
      duration: bench.duration,
      preAllocatedVUs: bench.mixed.readPreAllocatedVUs,
      maxVUs: bench.mixed.readMaxVUs,
      exec: 'readPath',
      gracefulStop: '30s'
    };
    scenarios.mixed_write_capacity = {
      executor: 'constant-arrival-rate',
      rate: bench.mixed.writeRate,
      timeUnit: '1s',
      duration: bench.duration,
      preAllocatedVUs: bench.mixed.writePreAllocatedVUs,
      maxVUs: bench.mixed.writeMaxVUs,
      exec: 'writePath',
      gracefulStop: '30s'
    };
    addCommonThresholds(t, 'mixed');
    t['benchmark_read_latency_ms{profile:mixed}'] = [`p(95)<${thresholds.readP95Ms}`];
    t['benchmark_hold_latency_ms{profile:mixed}'] = [`p(95)<${thresholds.holdP95Ms}`];
    t['benchmark_return_latency_ms{profile:mixed}'] = [`p(95)<${thresholds.returnP95Ms}`];
    t['benchmark_write_cycle_latency_ms{profile:mixed}'] = [`p(95)<${thresholds.writeCycleP95Ms}`];
  }

  if (!['read', 'write', 'mixed'].includes(mode)) {
    throw new Error(`Unknown BENCHMARK_MODE=${mode}. Use read, write, or mixed.`);
  }

  return {
    scenarios,
    thresholds: t,
    summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max']
  };
}

export const options = buildOptions();

function profileName() {
  if (exec.scenario.name.startsWith('mixed_')) return 'mixed';
  if (exec.scenario.name.startsWith('read_')) return 'read';
  if (exec.scenario.name.startsWith('write_')) return 'write';
  return mode;
}

export function setup() {
  const adminToken = getAdminToken();
  dbRequest(
    'POST',
    `${baseUrl()}/api/queue/admin/${cfg.fixtures.eventId}/toggle`,
    { isActive: false },
    { headers: authHeaders(adminToken), tags: { endpoint: 'benchmark_queue_toggle' } },
    [200]
  );
}

export function readPath() {
  const profile = profileName();
  const route = (__ITER + __VU) % 10;
  const tags = { profile, workload: 'read' };
  let res;

  if (route < 5) {
    res = dbRequest(
      'GET',
      `${baseUrl()}/api/events`,
      null,
      { tags: { ...tags, endpoint: 'benchmark_events' } },
      [200]
    );
    eventsLatency.add(res.timings.duration, { profile });
  } else if (route < 8) {
    res = dbRequest(
      'GET',
      `${baseUrl()}/api/events/${cfg.fixtures.eventId}/landing`,
      null,
      { tags: { ...tags, endpoint: 'benchmark_landing' } },
      [200]
    );
    landingLatency.add(res.timings.duration, { profile });
  } else {
    const user = getUserByVu(__VU);
    res = dbRequest(
      'GET',
      `${baseUrl()}/api/events/${cfg.fixtures.eventId}`,
      null,
      { headers: authHeaders(user.token), tags: { ...tags, endpoint: 'benchmark_event_detail' } },
      [200]
    );
    detailLatency.add(res.timings.duration, { profile });
  }

  readLatency.add(res.timings.duration, { profile });
  recordOutcome(res, [200], { profile });
  sleep(0.02);
}

export function writePath() {
  const profile = profileName();
  const user = getUserByVu(__VU);
  const headers = authHeaders(user.token);
  const seatId = getSeatByIteration(__ITER + __VU);
  const started = Date.now();

  const cleanupRes = dbRequest(
    'POST',
    `${baseUrl()}/api/Booking/return`,
    { eventId: cfg.fixtures.eventId },
    { headers, tags: { profile, workload: 'write', endpoint: 'benchmark_return_cleanup' } },
    [200]
  );
  returnLatency.add(cleanupRes.timings.duration, { profile });
  recordOutcome(cleanupRes, [200], { profile });

  const holdRes = dbRequest(
    'POST',
    `${baseUrl()}/api/Booking/hold`,
    { eventId: cfg.fixtures.eventId, seatIds: [seatId] },
    { headers, tags: { profile, workload: 'write', endpoint: 'benchmark_hold' } },
    [200, 400]
  );
  holdLatency.add(holdRes.timings.duration, { profile });
  recordOutcome(holdRes, [200, 400], { profile });

  if (holdRes.status === 200) {
    const returnRes = dbRequest(
      'POST',
      `${baseUrl()}/api/Booking/return`,
      { eventId: cfg.fixtures.eventId },
      { headers, tags: { profile, workload: 'write', endpoint: 'benchmark_return' } },
      [200]
    );
    returnLatency.add(returnRes.timings.duration, { profile });
    recordOutcome(returnRes, [200], { profile });
  }

  writeCycleLatency.add(Date.now() - started, { profile });
  sleep(0.02);
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

function value(data, metricName, profile, valueName) {
  const metric = findMetric(data, metricName, { profile }) || data.metrics[metricName];
  return metric && metric.values ? metric.values[valueName] : null;
}

function fmtMs(v) {
  return typeof v === 'number' ? `${v.toFixed(1)}ms` : 'N/A';
}

function fmtPct(v) {
  return typeof v === 'number' ? `${(v * 100).toFixed(2)}%` : 'N/A';
}

function activeProfiles() {
  return [mode];
}

function summarizeProfile(data, profile) {
  return {
    profile,
    readP95: value(data, 'benchmark_read_latency_ms', profile, 'p(95)'),
    eventsP95: value(data, 'benchmark_events_latency_ms', profile, 'p(95)'),
    landingP95: value(data, 'benchmark_landing_latency_ms', profile, 'p(95)'),
    detailP95: value(data, 'benchmark_detail_latency_ms', profile, 'p(95)'),
    holdP95: value(data, 'benchmark_hold_latency_ms', profile, 'p(95)'),
    returnP95: value(data, 'benchmark_return_latency_ms', profile, 'p(95)'),
    cycleP95: value(data, 'benchmark_write_cycle_latency_ms', profile, 'p(95)'),
    failedRate: value(data, 'benchmark_request_failed_rate', profile, 'rate'),
    serverErrorRate: value(data, 'benchmark_server_error_rate', profile, 'rate'),
    timeoutRate: value(data, 'benchmark_timeout_rate', profile, 'rate')
  };
}

export function handleSummary(data) {
  const profiles = activeProfiles().map((profile) => summarizeProfile(data, profile));

  console.log('');
  console.log(`FINAL CAPACITY BENCHMARK RESULT (${provider})`);
  console.log(`Mode: ${mode}, duration: ${bench.duration}`);
  console.log('Profile | read p95 | events p95 | landing p95 | detail p95 | hold p95 | return p95 | cycle p95 | fail | 5xx | timeout');
  for (const row of profiles) {
    console.log([
      row.profile,
      fmtMs(row.readP95),
      fmtMs(row.eventsP95),
      fmtMs(row.landingP95),
      fmtMs(row.detailP95),
      fmtMs(row.holdP95),
      fmtMs(row.returnP95),
      fmtMs(row.cycleP95),
      fmtPct(row.failedRate),
      fmtPct(row.serverErrorRate),
      fmtPct(row.timeoutRate)
    ].join(' | '));
  }
  console.log('');

  const summary = { provider, mode, duration: bench.duration, rates: bench, profiles };
  const suffix = mode === 'all' ? 'all' : mode;

  return {
    stdout: JSON.stringify(summary, null, 2),
    [`tests/k6/artifacts/${artifactPrefix}-${suffix}-summary.json`]: JSON.stringify(summary, null, 2),
    [`tests/k6/artifacts/${artifactPrefix}-${suffix}.html`]: htmlReport(data, { title: `${provider} Final Capacity Benchmark (${suffix})` })
  };
}
