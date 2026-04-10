const eventRepository = require('./eventRepository');
const AppError = require('../errorHandling/AppError');

class EventService {
  async getAllPublished() {
    return eventRepository.findAllPublished();
  }

  async getById(id) {
    const event = await eventRepository.findById(id);
    if (!event) throw new AppError('Event not found', 404);
    return event;
  }

  async create({ title, description, start_time, location, zones, adminId }) {// 1. KIỂM TRA TỔNG QUAN
    if (!title || !start_time || !location || !zones?.length) {
      throw new AppError('Thiếu thông tin sự kiện hoặc khu vực ghế.', 400);
    }

    // 2. TIỀN KIỂM TRA (PRE-VALIDATION): Dò lỗi trước khi ghi vào DB
    // Mục đích: Nếu dữ liệu rác, chặn ngay lập tức để không tạo Event lỗi.
    for (const z of zones) {
      if (!z.name) throw new AppError('Tên khu vực (zone) không được để trống.', 400);
      
      const parsedPrice = parseFloat(z.price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        throw new AppError(`Giá tiền của khu vực ${z.name} không hợp lệ.`, 400);
      }

      const seatsArray = z.seats || [];
      for (const s of seatsArray) {
        const parsedSeatNumber = parseInt(s.seat_number, 10);
        if (!s.row_label || isNaN(parsedSeatNumber)) {
          throw new AppError(`Dữ liệu ghế trong khu ${z.name} bị sai định dạng (row_label hoặc seat_number).`, 400);
        }
      }
    }
//3
    const zonesDataToInsert = zones.map(z => {
      const seatsArray = z.seats || [];
      
      return {
        name: z.name,
        price: parseFloat(z.price),
        total_seats: seatsArray.length,
        // Yêu cầu Prisma tự động tạo luôn các ghế thuộc về Zone này
        seats: {
          create: seatsArray.map(s => ({
            row_label: s.row_label,
            seat_number: parseInt(s.seat_number, 10),
            status: 'AVAILABLE'
          }))
        }
      };
    });

    // ==========================================
    // 4. GỌI REPOSITORY LƯU TẤT CẢ TRONG 1 LẦN (TRANSACTION)
    // ==========================================
    // Nếu có bất kỳ lỗi gì xảy ra ở đây, Prisma sẽ tự động Rollback (Hủy) toàn bộ,
    // đảm bảo không bao giờ có Event rác bị sinh ra.
    const event = await eventRepository.createFullEvent({
      title,
      description: description || '',
      start_time: new Date(start_time),
      location,
      status: 'PUBLISHED',
      admin_id: adminId,
      // Nhét nguyên mảng Zones (đã ngậm sẵn Seats) vào đây
      zones: {
        create: zonesDataToInsert
      }
    });

    return { eventId: event.id };}

  async updateImage(eventId, { image_url }) {
    if (!image_url) {
      throw new AppError('Image URL is required', 400);
    }

    const event = await eventRepository.findById(eventId);
    if (!event) throw new AppError('Event not found', 404);

    return eventRepository.update(eventId, { image_url });
  }
}

module.exports = new EventService();
