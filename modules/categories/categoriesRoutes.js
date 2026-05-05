const express = require('express');
const router = express.Router();
const prisma = require('../../config/database');
const { verifyToken, restrictTo } = require('../../middlewares/authMiddleware');
const ResponseFactory = require('../../utils/ResponseFactory');
const catchAsync = require('../errorHandling/catchAsync');
const AppError = require('../errorHandling/AppError');
const { uploadSingleImage } = require('../../middlewares/uploadImageMiddleware');
const imageHelper = require('../../utils/imageHelper');

// GET /api/categories — public, list all categories
router.get('/', catchAsync(async (req, res) => {
  const cats = await prisma.categories.findMany({ orderBy: { name: 'asc' } });
  ResponseFactory.success(res, cats);
}));

// POST /api/categories — admin only, create new category
router.post('/', verifyToken, restrictTo('ADMIN'), catchAsync(async (req, res) => {
  const { name, description } = req.body;
  if (!name || !name.trim()) throw new AppError('Tên thể loại không được để trống.', 400);
  const cat = await prisma.categories.create({
    data: { name: name.trim(), description: description?.trim() || null }
  });
  ResponseFactory.success(res, cat, 'Tạo thể loại thành công!', 201);
}));

// PATCH /api/categories/:id/image — admin only, upload category image
router.patch('/:id/image', verifyToken, restrictTo('ADMIN'), uploadSingleImage('image'), catchAsync(async (req, res) => {
  if (!req.file) throw new AppError('Vui lòng gửi kèm file ảnh!', 400);
  const current = await prisma.categories.findUnique({ where: { id: req.params.id } });
  if (!current) throw new AppError('Không tìm thấy thể loại.', 404);
  const newImageUrl = await imageHelper.saveImage(req.file.buffer, 'categories');
  const updated = await prisma.categories.update({
    where: { id: req.params.id },
    data: { image_url: newImageUrl },
  });
  if (current.image_url) imageHelper.deleteImage(current.image_url);
  ResponseFactory.success(res, updated, 'Cập nhật ảnh thể loại thành công!');
}));

// DELETE /api/categories/:id — admin only
router.delete('/:id', verifyToken, restrictTo('ADMIN'), catchAsync(async (req, res) => {
  await prisma.categories.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

module.exports = router;
