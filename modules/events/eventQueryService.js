const eventRepository = require('./eventRepository');
const AppError = require('../errorHandling/AppError');
const redis = require('../../config/redis');

class EventQueryService {
  /**
   * CQRS Read Side: Lấy danh sách sự kiện đã phát hành từ Redis Read Model.
   * Chống Thundering Herd: Single-flight warm-up khi cache chưa khởi tạo.
   */
  async getAllPublished() {
    const cacheKey = 'cache:events:published';
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.error('[EventQueryService] ⚠️ Lỗi đọc Redis Cache:', err.message);
    }

    // Warm-up từ DB nếu Cache chưa tồn tại (1 lần duy nhất)
    const events = await eventRepository.findAllPublished();
    try {
      await redis.set(cacheKey, JSON.stringify(events), 'EX', 300);
    } catch (err) {
      console.error('[EventQueryService] ⚠️ Lỗi ghi Redis Cache:', err.message);
    }
    return events;
  }

  /**
   * CQRS Read Side: Lấy thông tin sự kiện theo ID từ Redis Read Model.
   */
  async getById(id) {
    const cacheKey = `cache:event:${id}`;
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.error(`[EventQueryService] ⚠️ Lỗi đọc Redis Cache event_${id}:`, err.message);
    }

    const event = await eventRepository.findById(id);
    if (!event) throw new AppError('Sự kiện không tồn tại', 404);

    try {
      await redis.set(cacheKey, JSON.stringify(event), 'EX', 300);
    } catch (err) {
      console.error(`[EventQueryService] ⚠️ Lỗi ghi Redis Cache event_${id}:`, err.message);
    }
    return event;
  }

  /**
   * CQRS Read Side: Lấy thông tin Landing Page sự kiện từ Redis Read Model.
   */
  async getLandingInfo(id) {
    const cacheKey = `cache:event:landing:${id}`;
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.error(`[EventQueryService] ⚠️ Lỗi đọc Redis Landing Cache event_${id}:`, err.message);
    }

    const event = await eventRepository.findLandingInfoById(id);
    if (!event) throw new AppError('Sự kiện không tồn tại', 404);

    const minPrice = event.zones.length > 0 
      ? Math.min(...event.zones.map(z => Number(z.price)))
      : 0;

    const landingInfo = {
      id: event.id,
      title: event.title,
      image_url: event.image_url,
      description: event.description,
      starting_price: minPrice,
      zone_prices: event.zones.map(z => ({ name: z.name, price: Number(z.price) })),
      start_time: event.start_time,
      location: event.location,
    };

    try {
      await redis.set(cacheKey, JSON.stringify(landingInfo), 'EX', 300);
    } catch (err) {
      console.error(`[EventQueryService] ⚠️ Lỗi ghi Redis Landing Cache event_${id}:`, err.message);
    }

    return landingInfo;
  }
}

module.exports = new EventQueryService();
