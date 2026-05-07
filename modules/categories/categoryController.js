const catchAsync = require('../errorHandling/catchAsync');
const ResponseFactory = require('../../utils/ResponseFactory');
const categoryService = require('./categoryService');

exports.getAll = catchAsync(async (req, res) => {
  const result = await categoryService.getAllCategories(req.query);
  ResponseFactory.success(res, result);
});

exports.getOne = catchAsync(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  ResponseFactory.success(res, category);
});

exports.createCategory = catchAsync(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  ResponseFactory.success(res, category, 'Tạo danh mục thành công!', 201);
});

exports.updateCategory = catchAsync(async (req, res) => {
  const updated = await categoryService.updateCategory(req.params.id, req.body);
  ResponseFactory.success(res, updated, 'Cập nhật danh mục thành công!');
});

exports.deleteCategory = catchAsync(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  res.status(204).send();
});

exports.updateImage = catchAsync(async (req, res) => {
  const updated = await categoryService.updateImage(req.params.id, req.file);
  ResponseFactory.success(res, updated, 'Cập nhật ảnh danh mục thành công!');
});
