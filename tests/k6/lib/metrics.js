import { Counter, Rate, Trend } from 'k6/metrics';

export const lockSuccess = new Counter('lock_success_count');
export const lockConflict = new Counter('lock_conflict_count');
export const queueAllowed = new Counter('queue_allowed_count');
export const queueQueued = new Counter('queue_in_queue_count');
export const serverErrors = new Counter('server_error_count');

export const raceSuccess = new Counter('race_success_count');
export const raceConflict = new Counter('race_conflict_count');

export const holdSuccessRate = new Rate('hold_success_rate');
export const holdConflictRate = new Rate('hold_conflict_rate');
export const serverErrorRate = new Rate('server_error_rate');

export const holdLatency = new Trend('hold_latency_ms');
export const joinLatency = new Trend('join_latency_ms');
export const checkoutLatency = new Trend('checkout_latency_ms');
export const stressLatency = new Trend('stress_latency_ms');

export function recordServerStatus(status) {
  const isServerError = status >= 500;
  serverErrorRate.add(isServerError ? 1 : 0);
  if (isServerError) serverErrors.add(1);
}

export function buildSummary(data) {
  const keys = [
    'http_req_failed', 'http_req_duration',
    'hold_success_rate', 'hold_conflict_rate', 'server_error_rate',
    'lock_success_count', 'lock_conflict_count',
    'race_success_count', 'race_conflict_count',
    'queue_allowed_count', 'queue_in_queue_count',
    'checkout_latency_ms', 'join_latency_ms',
    'hold_latency_ms', 'stress_latency_ms'
  ];
  const metrics = {};
  for (const k of keys) {
    if (data.metrics[k]) metrics[k] = data.metrics[k];
  }
  return { metrics };
}

