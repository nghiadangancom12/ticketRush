const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // 🔑 Thứ tự ưu tiên: Authorization Header > Cookie
  let token = null;

  // 1️⃣ Kiểm tra Authorization Header trước (format: "Bearer <token>")
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  // 2️⃣ Nếu không có Authorization Header, kiểm tra Cookie (từ cross-domain request)
  if (!token && req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(403).json({ message: 'No token provided! Vui lòng đăng nhập.' });
  }

  // Xác thực token
  jwt.verify(token, process.env.JWT_SECRET || 'ticketrush_secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized! Token không hợp lệ hoặc hết hạn.' });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ message: 'Require Admin Role!' });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin
};
