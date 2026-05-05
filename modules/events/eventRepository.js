const prisma = require('../../config/database');

class EventRepository {
  async findAllPublished() {
    return prisma.events.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { start_time: 'asc' }
    });
  }

  async findById(id) {
    return prisma.events.findUnique({
      where: { id },
      include: {
        zones: {
          include: {
            seats: { orderBy: [{ row_label: 'asc' }, { seat_number: 'asc' }] }
          }
        }
      }
    });
  }

  async create(eventData) {
    return prisma.events.create({
      data: eventData
    });
  }

  async update(id, data) {
    return prisma.events.update({
      where: { id },
      data
    });
  }

  async createZone(zoneData) {
    return prisma.zones.create({
      data: zoneData
    });
  }

  async createManySeats(seatsData) {
    if (seatsData.length === 0) return [];
    return prisma.seats.createMany({ data: seatsData });
  }

  async createFullEvent(eventDataPayload) {
    // Prisma tự động chạy cái này dưới dạng Transaction (All or Nothing)
    return prisma.events.create({
      data: eventDataPayload
    });
  }

  /**
   * Soft Delete Event: Đổi status → 'DELETED' thay vì xóa hàng thật.
   * Global filter trong database.js sẽ tự ẩn record này khỏi mọi query read.
   * Dùng prisma.$queryRaw bypass để update ngay cả khi extension filter đang chạy.
   */
  async softDelete(id) {
    return prisma.events.update({
      where: { id },
      data: { status: 'DELETED' }
    });
  }
}

module.exports = new EventRepository();