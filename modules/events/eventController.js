const catchAsync = require('../errorHandling/catchAsync');
const ResponseFactory = require('../../utils/ResponseFactory');
const eventService = require('./eventService');

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
exports.create = catchAsync(async (req, res) => {
  const result = await eventService.create({ ...req.body, adminId: req.userId });
  ResponseFactory.success(res, result, 'Sự kiện đã được tạo thành công!', 201);
});

exports.updateImage = catchAsync(async (req, res) => {
  const event = await eventService.updateImage(req.params.id, req.body);
  ResponseFactory.success(res, event, 'Hình ảnh sự kiện đã được cập nhật!');
});
