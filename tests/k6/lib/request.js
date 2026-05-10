import http from 'k6/http';
import { check } from 'k6';
import { recordServerStatus } from './metrics.js';

export function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
}

export function request(method, url, payload, params = {}, expectedStatuses = []) {
  const finalParams = {
    ...params,
    headers: {
      ...(params.headers || {})
    }
  };
  if (expectedStatuses.length > 0) {
    finalParams.responseCallback = http.expectedStatuses(...expectedStatuses);
  }

  const body = payload === null || payload === undefined ? null : JSON.stringify(payload);
  const res = http.request(method, url, body, finalParams);
  recordServerStatus(res.status);

  if (expectedStatuses.length > 0) {
    check(res, {
      [`status in [${expectedStatuses.join(',')}]`]: (r) => expectedStatuses.includes(r.status)
    });
  }

  return res;
}
