const catchAsync = require('../errorHandling/catchAsync');
const AppError = require('../errorHandling/AppError');
const ResponseFactory = require('../../utils/ResponseFactory');
const eventService = require('./eventService');
const imageHelper = require('../../utils/imageHelper');

exports.getAll = catchAsync(async (req, res) => {
  const events = await eventService.getAllPublished();
  ResponseFactory.success(res, events);
});

exports.getOne = catchAsync(async (req, res) => {
  const event = await eventService.getById(req.params.id);
  ResponseFactory.success(res, event);
});

exports.createEvents = catchAsync(async (req, res, next) => {
    // 1. Gom dữ liệu từ body
    const eventPayload = req.body;
    
    // 2. Lấy ID của Admin (Người đang tạo sự kiện)
    // Nhờ cái auth.middleware.js chúng ta viết lúc trước, req.user đã có sẵn thông tin!
    eventPayload.adminId = req.user.id; 

    // 3. Quăng hết vào cho Service xử lý (Service đã có Transaction bảo vệ)
    const result = await eventService.create(eventPayload);

    // 4. Trả về cho Front-end
    ResponseFactory.success(
      res, 
      result, 
      'Tạo sự kiện và các khu vực ghế thành công!', 
      201
    );
  });



exports.updateImage = catchAsync(async (req, res) => {
  // 1. Kiểm tra file ảnh có được gửi lên không
  if (!req.file) {
    throw new AppError('Vui lòng gửi kèm file ảnh!', 400);
  }

  // 2. Lấy ảnh cũ để xóa sau khi upload thành công
  const existingEvent = await eventService.getById(req.params.id);
  const oldImageUrl = existingEvent.image_url;

  // 3. Xử lý + lưu ảnh mới vào ổ cứng
  const newImageUrl = await imageHelper.saveImage(req.file.buffer, 'events');

  // 4. Cập nhật đường dẫn ảnh mới vào Database
  const updatedEvent = await eventService.updateImage(req.params.id, { image_url: newImageUrl });

  // 5. Xóa ảnh cũ sau khi DB đã được cập nhật thành công
  imageHelper.deleteImage(oldImageUrl);

  ResponseFactory.success(res, updatedEvent, 'Hình ảnh sự kiện đã được cập nhật!');
});

/**
 * DELETE /events/:id  (Admin only)
 * Soft-delete: không xóa thật, chỉ đổi status → 'DELETED'
 */
exports.deleteEvent = catchAsync(async (req, res) => {
  await eventService.deleteEvent(req.params.id);
  // 204 No Content — chuẩn REST cho DELETE thành công
  res.status(204).send();
});

