import { Counter, Rate, Trend } from 'k6/metrics';
import { request } from './request.js';

export const dbErrors = new Counter('db_error_count');
export const dbErrorRate = new Rate('db_error_rate');
export const dbPoolPressure = new Counter('db_pool_pressure_count');
export const dbPoolPressureRate = new Rate('db_pool_pressure_rate');
export const requestTimeoutRate = new Rate('request_timeout_rate');
export const firstRequestLatency = new Trend('first_request_latency_ms');
export const dbWriteCycleLatency = new Trend('db_write_cycle_latency_ms');

const DB_ERROR_NEEDLES = [
  'prisma',
  'database',
  'postgres',
  'pgbouncer',
  'neon',
  'p1001',
  'p1002',
  'p1008',
  'p1017',
  'p2024',
  'too many clients',
  'remaining connection slots',
  'terminating connection',
  'server closed the connection',
  'connection terminated',
  'connection reset',
  'timeout'
];

const POOL_PRESSURE_NEEDLES = [
  'pool',
  'pgbouncer',
  'too many clients',
  'remaining connection slots',
  'connection limit',
  'p2024'
];

const TIMEOUT_NEEDLES = [
  'timeout',
  'timed out',
  'etimedout',
  'econnreset',
  'econnrefused'
];

function textFor(res) {
  const body = typeof res.body === 'string' ? res.body : '';
  const error = res.error ? String(res.error) : '';
  return `${body} ${error}`.toLowerCase();
}

function includesAny(text, needles) {
  return needles.some((needle) => text.includes(needle));
}

export function recordDbSignals(res) {
  const status = res.status || 0;
  const text = textFor(res);

  const timedOut = status === 0 || includesAny(text, TIMEOUT_NEEDLES);
  const dbLikeError = status >= 500 && includesAny(text, DB_ERROR_NEEDLES);
  const poolLikeError = status >= 500 && includesAny(text, POOL_PRESSURE_NEEDLES);

  requestTimeoutRate.add(timedOut ? 1 : 0);
  dbErrorRate.add(dbLikeError ? 1 : 0);
  dbPoolPressureRate.add(poolLikeError ? 1 : 0);

  if (dbLikeError) dbErrors.add(1);
  if (poolLikeError) dbPoolPressure.add(1);
}

export function dbRequest(method, url, payload, params = {}, expectedStatuses = []) {
  const res = request(method, url, payload, params, expectedStatuses);
  recordDbSignals(res);
  return res;
}
