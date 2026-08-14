const eventQueryService = require('./eventQueryService');
const eventCommandService = require('./eventCommandService');

/**
 * EventService Facade (CQRS Pattern)
 * Phân định rõ luồng Query (Read Side) và Command (Write Side)
 */
class EventService {
  // --- QUERY SIDE (READ MODEL) ---
  async getAllPublished() {
    return eventQueryService.getAllPublished();
  }

  async getById(id) {
    return eventQueryService.getById(id);
  }

  async getLandingInfo(id) {
    return eventQueryService.getLandingInfo(id);
  }

  // --- COMMAND SIDE (WRITE MODEL & PROACTIVE PUSH) ---
  async create(data) {
    return eventCommandService.create(data);
  }

  async updateImage(eventId, data) {
    return eventCommandService.updateImage(eventId, data);
  }

  async deleteEvent(eventId) {
    return eventCommandService.deleteEvent(eventId);
  }
}

module.exports = new EventService();