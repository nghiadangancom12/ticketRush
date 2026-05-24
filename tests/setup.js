// File này chạy TRƯỚC mọi test file.
// Đặt biến môi trường cần thiết cho môi trường test ở đây.
process.env.DISABLE_REDIS = 'true';
process.env.NODE_ENV = 'test';
