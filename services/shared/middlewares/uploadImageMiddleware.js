const multer = require('multer');
const AppError = require('../errors/AppError');

const imageFileFilter = (req, file, cb) => {
  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new AppError('Định dạng file không hợp lệ! Chỉ chấp nhận: JPEG, PNG, WEBP.', 400), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 7 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

exports.uploadSingleImage = (fieldName = 'image') =>
  (req, res, next) => {
    const multerMiddleware = upload.single(fieldName);
    multerMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') return next(new AppError('File ảnh quá lớn! Giới hạn tối đa là 7MB.', 400));
        return next(new AppError(`Lỗi upload: ${err.message}`, 400));
      }
      if (err) return next(err);
      next();
    });
  };

exports.uploadMultipleImages = (fieldName = 'images', maxCount = 5) =>
  (req, res, next) => {
    const multerMiddleware = upload.array(fieldName, maxCount);
    multerMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') return next(new AppError('Một hoặc nhiều file ảnh vượt quá giới hạn 5MB.', 400));
        if (err.code === 'LIMIT_UNEXPECTED_FILE') return next(new AppError(`Số lượng ảnh vượt quá giới hạn cho phép (${maxCount} ảnh).`, 400));
        return next(new AppError(`Lỗi upload: ${err.message}`, 400));
      }
      if (err) return next(err);
      next();
    });
  };
