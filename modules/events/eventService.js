const eventRepository = require('./eventRepository');
const AppError = require('../errorHandling/AppError');
const imageHelper = require('../../utils/imageHelper');
class EventService {
  async getAllPublished() {
    return eventRepository.findAllPublished();
  }

  async getById(id) {
    const event = await eventRepository.findById(id);
    if (!event) throw new AppError('Sự kiện không tồn tại', 404);
    return event;
  }

  async create({ title, description, start_time, location, category_id, zones, adminId }) {
    // Không cần Bước 1 & 2 nữa. Nếu lọt được vào đây, dữ liệu CHẮC CHẮN ĐÃ CHUẨN 100%.

    // 1. Map dữ liệu Zones và Seats
    const zonesDataToInsert = zones.map(z => ({
      name: z.name,
      price: z.price, // Zod đã ép sẵn thành số Float
      total_seats: z.seats.length,
      seats: {
        create: z.seats.map(s => ({
          row_label: s.row_label,
          seat_number: s.seat_number, // Zod đã ép sẵn thành số Int
          status: 'AVAILABLE'
        }))
      }
    }));

    // 2. Gọi Repository lưu toàn bộ trong 1 Transaction
    const event = await eventRepository.createFullEvent({
      title,
      description: description || '',
      start_time: new Date(start_time), // Zod đã xác nhận đây là chuỗi ngày hợp lệ
      location,
      status: 'PUBLISHED',
      admin_id: adminId,
      category_id: category_id || null, // 🌟 MỚI: Truyền ID danh mục nếu có
      zones: {
        create: zonesDataToInsert
      }
    });

    return { eventId: event.id };
  }

  async updateImage(eventId, { image_url }) {
    // Không cần check !image_url ở đây nữa
    const event = await eventRepository.findById(eventId);
    if (!event) throw new AppError('Sự kiện không tồn tại', 404);

    return eventRepository.update(eventId, { image_url });
  }

  /**
   * Soft Delete Event
   * Thay vì xóa thật, ta cập nhật status → 'DELETED'.
   * Global filter trong database.js sẽ tự động loại event này khỏi mọi query read.
   */
  async deleteEvent(eventId) {
    const event = await eventRepository.findById(eventId);
    if (!event) throw new AppError('Sự kiện không tồn tại', 404);

    // Guard: đã bị xóa mềm từ trước (trường hợp bypass filter)
    if (event.status === 'DELETED') {
      throw new AppError('Sự kiện đã bị xóa trước đó', 400);
    }

    await eventRepository.softDelete(eventId);
  }
}

module.exports = new EventService();