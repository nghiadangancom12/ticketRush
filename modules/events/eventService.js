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

  async getLandingInfo(id) {
    const event = await eventRepository.findLandingInfoById(id);
    if (!event) throw new AppError('Sự kiện không tồn tại', 404);

    const minPrice = event.zones.length > 0 
      ? Math.min(...event.zones.map(z => Number(z.price)))
      : 0;

    return {
      id: event.id,
      title: event.title,
      image_url: event.image_url,
      description: event.description,
      starting_price: minPrice,
      zone_prices: event.zones.map(z => ({ name: z.name, price: Number(z.price) })),
      start_time: event.start_time,
      location: event.location,
    };
  }

  async create({ title, description, start_time, location, category_id, zones, adminId }) {
    // 1. Map dữ liệu Zones và Seats
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

    return { eventId: event.id };
  }

  async updateImage(eventId, { image_url }) {
    // Không cần check !image_url ở đây nữa
    const event = await eventRepository.findById(eventId);
    if (!event) throw new AppError('Sự kiện không tồn tại', 404);

    return eventRepository.update(eventId, { image_url });
  }

  async deleteEvent(eventId) {
    const event = await eventRepository.findById(eventId);
    if (!event) throw new AppError('Sự kiện không tồn tại', 404);
    if (event.status === 'DELETED') {
      throw new AppError('Sự kiện đã bị xóa trước đó', 400);
    }

    await eventRepository.softDelete(eventId);
  }
}

module.exports = new EventService();