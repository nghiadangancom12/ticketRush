const { z } = require('zod');

exports.createCategorySchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Vui lòng nhập tên danh mục' }).min(1, 'Tên danh mục không được để trống'),
    description: z.string().optional()
  })
});

exports.updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Tên danh mục không được để trống').optional(),
    description: z.string().optional()
  })
});
