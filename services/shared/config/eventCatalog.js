/**
 * Event Catalog — Centralized Redis Pub/Sub Event Contract
 *
 * Events:
 * 1. queueTurn               (Publisher: queue-worker, Subscriber: socket-gateway)
 * 2. seatStatusChanged       (Publisher: seat-release-worker, booking-service)
 * 3. seatHoldExpired         (Publisher: seat-release-worker)
 * 4. booking:checkout_completed (Publisher: booking-service, Subscriber: queue-worker)
 * 5. booking:seats_returned  (Publisher: booking-service, Subscriber: queue-worker)
 * 6. analytics:order_created (Publisher: booking-service, Subscriber: analyticsSyncWorker)
 * 7. analytics:user_registered (Publisher: iam-service, Subscriber: analyticsSyncWorker)
 */
const EVENTS = {
  QUEUE_TURN: 'queueTurn',
  SEAT_STATUS_CHANGED: 'seatStatusChanged',
  SEAT_HOLD_EXPIRED: 'seatHoldExpired',
  BOOKING_CHECKOUT_COMPLETED: 'booking:checkout_completed',
  BOOKING_SEATS_RETURNED: 'booking:seats_returned',
  ANALYTICS_ORDER_CREATED: 'analytics:order_created',
  ANALYTICS_USER_REGISTERED: 'analytics:user_registered',
};

module.exports = { EVENTS };
