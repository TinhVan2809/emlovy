const { execute, query } = require("../config/database");
const userModel = require("./userModel"); // Assuming userModel is available for author details

const reportSelectFields = `
  r.report_id,
  r.user_id AS reporter_user_id,
  r.report_type,
  r.reported_post_id,
  r.reported_user_id,
  r.reported_comment_id,
  r.reason,
  r.status,
  r.created_at,
  r.updated_at,
  u.user_id AS reporter_id,
  u.name AS reporter_name,
  u.username AS reporter_username,
  u.avata AS reporter_avatar,
  p.post_id AS reported_post_id_detail,
  p.content AS reported_post_content,
  p.post_type AS reported_post_type,
  p.user_id AS reported_post_author_id,
  cu.user_id AS reported_user_id_detail,
  cu.username AS reported_username,
  cu.name AS reported_user_name,
  cm.id AS reported_comment_id_detail,
  cm.content AS reported_comment_content,
  cm.post_id AS reported_comment_post_id
`;

const toPublicReport = (row) => {
  if (!row) return null;

  const reporter = userModel.toPublicUser({
    user_id: row.reporter_id,
    name: row.reporter_name,
    username: row.reporter_username,
    avata: row.reporter_avatar,
    // Add other user fields if needed
  });

  let reportedEntity = null;
  if (row.report_type === 'post' && row.reported_post_id_detail) {
    reportedEntity = {
      id: row.reported_post_id_detail,
      type: 'post',
      content: row.reported_post_content,
      post_type: row.reported_post_type,
      author_id: row.reported_post_author_id,
    };
  } else if (row.report_type === 'user' && row.reported_user_id_detail) {
    reportedEntity = {
      id: row.reported_user_id_detail,
      type: 'user',
      username: row.reported_username,
      name: row.reported_user_name,
    };
  } else if (row.report_type === 'comment' && row.reported_comment_id_detail) {
    reportedEntity = {
      id: row.reported_comment_id_detail,
      type: 'comment',
      content: row.reported_comment_content,
      post_id: row.reported_comment_post_id,
    };
  }

  return {
    report_id: row.report_id,
    reporter: reporter,
    report_type: row.report_type,
    reported_entity: reportedEntity,
    reason: row.reason,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

const hydrateReports = (rows) => rows.map(toPublicReport);

const getReports = async () => {
  const rows = await query(
    `
      SELECT ${reportSelectFields}
      FROM reports r
      JOIN users u ON u.user_id = r.user_id
      LEFT JOIN posts p ON p.post_id = r.reported_post_id AND r.report_type = 'post'
      LEFT JOIN users cu ON cu.user_id = r.reported_user_id AND r.report_type = 'user'
      LEFT JOIN comments cm ON cm.id = r.reported_comment_id AND r.report_type = 'comment'
      ORDER BY r.created_at DESC
    `,
  );
  return hydrateReports(rows);
};

// Lấy danh sách báo cáo theo loại
const getReportsByType = async (type) => {
  const rows = await query(
    `
      SELECT ${reportSelectFields}
      FROM reports r
      JOIN users u ON u.user_id = r.user_id
      LEFT JOIN posts p ON p.post_id = r.reported_post_id AND r.report_type = 'post'
      LEFT JOIN users cu ON cu.user_id = r.reported_user_id AND r.report_type = 'user'
      LEFT JOIN comments cm ON cm.id = r.reported_comment_id AND r.report_type = 'comment'
      WHERE r.report_type = :type
      ORDER BY r.created_at DESC
    `,
    { type }
  );
  return hydrateReports(rows);
};

// Lấy chi tiết báo cáo theo ID
const findById = async (id) => {
  const rows = await execute(
    `
      SELECT *
      FROM reports r
      JOIN users u ON u.user_id = r.user_id
      LEFT JOIN posts p ON p.post_id = r.reported_post_id AND r.report_type = 'post'
      LEFT JOIN users cu ON cu.user_id = r.reported_user_id AND r.report_type = 'user'
      LEFT JOIN comments cm ON cm.id = r.reported_comment_id AND r.report_type = 'comment'
      WHERE r.report_id = :id
      LIMIT 1
    `,
    { id }
  );
  return hydrateReports(rows)[0] || null;
};

// Cập nhật trạng thái báo cáo
const updateStatus = async (id, status) => {
  await execute(
    `
      UPDATE reports
      SET status = :status, updated_at = CURRENT_TIMESTAMP
      WHERE report_id = :id
    `,
    { id, status }
  );

  return findById(id);
};

// Tạo báo cáo mới
const createReport = async ({ userId, reportType, reportedPostId = null, reportedUserId = null, reportedCommentId = null, reason = null }) => {
  const result = await execute(
    `
      INSERT INTO reports (user_id, report_type, reported_post_id, reported_user_id, reported_comment_id, reason)
      VALUES (:userId, :reportType, :reportedPostId, :reportedUserId, :reportedCommentId, :reason)
    `,
    { userId, reportType, reportedPostId, reportedUserId, reportedCommentId, reason }
  );
  return findById(result.insertId);
};

module.exports = {
  getReports,
  getReportsByType,
  findById,
  updateStatus,
  createReport,
};