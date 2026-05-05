const { z } = require('zod');

exports.createEventSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Vui lòng nhập tên sự kiện' }),
    description: z.string().optional(),
    start_time: z.string().datetime({ message: 'Thời gian bắt đầu không hợp lệ (Cần chuẩn ISO-8601)' }),
    location: z.string({ required_error: 'Vui lòng nhập địa điểm' }),
    category_id: z.string().uuid('ID danh mục không hợp lệ').optional(),
    
    // Validate mảng zones
    zones: z.array(
      z.object({
        name: z.string({ required_error: 'Tên khu vực không được để trống' }),
        // coerce.number() tự động biến chuỗi "150000" thành số 150000
        price: z.coerce.number().min(0, 'Giá tiền không được âm'), 
        
        // Validate mảng seats bên trong zones
        seats: z.array(
          z.object({
            row_label: z.string({ required_error: 'Ký hiệu hàng không được để trống' }),
            seat_number: z.coerce.number().int().min(1, 'Số ghế không hợp lệ')
          })
        ).min(1, 'Mỗi khu vực phải có ít nhất 1 ghế')
      })
    ).min(1, 'Sự kiện phải có ít nhất 1 khu vực')
  })
});

exports.updateImageSchema = z.object({
  body: z.object({
    image_url: z.string({ required_error: 'Vui lòng cung cấp URL hình ảnh' }).url('URL hình ảnh không hợp lệ')
  })
});