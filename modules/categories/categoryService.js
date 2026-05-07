const categoryRepository = require('./categoryRepository');
const AppError = require('../errorHandling/AppError');
const PrismaApiFeatures = require('../../utils/PrismaApiFeatures');
const imageHelper = require('../../utils/imageHelper');

class CategoryService {
  async getAllCategories(query) {
    const features = new PrismaApiFeatures(query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const prismaArgs = features.getArgs();
    
    // Fallback if no sort is provided, sort by name ascending by default
    if (!query.sort) {
       prismaArgs.orderBy = { name: 'asc' };
    }

    const { page, limit } = features.getPagination();
    const { data, total } = await categoryRepository.findAll(prismaArgs);

    return {
      results: data.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data
    };
  }

  async getCategoryById(id) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new AppError('Danh mục không tồn tại', 404);
    return category;
  }

  async createCategory(data) {
    const existing = await categoryRepository.findByName(data.name.trim());
    if (existing) throw new AppError('Tên danh mục đã tồn tại', 400);

    return categoryRepository.create({
      name: data.name.trim(),
      description: data.description?.trim() || null
    });
  }

  async updateCategory(id, data) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new AppError('Danh mục không tồn tại', 404);

    if (data.name) {
      const existing = await categoryRepository.findByName(data.name.trim());
      if (existing && existing.id !== id) {
        throw new AppError('Tên danh mục đã tồn tại', 400);
      }
      data.name = data.name.trim();
    }
    
    if (data.description !== undefined) {
       data.description = data.description?.trim() || null;
    }

    return categoryRepository.update(id, data);
  }

  async deleteCategory(id) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new AppError('Danh mục không tồn tại', 404);

    await categoryRepository.delete(id);
  }

  async updateImage(id, file) {
    if (!file) throw new AppError('Vui lòng gửi kèm file ảnh!', 400);
    
    const category = await categoryRepository.findById(id);
    if (!category) throw new AppError('Danh mục không tồn tại', 404);

    const newImageUrl = await imageHelper.saveImage(file.buffer, 'categories');
    const updated = await categoryRepository.update(id, { image_url: newImageUrl });

    if (category.image_url) {
      imageHelper.deleteImage(category.image_url);
    }

    return updated;
  }
}

module.exports = new CategoryService();
