jest.mock('ioredis', () => require('ioredis-mock'));
const request = require('supertest');
const jwt = require('jsonwebtoken');

const authApp = require('../services/auth-service/app');
const eventCatalogApp = require('../services/event-catalog-service/app');
const bookingApp = require('../services/booking-service/app');
const userApp = require('../services/user-service/app');
const queueApp = require('../services/queue-service/app');

describe('Microservices Complete Architecture Integration Tests', () => {
  describe('Phase 1: Auth Service (:3010)', () => {
    it('GET /health tra ve status ok', async () => {
      const res = await request(authApp).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.service).toBe('auth-service');
    });

    it('GET /api/auth/verify voi token hop le tra ve decoded payload', async () => {
      process.env.JWT_SECRET = 'test_secret';
      const token = jwt.sign({ id: 'user_456', role: 'CUSTOMER' }, 'test_secret');

      const res = await request(authApp)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer ' + token);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.id).toBe('user_456');
      expect(res.body.data.role).toBe('CUSTOMER');
    });

    it('GET /api/auth/verify khong co token tra ve 401', async () => {
      const res = await request(authApp).get('/api/auth/verify');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('Phase 2: Event Catalog Service (:3030)', () => {
    it('GET /health tra ve status ok', async () => {
      const res = await request(eventCatalogApp).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.service).toBe('event-catalog-service');
    });
  });

  describe('Phase 3: Booking & Order Service (:3040) & Queue Integration', () => {
    it('GET /health tra ve status ok', async () => {
      const res = await request(bookingApp).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.service).toBe('booking-service');
    });

    it('GET /api/queue/:eventId/session/:userId tra ve session verification status', async () => {
      const res = await request(queueApp).get('/api/queue/EVT123/session/USR123');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.isAllowed).toBe(true);
      expect(res.body.data.active).toBe(false);
    });
  });

const authRepository = require('../modules/auth/authRepository');

  describe('Phase 4: User & Customer Service (:3020)', () => {
    it('GET /health tra ve status ok', async () => {
      const res = await request(userApp).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.service).toBe('user-service');
    });

    it('GET /api/users/me/tickets tra ve 503 khi Booking Service khong phan hoi', async () => {
      process.env.JWT_SECRET = 'test_secret';
      process.env.BOOKING_SERVICE_URL = 'http://localhost:59999'; // Non-existent port to force connection failure
      const testUserId = '11111111-1111-1111-1111-111111111111';
      const token = jwt.sign({ id: testUserId, role: 'CUSTOMER' }, 'test_secret');

      jest.spyOn(authRepository, 'findById').mockResolvedValue({ id: testUserId, role: 'CUSTOMER' });

      const res = await request(userApp)
        .get('/api/users/me/tickets')
        .set('Authorization', 'Bearer ' + token);

      expect(res.statusCode).toBe(503);
      expect(res.body.message).toContain('Danh sách vé đang được cập nhật');
    });
  });

  describe('Phase 5: Event Catalog & Gateway Configuration', () => {
    const { EVENTS } = require('../config/eventCatalog');
    const fs = require('fs');

    it('Kiem tra dinh nghia cac kenh Pub/Sub theo Event Catalog Contract', () => {
      expect(EVENTS.QUEUE_TURN).toBe('queueTurn');
      expect(EVENTS.SEAT_STATUS_CHANGED).toBe('seatStatusChanged');
      expect(EVENTS.SEAT_HOLD_EXPIRED).toBe('seatHoldExpired');
      expect(EVENTS.BOOKING_CHECKOUT_COMPLETED).toBe('booking:checkout_completed');
      expect(EVENTS.BOOKING_SEATS_RETURNED).toBe('booking:seats_returned');
    });

    it('Kiem tra kong.yml chua khai bao WebSocket protocols va Rate Limiting', () => {
      const kongConfig = fs.readFileSync('kong.yml', 'utf8');
      expect(kongConfig).toContain('ws');
      expect(kongConfig).toContain('wss');
      expect(kongConfig).toContain('rate-limiting');
      expect(kongConfig).toContain('booking-service');
      expect(kongConfig).toContain('event-catalog-service');
    });
  });

  describe('Phase 6: CQRS Architecture for Booking & Event Catalog Services', () => {
    const eventQueryService = require('../modules/events/eventQueryService');
    const eventCommandService = require('../modules/events/eventCommandService');
    const bookingQueryService = require('../modules/Booking/BookingQueryService');
    const bookingCommandService = require('../modules/Booking/BookingCommandService');

    it('Kiem tra Query/Command Services cho Event Catalog phân tách rõ ràng', () => {
      expect(typeof eventQueryService.getAllPublished).toBe('function');
      expect(typeof eventQueryService.getById).toBe('function');
      expect(typeof eventQueryService.getLandingInfo).toBe('function');

      expect(typeof eventCommandService.create).toBe('function');
      expect(typeof eventCommandService.updateImage).toBe('function');
      expect(typeof eventCommandService.deleteEvent).toBe('function');
    });

    it('Kiem tra Query/Command Services cho Booking Service va Proactive Push helper', () => {
      expect(typeof bookingQueryService.getSeatMap).toBe('function');
      expect(typeof bookingQueryService.getUserTickets).toBe('function');

      expect(typeof bookingCommandService.holdSeats).toBe('function');
      expect(typeof bookingCommandService.checkout).toBe('function');
      expect(typeof bookingCommandService.returnSeats).toBe('function');
      expect(typeof bookingCommandService.updateSeatMapCacheStatus).toBe('function');
    });
  });

  describe('Phase 7: Database-per-Service Architecture', () => {
    const fs = require('fs');
    const { EVENTS } = require('../config/eventCatalog');

    it('Kiem tra khai bao Pub/Sub Events cho Analytics Sync', () => {
      expect(EVENTS.ANALYTICS_ORDER_CREATED).toBe('analytics:order_created');
      expect(EVENTS.ANALYTICS_USER_REGISTERED).toBe('analytics:user_registered');
    });

    it('Kiem tra 4 Schema files ton tai va duoc phan chia ro rang', () => {
      expect(fs.existsSync('prisma/schema-auth.prisma')).toBe(true);
      expect(fs.existsSync('prisma/schema-catalog.prisma')).toBe(true);
      expect(fs.existsSync('prisma/schema-booking.prisma')).toBe(true);
      expect(fs.existsSync('prisma/schema-analytics.prisma')).toBe(true);
    });

    it('Kiem tra docker-compose.yml chua 4 Postgres Containers doc lap', () => {
      const dockerConfig = fs.readFileSync('docker-compose.yml', 'utf8');
      expect(dockerConfig).toContain('ticketrush-postgres-auth');
      expect(dockerConfig).toContain('ticketrush-postgres-catalog');
      expect(dockerConfig).toContain('ticketrush-postgres-booking');
      expect(dockerConfig).toContain('ticketrush-postgres-analytics');
      expect(dockerConfig).toContain('5433:5432');
      expect(dockerConfig).toContain('5434:5432');
      expect(dockerConfig).toContain('5435:5432');
      expect(dockerConfig).toContain('5436:5432');
    });

    it('Kiem tra repository files tro den dung Database Config doc lap', () => {
      const authRepo = fs.readFileSync('modules/auth/authRepository.js', 'utf8');
      const eventRepo = fs.readFileSync('modules/events/eventRepository.js', 'utf8');
      const bookingRepo = fs.readFileSync('modules/Booking/BookingRepository.js', 'utf8');
      const adminRepo = fs.readFileSync('modules/admin/adminRepository.js', 'utf8');

      expect(authRepo).toContain('config/database-auth');
      expect(eventRepo).toContain('config/database-catalog');
      expect(bookingRepo).toContain('config/database-booking');
      expect(adminRepo).toContain('config/database-analytics');
    });
  });
});
