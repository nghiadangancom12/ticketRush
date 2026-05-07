const prisma = require('../../config/database');

class CategoryRepository {
  async findAll(prismaArgs) {
    const [data, total] = await Promise.all([
      prisma.categories.findMany(prismaArgs),
      prisma.categories.count({ where: prismaArgs.where })
    ]);
    return { data, total };
  }

  async findById(id) {
    return prisma.categories.findUnique({
      where: { id }
    });
  }

  async findByName(name) {
    return prisma.categories.findFirst({
      where: { name }
    });
  }

  async create(data) {
    return prisma.categories.create({
      data
    });
  }

  async update(id, data) {
    return prisma.categories.update({
      where: { id },
      data
    });
  }

  async delete(id) {
    return prisma.categories.delete({
      where: { id }
    });
  }
}

module.exports = new CategoryRepository();
