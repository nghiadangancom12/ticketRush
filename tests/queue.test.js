const request = require('supertest');
const app = require('../app'); 

// 1. Dùng ioredis-mock thay vì kết nối Redis thật
jest.mock('ioredis', () => require('ioredis-mock'));
const redis = require('../config/redis');
// 2. Mock (Giả lập) Middleware Auth để không cần phải tạo Token JWT thật mỗi lần test
jest.mock('../modules/auth/auth.middleware', () => ({
  verifyToken: (req, res, next) => {
    // Giả vờ như đã đăng nhập thành công với user_123
    req.user = { id: 'user_123' }; 
    next();
  },
  restrictTo: () => (req, res, next) => next(), // Giả vờ luôn có quyền Admin
  
  // 👉 THÊM DÒNG NÀY VÀO: Giả lập luôn hàm isAdmin cho qua trót lọt
  isAdmin: (req, res, next) => next(), 

}));

// Bắt đầu nhóm kịch bản Test cho Queue
describe('Kiểm thử API Virtual Queue', () => {
  
  // Trạng thái khởi tạo: Xóa sạch dữ liệu Redis mock TRƯỚC MỖI test
  beforeEach(async () => {
    await redis.flushall();
  });

  // Đóng kết nối sau khi test xong để Jest không bị treo
  afterAll(async () => {
    await redis.quit();
  });

  // --- KỊCH BẢN 1 ---
  it('Admin có thể BẬT hàng đợi thành công', async () => {
    const res = await request(app)
      .post('/api/queue/admin/EVENT_TEST/toggle')
      .send({ isActive: true });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('Đã Bật');

    // Kiểm tra trực tiếp dưới "Database" xem cờ đã được bật chưa
    const activeFlag = await redis.get('queue:active:EVENT_TEST');
    expect(activeFlag).toBe('1');
  });

  // --- KỊCH BẢN 2 ---
  it('User xin xếp hàng sẽ nhận mã 202 Accepted và vị trí đầu tiên', async () => {
    // Tiền điều kiện: Bật hàng đợi lên trước
    await redis.set('queue:active:EVENT_TEST', '1');

    const res = await request(app)
      .post('/api/queue/EVENT_TEST/join');

    // Mong đợi kết quả là 202 (Đang xếp hàng)
    expect(res.statusCode).toBe(202);
    // Mong đợi vị trí (position) trả về là 1
    expect(res.body.data.position).toBe(1); 
  });

  // --- KỊCH BẢN 3 ---
  it('Nếu Queue tắt, User gọi joinQueue sẽ nhận báo no_queue', async () => {
    // Không bật cờ trong Redis
    const res = await request(app)
      .post('/api/queue/EVENT_TEST/join');

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('no_queue');
  });
});