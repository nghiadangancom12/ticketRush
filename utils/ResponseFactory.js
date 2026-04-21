class ResponseFactory {
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      status: 'success',
      message,
      data
    });
  }

  static error(res, message = 'Error', statusCode = 400, errors = null) {
    // Tự động phân loại 'fail' (4xx) hay 'error' (500) đồng bộ với AppError
    const statusType = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    return res.status(statusCode).json({
      status: statusType,
      message,
      ...(errors && { errors }) // Nếu có errors (ví dụ từ Zod) thì mới đưa vào JSON trả về
    });
  }
}

module.exports = ResponseFactory;