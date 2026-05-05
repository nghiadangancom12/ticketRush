const catchAsync = require('../errorHandling/catchAsync');
const ResponseFactory = require('../../utils/ResponseFactory');
const adminService = require('./adminService');

exports.getDashboard = catchAsync(async (req, res) => {
  const dashboardData = await adminService.getDashboardStats();
  ResponseFactory.success(res, dashboardData);
});

exports.getCustomerAnalytics = catchAsync(async (req, res) => {
  const data = await adminService.getCustomerAnalytics();
  ResponseFactory.success(res, data);
});

exports.getCategoryAnalytics = catchAsync(async (req, res) => {
  const { groupBy = 'both' } = req.query; // age, gender, both
  const data = await adminService.getCategoryAnalytics(groupBy);
  ResponseFactory.success(res, data);
});
