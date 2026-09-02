const reportModel = require("../models/reportModel");
const { createHttpError } = require("../utils/httpError");

const getReports = async (req, res) => {
  const reports = await reportModel.getReports();

  if (!reports || reports.length === 0) {
    throw createHttpError(404, "Không tìm thấy reports.");
  }

  res.status(200).json({
    success: true,
    message: "Lấy danh sách reports thành công.",
    data: {
      reports,
    },
  });
};

const updateReportStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Kiểm tra trạng thái hợp lệ
  const validStatuses = ["pending", "resolved", "dismissed"]; // Defined in reportModel or a constants file
  if (!validStatuses.includes(status)) {
    throw createHttpError(400, "Trạng thái báo cáo không hợp lệ.");
  }

  const report = await reportModel.findById(id);
  if (!report) {
    throw createHttpError(404, "Không tìm thấy báo cáo này.");
  }

  const updatedReport = await reportModel.updateStatus(id, status);

  res.status(200).json({
    success: true,
    message: "Cập nhật trạng thái báo cáo thành công.",
    data: updatedReport,
  });
};

const getReportsByType = async (req, res) => {
  const { type } = req.params;
  const validReportTypes = ["post", "user", "comment"]; // Defined in reportModel or a constants file

  if (!validReportTypes.includes(type)) {
    throw createHttpError(400, "Loại báo cáo không hợp lệ.");
  }

  const reports = await reportModel.getReportsByType(type);

  if (!reports || reports.length === 0) {
    throw createHttpError(404, `Không tìm thấy reports loại '${type}'.`);
  }

  res.status(200).json({
    success: true,
    message: `Lấy danh sách reports loại '${type}' thành công.`,
    data: {
      reports,
    },
  });
};

const createReport = async (req, res) => {
  const {
    report_type: reportType,
    reportType: legacyReportType,
    reported_post_id: reportedPostId,
    reportedPostId: legacyReportedPostId,
    reported_user_id: reportedUserId,
    reportedUserId: legacyReportedUserId,
    reported_comment_id: reportedCommentId,
    reportedCommentId: legacyReportedCommentId,
    reason,
  } = req.body;
  const normalizedReportType = reportType || legacyReportType;
  const normalizedReportedPostId = reportedPostId || legacyReportedPostId;
  const normalizedReportedUserId = reportedUserId || legacyReportedUserId;
  const normalizedReportedCommentId = reportedCommentId || legacyReportedCommentId;
  const userId = req.user.user_id; // Reporter is the authenticated user

  const validReportTypes = ["post", "user", "comment"];
  if (!validReportTypes.includes(normalizedReportType)) {
    throw createHttpError(400, "Loại báo cáo không hợp lệ.");
  }

  const newReport = await reportModel.createReport({
    userId,
    reportType: normalizedReportType,
    reportedPostId: normalizedReportedPostId || null,
    reportedUserId: normalizedReportedUserId || null,
    reportedCommentId: normalizedReportedCommentId || null,
    reason: reason || null,
  });

  res.status(201).json({ success: true, message: "Báo cáo đã được tạo thành công.", data: newReport });
};

module.exports = {
  getReports,
  getReportsByType,
  updateReportStatus,
  createReport,
};
