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
