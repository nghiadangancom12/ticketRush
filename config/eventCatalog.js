/**
 * Event Catalog — Centralized Redis Pub/Sub Event Contract Specification
 * 
 * 1. queueTurn                    (Publisher: queue-worker, Subscriber: socket-gateway)
 *    Payload: { userId, eventId, status, expireAt }
 * 
 * 2. seatStatusChanged            (Publisher: seat-release-worker, booking-service, Subscriber: socket-gateway)
 *    Payload: { eventId, seats[], status }
 * 
 * 3. seatHoldExpired              (Publisher: seat-release-worker, Subscriber: socket-gateway, user-service)
 *    Payload: { userId, eventId, message }
 * 
 * 4. booking:checkout_completed   (Publisher: booking-service, Subscriber: queue-service / queue-worker)
 *    Payload: { userId, eventId, orderId }
 * 
 * 5. booking:seats_returned       (Publisher: booking-service, Subscriber: queue-service / queue-worker)
 *    Payload: { userId, eventId }
 * 
 * 6. analytics:order_created      (Publisher: booking-service, Subscriber: analyticsSyncWorker)
 *    Payload: { orderId, userId, userEmail, eventId, eventTitle, categoryName, totalAmount, orderStatus, createdAt }
 * 
 * 7. analytics:user_registered    (Publisher: auth-service, Subscriber: analyticsSyncWorker)
 *    Payload: { userId, email, gender, dateOfBirth }
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
