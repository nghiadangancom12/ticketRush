# Neon vs PostgreSQL final k6 benchmark

## Ket qua tim nguong

Tu capacity finder tren Neon:

- Read-only dat den `50 read/s`: p95 `371.7ms`, 0% failed, 0% 5xx, 0% timeout.
- Read-only fail o `60 read/s`: read p95 `4248.0ms`, endpoint detail p95 `4911.7ms`.
- Write-only dat den `15 write/s`: hold p95 `1230.1ms`, return p95 `1441.3ms`, cycle p95 `3986.0ms`, 0% failed. Day la muc cao nhat da test, nen co the xem la `>=15 write/s`, chua phai tran tuyet doi.
- Mixed dat den `30 read/s + 5 write/s`: read p95 `321.3ms`, hold p95 `256.8ms`, cycle p95 `1192.0ms`, 0% failed.
- Mixed fail o `40 read/s + 8 write/s`: read p95 `5459.8ms`, cycle p95 `9051.8ms`.
- Mixed vo ro o `50 read/s + 10 write/s`: failed `12.33%`, 5xx `10.01%`, timeout `2.31%`.

Nguong hop ly de test web thuc te la `30 read/s + 5 write/s`. Hai bai read-only va write-only duoc giu lai de so rieng tung duong doc/ghi.

## Cac bai final

Tat ca bai final chay 5 phut va dung cung threshold:

- Read final: `50 read/s`.
- Write final: `15 write/s`.
- Mixed final: `30 read/s + 5 write/s`.

Threshold:

- read p95 < `2500ms`
- hold p95 < `4000ms`
- return p95 < `4000ms`
- write cycle p95 < `8000ms`
- failed request < `2%`
- 5xx < `1%`
- timeout < `0.1%`

## Chay voi Neon

Dung Neon branch/database rieng vi seed se reset du lieu k6.

```bash
npm run k6:neon:stack:up
npm run seed:k6:neon
npm run k6:neon:smoke
npm run k6:final:neon:read
npm run k6:final:neon:write
npm run k6:final:neon:mixed
```

Ket qua sinh ra trong:

- `tests/k6/artifacts/neon-final-read-summary.json`
- `tests/k6/artifacts/neon-final-write-summary.json`
- `tests/k6/artifacts/neon-final-mixed-summary.json`
- file `.html` cung ten de xem report.

Dung stack Neon:

```bash
npm run k6:neon:stack:down
```

## Chay voi PostgreSQL local

Khong chay stack Neon va PostgreSQL cung luc vi ca hai cung dung port `3000` va `6379`.

```bash
npm run k6:postgres:stack:up
npm run db:k6:postgres:migrate
npm run seed:k6:postgres
npm run k6:final:postgres:read
npm run k6:final:postgres:write
npm run k6:final:postgres:mixed
```

Ket qua sinh ra trong:

- `tests/k6/artifacts/postgres-final-read-summary.json`
- `tests/k6/artifacts/postgres-final-write-summary.json`
- `tests/k6/artifacts/postgres-final-mixed-summary.json`
- file `.html` cung ten de xem report.

Dung stack PostgreSQL:

```bash
npm run k6:postgres:stack:down
```

## Cach so sanh

So sanh theo thu tu uu tien:

1. `benchmark_request_failed_rate`
2. `benchmark_timeout_rate`
3. `benchmark_server_error_rate`
4. `benchmark_read_latency_ms p95`
5. `benchmark_hold_latency_ms p95`
6. `benchmark_return_latency_ms p95`
7. `benchmark_write_cycle_latency_ms p95`

Neu Neon va PostgreSQL deu fail o cung profile, bottleneck co kha nang nam o app/query/Redis/BullMQ hon la rieng database.

Neu PostgreSQL local pass ro nhung Neon fail, hay xem them Neon dashboard: compute CPU, connections, pooler wait, query latency, va storage/IO.

Neu Neon pass nhung latency cao hon PostgreSQL, do la expected mot phan vi Neon co network/TLS hop le hon so voi Postgres container local. Khi bao cao, nen ghi ro day la so sanh `local Postgres` voi `remote Neon`, khong phai hai database cung dat trong mot vung mang.

## Luu y seed token

File `tests/k6/artifacts/k6-tokens.json` phu thuoc vao database vua seed. Sau khi doi tu Neon sang PostgreSQL hoac nguoc lai, phai chay lai lenh seed tuong ung truoc khi test.
