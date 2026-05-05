const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const AppError = require('../modules/errorHandling/AppError');

// ─── Cấu hình mặc định ───────────────────────────────────────────────────────
const DEFAULT_CONFIG = {
  events: {
    width: 1200,
    height: 630,   // Tỉ lệ OG Image chuẩn 16:9
    quality: 80,
    outputDir: path.join(process.cwd(), 'public', 'img', 'events'),
    format: 'webp',
  },
  avatars: {
    width: 400,
    height: 400,
    quality: 85,
    outputDir: path.join(process.cwd(), 'public', 'img', 'avatars'),
    format: 'webp',
  },
};

// ─── Đảm bảo thư mục lưu trữ tồn tại ───────────────────────────────────────
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Xử lý và lưu ảnh từ Buffer vào ổ cứng.
 *
 * @param {Buffer}  buffer      - Buffer ảnh thô từ req.file.buffer (do Multer cung cấp)
 * @param {string}  type        - Loại ảnh: 'events' | 'avatars'
 * @param {string}  [filename]  - Tên file tùy chọn. Nếu không truyền, sẽ tự sinh theo timestamp.
 * @returns {Promise<string>}   - Đường dẫn public tương đối để lưu vào DB (vd: /img/events/abc.webp)
 *
 * @example
 * // Trong controller hoặc service:
 * const imagePath = await imageHelper.saveImage(req.file.buffer, 'events');
 * await eventService.updateImage(eventId, { image_url: imagePath });
 */
const saveImage = async (buffer, type = 'events', filename = null) => {
  const config = DEFAULT_CONFIG[type];

  if (!config) {
    throw new AppError(`Loại ảnh không hợp lệ: "${type}". Chỉ hỗ trợ: ${Object.keys(DEFAULT_CONFIG).join(', ')}.`, 400);
  }

  // Đảm bảo thư mục output tồn tại
  ensureDirExists(config.outputDir);

  // Sinh tên file nếu không được truyền
  const finalFilename = filename
    ? `${filename}.${config.format}`
    : `${type}-${Date.now()}-${Math.round(Math.random() * 1e9)}.${config.format}`;

  const outputPath = path.join(config.outputDir, finalFilename);

  // Xử lý ảnh với Sharp: resize + compress + convert format
  await sharp(buffer)
    .resize(config.width, config.height, {
      fit: 'cover',        // Cắt để vừa khung, giữ tỉ lệ, không méo ảnh
      position: 'center',  // Căn giữa vùng cắt
    })
    .toFormat(config.format, { quality: config.quality })
    .toFile(outputPath);

  // Trả về đường dẫn URL tương đối (để lưu vào DB, dùng trong frontend)
  return `/img/${type}/${finalFilename}`;
};

/**
 * Xóa file ảnh ra khỏi ổ cứng.
 * Dùng khi cập nhật ảnh mới (xóa ảnh cũ) hoặc khi xóa resource.
 *
 * @param {string|null} imageUrl - Đường dẫn tương đối của ảnh cần xóa (vd: /img/events/abc.webp)
 *                                 Nếu null/undefined → bỏ qua (không throw lỗi)
 *
 * @example
 * // Khi admin cập nhật ảnh event:
 * await imageHelper.deleteImage(event.image_url); // Xóa ảnh cũ
 * const newUrl = await imageHelper.saveImage(req.file.buffer, 'events');
 */
const deleteImage = (imageUrl) => {
  if (!imageUrl) return; // Không có ảnh → bỏ qua

  // Chuyển đường dẫn tương đối sang đường dẫn tuyệt đối trên ổ cứng
  const absolutePath = path.join(process.cwd(), 'public', imageUrl);

  if (fs.existsSync(absolutePath)) {
    fs.unlink(absolutePath, (err) => {
      if (err) {
        // Log lỗi nhưng không throw — việc xóa ảnh cũ thất bại không nên crash app
        console.error(`[imageHelper] Lỗi khi xóa ảnh "${absolutePath}":`, err.message);
      }
    });
  }
};

/**
 * Lấy thông tin metadata của ảnh (kích thước, format, ...) từ Buffer.
 * Hữu ích để validate thêm hoặc để debug.
 *
 * @param {Buffer} buffer - Buffer ảnh thô
 * @returns {Promise<Object>} - Metadata của ảnh (width, height, format, size...)
 */
const getImageMetadata = async (buffer) => {
  return sharp(buffer).metadata();
};

module.exports = {
  saveImage,
  deleteImage,
  getImageMetadata,
};
