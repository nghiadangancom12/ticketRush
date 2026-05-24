# TicketRush k6 scripts for Neon

File `.env` hien tai co `DATABASE_URL` tro toi Neon pooled endpoint va `DIRECT_URL` tro toi Neon direct endpoint. Khong commit hoac in ra gia tri day du cua cac URL database.

## Chuan bi

Nen chay tren Neon branch/database rieng cho k6. Script seed k6 se `TRUNCATE` cac bang chinh va tao fixture co dinh cho event test.

```bash
npm run k6:neon:stack:up
npm run seed:k6:neon
```

Neu chay API thu cong thay vi Docker Compose, hay dam bao server dung `DATABASE_URL` Neon trong `.env`, Redis dang chay, va API o `http://localhost:3000`.

## Kich ban hien tai

Health check nhanh:

```bash
npm run k6:neon:smoke
```

Final benchmark de so sanh Neon voi PostgreSQL:

```bash
npm run k6:final:neon:read
npm run k6:final:neon:write
npm run k6:final:neon:mixed
```

Huong dan day du nam trong `tests/k6/NEON_POSTGRES_FINAL_BENCHMARK.md`.

## Metrics can xem

- `db_error_rate`, `db_error_count`: response 5xx co dau hieu loi Prisma/Postgres/Neon.
- `db_pool_pressure_rate`, `db_pool_pressure_count`: dau hieu pooler/connection bi ep.
- `request_timeout_rate`: timeout/network error tu phia client.
- `benchmark_read_latency_ms`: latency doc trong final benchmark.
- `benchmark_hold_latency_ms`: latency giu ghe trong final benchmark.
- `benchmark_return_latency_ms`: latency tra ghe trong final benchmark.
- `benchmark_write_cycle_latency_ms`: tong thoi gian cleanup + hold + return trong final benchmark.

Neu thay nhieu `429`, do la rate limit cua Express hoac queue limiter, khong phai gioi han Neon. Cac stack k6 da set `API_RATE_LIMIT_MAX` va `QUEUE_JOIN_RATE_LIMIT_MAX` cao rieng cho moi truong test.
