const { z } = require('zod');

// Schema cho API Giữ ghế (POST /api/bookings/hold)
exports.holdSeatsSchema = z.object({
  body: z.object({
    eventId: z.string({
      required_error: 'Vui lòng cung cấp ID sự kiện (eventId)',
      invalid_type_error: 'ID sự kiện phải là một chuỗi văn bản'
    }),
    
    seatIds: z.array(
      z.string({ required_error: 'ID ghế không hợp lệ' })
    )
    .min(1, 'Bạn phải chọn ít nhất 1 ghế để giữ.')
    .max(4, 'Bạn chỉ được giữ tối đa 4 ghế trong 1 sự kiện.')
  })
});

// Schema cho API Thanh toán (POST /api/bookings/checkout)
exports.checkoutSchema = z.object({
  body: z.object({
    eventId: z.string({
      required_error: 'Vui lòng cung cấp ID sự kiện (eventId) để thanh toán',
      invalid_type_error: 'ID sự kiện phải là một chuỗi văn bản'
    })
  })
});