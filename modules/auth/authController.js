// src/controllers/auth.controller.js
const catchAsync = require('../errorHandling/catchAsync');
const ResponseFactory = require('../../utils/ResponseFactory');
const authService = require('./authService');

class AuthController {
  // Hàm Helper giúp chuẩn hóa việc gắn Cookie 
  _setTokenCookie(res, token) {
    // Ép kiểu về số nguyên, nếu lỗi hoặc không có thì mặc định là 1 (ngày)
    const expiresInDays = parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) || 1;

    const cookieOptions = {
      expires: new Date(
        Date.now() + expiresInDays * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      sameSite: 'none', 
      secure: true, 
    };

    res.cookie('jwt', token, cookieOptions);
  }
  register = catchAsync(async (req, res) => {
    // 1. Gọi Service
    const { user, token } = await authService.register(req.body);

    // 2. Gắn Cookie
    this._setTokenCookie(res, token);

    // Xóa password trước khi gửi về client (phòng hờ Service chưa xóa)
    user.password = undefined;

    // 3. Trả Response
    ResponseFactory.success(
      res,
      { user, accessToken: token }, // Trả kèm token ở body nếu Front-end/App cần
      'Đăng ký tài khoản thành công',
      201
    );
  });

  login = catchAsync(async (req, res) => {
    // 1. Gọi Service
    const { user, token } = await authService.login(req.body);

    // 2. Gắn Cookie
    this._setTokenCookie(res, token);

    // Xóa password trước khi gửi về client
    user.password = undefined;

    // 3. Trả Response
    ResponseFactory.success(
      res,
      { user, accessToken: token },
      'Đăng nhập thành công',
      200
    );
  });

  logout = (req, res) => {
    // Ghi đè bằng một cookie rác, hết hạn ngay lập tức (10 giây)
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      sameSite: 'none',
      secure: true
    });

    ResponseFactory.success(res, null, 'Đăng xuất thành công', 200);
  };
}

module.exports = new AuthController();