const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const AppError = require('../errors/AppError');

const DEFAULT_CONFIG = {
  events: {
    width: 1200,
    height: 630,
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
  categories: {
    width: 800,
    height: 400,
    quality: 80,
    outputDir: path.join(process.cwd(), 'public', 'img', 'categories'),
    format: 'webp',
  },
};

const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const saveImage = async (buffer, type = 'events', filename = null) => {
  const config = DEFAULT_CONFIG[type];
  if (!config) {
    throw new AppError(`Loại ảnh không hợp lệ: "${type}". Chỉ hỗ trợ: ${Object.keys(DEFAULT_CONFIG).join(', ')}.`, 400);
  }
  ensureDirExists(config.outputDir);
  const finalFilename = filename
    ? `${filename}.${config.format}`
    : `${type}-${Date.now()}-${Math.round(Math.random() * 1e9)}.${config.format}`;
  const outputPath = path.join(config.outputDir, finalFilename);
  await sharp(buffer)
    .resize(config.width, config.height, { fit: 'cover', position: 'center' })
    .toFormat(config.format, { quality: config.quality })
    .toFile(outputPath);
  return `/img/${type}/${finalFilename}`;
};

const deleteImage = (imageUrl) => {
  if (!imageUrl) return;
  if (/^https?:\/\//i.test(imageUrl)) return;
  const relativePath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
  const absolutePath = path.join(process.cwd(), 'public', relativePath);
  if (fs.existsSync(absolutePath)) {
    fs.unlink(absolutePath, (err) => {
      if (err) console.error(`[imageHelper] Lỗi khi xóa ảnh "${absolutePath}":`, err.message);
    });
  }
};

const getImageMetadata = async (buffer) => sharp(buffer).metadata();

module.exports = { saveImage, deleteImage, getImageMetadata };
