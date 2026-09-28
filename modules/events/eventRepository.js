const prisma = require('../../config/database-catalog');

class EventRepository {
  async findAllPublished() {
    return prisma.events.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { start_time: 'asc' },
      include: {
        categories: true,
        zones: { select: { id: true, name: true, price: true, total_seats: true } }
      }
    });
  }

  async findById(id) {
    return prisma.events.findUnique({
      where: { id },
      include: {
        categories: true,
        zones: { select: { id: true, name: true, price: true, total_seats: true } }
      }
    });
  }

  async findLandingInfoById(id) {
    return prisma.events.findUnique({
      where: { id },
      include: {
        zones: { select: { id: true, name: true, price: true } }
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

  async createFullEvent(eventDataPayload) {
    return prisma.events.create({
      data: eventDataPayload
    });
  }

  /**
   * Soft Delete Event: Đổi status → 'DELETED'
   */
  async softDelete(id) {
    return prisma.events.update({
      where: { id },
      data: { status: 'DELETED' }
    });
  }
}

module.exports = new EventRepository();
