class ResponseFactory {
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      status: 'success',
      message,
      data
    });
  }

  static error(res, message = 'Error', statusCode = 400, errors = null) {
    const statusType = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    return res.status(statusCode).json({
      status: statusType,
      message,
      ...(errors && { errors })
    });
  }
}

module.exports = ResponseFactory;
