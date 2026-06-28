const { query } = require("../config/database");
const config = require("../config/env");
const userModel = require("../models/userModel");

// ─── Private helpers ──────────────────────────────────────────────────────────

const _formatDate = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const _formatMonth = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}-01`;
};

/**
 * Normalize một giá trị date từ DB driver về chuỗi "YYYY-MM-DD".
 */
const _parseDateKey = (date) =>
  date instanceof Date
    ? date.toISOString().slice(0, 10)
    : String(date).slice(0, 10);

/**
 * Trả về cấu hình SQL và vòng lặp cho một range cụ thể.
 */
const _getRangeConfig = (range) => {
  switch (range) {
    case "7days":
      return {
        interval: 6,
        isMonth: false,
        currentFilter: `created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)`,
        prevFilter: `created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
                       AND created_at < DATE_SUB(CURDATE(), INTERVAL 6 DAY)`,
      };
    case "30days":
      return {
        interval: 29,
        isMonth: false,
        currentFilter: `created_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)`,
        prevFilter: `created_at >= DATE_SUB(CURDATE(), INTERVAL 59 DAY)
                       AND created_at < DATE_SUB(CURDATE(), INTERVAL 29 DAY)`,
      };
    case "12months":
      return {
        interval: 11,
        isMonth: true,
        currentFilter: `created_at >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 11 MONTH)`,
        prevFilter: `created_at >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 23 MONTH)
                       AND created_at < DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 11 MONTH)`,
      };
    default:
      throw new Error("Invalid range");
  }
};

/**
 * Tạo mảng kết quả đầy đủ (điền 0 cho ngày/tháng không có data).
 */
const _buildSeries = (map, interval, isMonth) => {
  const now = new Date();
  const data = [];

  for (let i = interval; i >= 0; i--) {
    let key;
    if (isMonth) {
      key = _formatMonth(new Date(now.getFullYear(), now.getMonth() - i, 1));
    } else {
      const d = new Date();
      d.setDate(d.getDate() - i);
      key = _formatDate(d);
    }
    data.push({
      label: isMonth ? key.slice(0, 7) : key, // "YYYY-MM" hoặc "YYYY-MM-DD"
      value: map.get(key) || 0,
    });
  }

  return data;
};

// ─── Public API ───────────────────────────────────────────────────────────────

const getOverview = async () => {
  const [
    totalUsers,
    verifiedUsers,
    activeUsers,
    newUsersTodayRows,
    totalPostsRows,
    totalReelsRows,
    totalCommentsRows,
    totalLikesRows,
  ] = await Promise.all([
    userModel.countUsers(),
    userModel.countUsers({ isVerified: 1 }),
    userModel.countUsers({ status: 1 }),
    query(
      `SELECT COUNT(*) AS total FROM users WHERE DATE(created_at) = CURDATE()`,
    ),
    query(`SELECT COUNT(*) AS total FROM posts WHERE is_deleted = 0`),
    query(`
      SELECT COUNT(DISTINCT p.post_id) AS total
      FROM posts p
      LEFT JOIN post_media pm ON pm.post_id = p.post_id AND pm.type = 'video'
      WHERE p.is_deleted = 0
        AND (p.post_type = 'reel' OR pm.post_media_id IS NOT NULL)
    `),
    query(`SELECT COUNT(*) AS total FROM comments WHERE is_deleted = 0`),
    query(`SELECT COUNT(*) AS total FROM likes`),
  ]);

  let totalReports = 0;
  try {
    const tableExistsRows = await query(
      `SELECT COUNT(*) AS cnt FROM information_schema.tables
       WHERE table_schema = :schema AND table_name = 'reports'`,
      { schema: config.database.name },
    );
    if (tableExistsRows?.[0] && Number(tableExistsRows[0].cnt) > 0) {
      const reportsRows = await query(`SELECT COUNT(*) AS total FROM reports`);
      totalReports = Number(reportsRows[0]?.total || 0);
    }
  } catch {
    totalReports = 0;
  }

  return {
    totalUsers: Number(totalUsers),
    verifiedUsers: Number(verifiedUsers),
    activeUsers: Number(activeUsers),
    newUsersToday: Number(newUsersTodayRows[0]?.total || 0),
    totalPosts: Number(totalPostsRows[0]?.total || 0),
    totalReels: Number(totalReelsRows[0]?.total || 0),
    totalComments: Number(totalCommentsRows[0]?.total || 0),
    totalLikes: Number(totalLikesRows[0]?.total || 0),
    totalReports,
  };
};

/**
 * Thống kê theo type và range.
 */
const getStats = async (type, range = "7days") => {
  let tableName = "";
  let extraWhere = "";

  switch (type) {
    case "users":
      tableName = "users";
      break;
    case "posts":
      tableName = "posts";
      extraWhere = "AND post_type = 'post' AND is_deleted = 0";
      break;
    case "reels":
      tableName = "posts";
      extraWhere = "AND post_type = 'reel' AND is_deleted = 0";
      break;
    case "comments":
      tableName = "comments";
      extraWhere = "AND is_deleted = 0";
      break;
    case "likes":
      tableName = "likes";
      break;
    case "verified-users":
      tableName = "users";
      extraWhere = "AND is_verified = 1";
      break;
    default:
      throw new Error("Invalid stat type");
  }

  const { interval, isMonth, currentFilter, prevFilter } =
    _getRangeConfig(range);

  // Expression dùng chung cho SELECT, GROUP BY, ORDER BY
  const dateExpr = isMonth
    ? `DATE_FORMAT(created_at, '%Y-%m-01')`
    : `DATE(created_at)`;

  const sql = `
    SELECT ${dateExpr} AS date, COUNT(*) AS count
    FROM ${tableName}
    WHERE ${currentFilter} ${extraWhere}
    GROUP BY ${dateExpr}
    ORDER BY ${dateExpr} ASC
  `;

  const prevSql = `
    SELECT COUNT(*) AS total
    FROM ${tableName}
    WHERE ${prevFilter} ${extraWhere}
  `;

  const [rows, prevRows] = await Promise.all([query(sql), query(prevSql)]);

  const map = new Map(
    rows.map((r) => [_parseDateKey(r.date), Number(r.count)]),
  );

  return {
    type,
    range,
    data: _buildSeries(map, interval, isMonth),
    previous_total: Number(prevRows[0]?.total || 0),
  };
};

/**
 * Giữ lại để tương thích ngược với các caller cũ.
 */
const getUserGrowth = async (range = "7days") => {
  const { range: r, data, previous_total } = await getStats("users", range);
  return {
    range: r,
    previous_total,
    data: data.map(({ label, value }) => ({ date: label, users: value })),
  };
};

const getTopInteractedPosts = async (limit = 7, range = "7days") => {
  const { currentFilter: dateFilterClause } = _getRangeConfig(range);

  const sql = `
    SELECT
      p.post_id,
      p.content,
      p.post_type,
      p.like_count,
      p.comment_count,
      p.share_count,
      (p.like_count + p.comment_count + p.share_count) AS total_interactions,
      p.created_at,
      fm.media_url,
      u.username,
      u.name    AS user_name,
      u.avata   AS user_avatar
    FROM posts p
    JOIN users u ON p.user_id = u.user_id
    LEFT JOIN (
      SELECT
        post_id,
        media_url,
        ROW_NUMBER() OVER (PARTITION BY post_id ORDER BY sort_order ASC) AS rn
      FROM post_media
    ) AS fm ON fm.post_id = p.post_id AND fm.rn = 1
    WHERE p.is_deleted = 0
      AND p.${dateFilterClause}
    ORDER BY total_interactions DESC
    LIMIT :limit
  `;

  return await query(sql, { limit: Number(limit) });
};

module.exports = {
  getOverview,
  getUserGrowth,
  getStats,
  getTopInteractedPosts,
};
