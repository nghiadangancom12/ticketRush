const express = require('express');
const router = express.Router();
const categoryController = require('./categoryController');
const { verifyToken, restrictTo } = require('../../middlewares/authMiddleware');
const validate = require('../../utils/validate');
const categorySchema = require('./categorySchema');
const { uploadSingleImage } = require('../../middlewares/uploadImageMiddleware');

router.route('/')
  .get(categoryController.getAll)
  .post(verifyToken, restrictTo('ADMIN'), validate(categorySchema.createCategorySchema), categoryController.createCategory);

router.route('/:id')
  .get(categoryController.getOne)
  .patch(verifyToken, restrictTo('ADMIN'), validate(categorySchema.updateCategorySchema), categoryController.updateCategory)
  .delete(verifyToken, restrictTo('ADMIN'), categoryController.deleteCategory);

router.patch(
  '/:id/image',
  verifyToken,
  restrictTo('ADMIN'),
  uploadSingleImage('image'),
  categoryController.updateImage
);

module.exports = router;
