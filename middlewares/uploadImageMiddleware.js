const multer = require('multer');
const AppError = require('../modules/errorHandling/AppError');

// ─── 1. Bộ lọc kiểm tra định dạng file ──────────────────────────────────────
const imageFileFilter = (req, file, cb) => {
  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    // Trả về lỗi, Multer sẽ gắn lỗi này vào req và dừng pipeline
    return cb(
      new AppError(
        'Định dạng file không hợp lệ! Chỉ chấp nhận: JPEG, PNG, WEBP.',
        400
      ),
      false
    );
  }

  cb(null, true); // File hợp lệ → cho qua
};

// ─── 2. Cấu hình Multer: lưu vào RAM (MemoryStorage) ────────────────────────
const upload = multer({
  storage: multer.memoryStorage(), // Không lưu xuống ổ cứng, giữ nguyên trong RAM
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB
  },
  fileFilter: imageFileFilter,
});

// ─── 3. Export các middleware sẵn dùng ──────────────────────────────────────

/**
 * Middleware upload 1 ảnh duy nhất.
 * Tên field trong FormData phải là "image".
 *
 * Kết quả: req.file.buffer chứa Buffer của ảnh, sẵn sàng để imageHelper xử lý.
 *
 * @example
 * router.patch('/me/avatar', verifyToken, uploadSingleImage, usersController.updateAvatar);
 */
exports.uploadSingleImage = (fieldName = 'image') =>
  (req, res, next) => {
    const multerMiddleware = upload.single(fieldName);

    multerMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Lỗi từ nội bộ Multer (vd: vượt giới hạn dung lượng)
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('File ảnh quá lớn! Giới hạn tối đa là 5MB.', 400));
        }
        return next(new AppError(`Lỗi upload: ${err.message}`, 400));
      }

      if (err) {
        // Lỗi từ fileFilter (định dạng không hợp lệ) hoặc các lỗi khác
        return next(err);
      }

      next(); // Không có lỗi → đi tiếp vào Controller
    });
  };

/**
 * Middleware upload nhiều ảnh cùng lúc.
 * Dùng khi cần upload gallery hoặc nhiều field ảnh.
 *
 * @param {string} fieldName - Tên field trong FormData (default: 'images')
 * @param {number} maxCount  - Số lượng ảnh tối đa (default: 5)
 *
 * Kết quả: req.files là mảng các { buffer, originalname, mimetype, ... }
 *
 * @example
 * router.post('/gallery', verifyToken, uploadMultipleImages('images', 10), controller.uploadGallery);
 */
exports.uploadMultipleImages = (fieldName = 'images', maxCount = 5) =>
  (req, res, next) => {
    const multerMiddleware = upload.array(fieldName, maxCount);

    multerMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('Một hoặc nhiều file ảnh vượt quá giới hạn 5MB.', 400));
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new AppError(`Số lượng ảnh vượt quá giới hạn cho phép (${maxCount} ảnh).`, 400));
        }
        return next(new AppError(`Lỗi upload: ${err.message}`, 400));
      }

      if (err) {
        return next(err);
      }

      next();
    });
  };
