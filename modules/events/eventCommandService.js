const eventRepository = require('./eventRepository');
const AppError = require('../errorHandling/AppError');
const redis = require('../../config/redis');
const axios = require('axios');

class EventCommandService {
  /**
   * CQRS Command Side: Tạo sự kiện mới và nạp chủ động (Proactive Push) vào Read Model + Provision seats sang booking-service
   */
  async create({ title, description, start_time, location, category_id, zones, adminId }) {
    const zonesDataToInsert = zones.map(z => ({
      name: z.name,
      price: z.price, 
      total_seats: z.seats.length,
      seats: {
        create: z.seats.map(s => ({
          row_label: s.row_label,
          seat_number: s.seat_number, 
          status: 'AVAILABLE'
        }))
      }
    }));

    const event = await eventRepository.createFullEvent({
      title,
      description: description || '',
      start_time: new Date(start_time), 
      location,
      status: 'PUBLISHED',
      admin_id: adminId,
      category_id: category_id || null, 
      zones: {
        create: zonesDataToInsert
      }
    });

    // 🌟 Provision Seats sang booking_db với thông tin đã denormalize (zone_name, zone_price, event_id)
    try {
      const fullEvent = await eventRepository.findById(event.id);
      if (fullEvent && fullEvent.zones) {
        const denormalizedSeats = [];
        fullEvent.zones.forEach(z => {
          if (z.seats) {
            z.seats.forEach(s => {
              denormalizedSeats.push({
                id: s.id,
                zone_id: z.id,
                zone_name: z.name,
                zone_price: Number(z.price),
                event_id: event.id,
                row_label: s.row_label,
                seat_number: s.seat_number,
                status: 'AVAILABLE'
              });
            });
          }
        });

        const bookingServiceUrl = process.env.BOOKING_SERVICE_URL || 'http://localhost:3040';
        await axios.post(`${bookingServiceUrl}/api/booking/internal/provision-seats`, {
          seats: denormalizedSeats
        }, { timeout: 2000 });
      }
    } catch (err) {
      console.error('[EventCommandService] ⚠️ Lỗi provision seats sang booking-service:', err.message);
    }

    // Proactive Push: Cập nhật đè dữ liệu mới nhất vào Redis Read Model thay vì xóa trắng
    try {
      const allPublished = await eventRepository.findAllPublished();
      await redis.set('cache:events:published', JSON.stringify(allPublished), 'EX', 300);
    } catch (err) {
      console.error('[EventCommandService] ⚠️ Lỗi cập nhật Redis Read Model sau khi tạo event:', err.message);
    }

    return { eventId: event.id };
  }

  /**
   * CQRS Command Side: Cập nhật ảnh đại diện sự kiện và cập nhật đè Read Model
   */
  async updateImage(eventId, { image_url }) {
    const event = await eventRepository.findById(eventId);
    if (!event) throw new AppError('Sự kiện không tồn tại', 404);

    const updated = await eventRepository.update(eventId, { image_url });

    // Proactive Push: Nạp lại bản cập nhật vào các Redis Read Models
    try {
      const [allPublished, freshEvent, freshLanding] = await Promise.all([
        eventRepository.findAllPublished(),
        eventRepository.findById(eventId),
        eventRepository.findLandingInfoById(eventId),
      ]);

      await redis.set('cache:events:published', JSON.stringify(allPublished), 'EX', 300);
      if (freshEvent) await redis.set(`cache:event:${eventId}`, JSON.stringify(freshEvent), 'EX', 300);
      if (freshLanding) {
        const minPrice = freshLanding.zones.length > 0 ? Math.min(...freshLanding.zones.map(z => Number(z.price))) : 0;
        const landingInfo = {
          id: freshLanding.id,
          title: freshLanding.title,
          image_url: freshLanding.image_url,
          description: freshLanding.description,
          starting_price: minPrice,
          zone_prices: freshLanding.zones.map(z => ({ name: z.name, price: Number(z.price) })),
          start_time: freshLanding.start_time,
          location: freshLanding.location,
        };
        await redis.set(`cache:event:landing:${eventId}`, JSON.stringify(landingInfo), 'EX', 300);
      }
    } catch (err) {
      console.error('[EventCommandService] ⚠️ Lỗi cập nhật đè Read Models:', err.message);
    }

    return updated;
  }

  /**
   * CQRS Command Side: Soft Delete sự kiện và đồng bộ đè Read Model
   */
  async deleteEvent(eventId) {
    const event = await eventRepository.findById(eventId);
    if (!event) throw new AppError('Sự kiện không tồn tại', 404);
    if (event.status === 'DELETED') {
      throw new AppError('Sự kiện đã bị xóa trước đó', 400);
    }

    await eventRepository.softDelete(eventId);

    // Proactive Push: Cập nhật đè Read Model danh sách mới
    try {
      const allPublished = await eventRepository.findAllPublished();
      await redis.set('cache:events:published', JSON.stringify(allPublished), 'EX', 300);
      await redis.del(`cache:event:${eventId}`);
      await redis.del(`cache:event:landing:${eventId}`);
    } catch (err) {
      console.error('[EventCommandService] ⚠️ Lỗi cập nhật Read Model sau delete:', err.message);
    }
  }
}

module.exports = new EventCommandService();
