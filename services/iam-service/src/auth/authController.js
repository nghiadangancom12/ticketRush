const catchAsync = require('../../../shared/errors/catchAsync');
const ResponseFactory = require('../../../shared/utils/ResponseFactory');
const authService = require('./authService');

class AuthController {
  _setTokenCookie(res, token) {
    const expiresInDays = parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) || 1;
    const cookieOptions = {
      expires: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    };
    res.cookie('jwt', token, cookieOptions);
  }

  register = catchAsync(async (req, res) => {
    const { user, token } = await authService.register(req.body);
    this._setTokenCookie(res, token);
    user.password = undefined;
    ResponseFactory.success(res, { user, accessToken: token }, 'Đăng ký tài khoản thành công', 201);
  });

  login = catchAsync(async (req, res) => {
    const { user, token } = await authService.login(req.body);
    this._setTokenCookie(res, token);
    user.password = undefined;
    ResponseFactory.success(res, { user, accessToken: token }, 'Đăng nhập thành công', 200);
  });

  logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      sameSite: 'none',
      secure: true
    });
    ResponseFactory.success(res, null, 'Đăng xuất thành công', 200);
  };

  forgotPassword = catchAsync(async (req, res) => {
    await authService.forgotPassword(req.body.email, req.protocol, req.get('host'));
    ResponseFactory.success(res, null, 'Email đổi mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư.', 200);
  });

  resetPassword = catchAsync(async (req, res) => {
    const { user, token } = await authService.resetPassword(req.params.token, req.body.password);
    this._setTokenCookie(res, token);
    ResponseFactory.success(res, { user, accessToken: token }, 'Đổi mật khẩu thành công!', 200);
  });
}

module.exports = new AuthController();
