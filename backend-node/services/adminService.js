const { query } = require("../config/database");
const config = require("../config/env");

const getOverview = async () => {
  // Run counts in parallel for performance
  const [
    totalUsersRows,
    newUsersTodayRows,
    totalPostsRows,
    totalReelsRows,
    totalCommentsRows,
    totalLikesRows,
  ] = await Promise.all([
    query(`SELECT COUNT(*) AS total FROM users`),
    query(`SELECT COUNT(*) AS total FROM users WHERE DATE(created_at) = CURDATE()`),
    query(`SELECT COUNT(*) AS total FROM posts WHERE is_deleted = 0`),
    // count distinct posts that are reels or have video media
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

  // totalReports may not exist in all schemas; check information_schema
  let totalReports = 0;

  try {
    const tableExistsRows = await query(
      `SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = :schema AND table_name = 'reports'`,
      { schema: config.database.name },
    );

    if (tableExistsRows && tableExistsRows[0] && Number(tableExistsRows[0].cnt) > 0) {
      const reportsRows = await query(`SELECT COUNT(*) AS total FROM reports`);
      totalReports = Number(reportsRows[0]?.total || 0);
    }
  } catch (error) {
    // On any error while checking reports, treat as zero (non-fatal)
    totalReports = 0;
  }

  return {
    totalUsers: Number(totalUsersRows[0]?.total || 0),
    newUsersToday: Number(newUsersTodayRows[0]?.total || 0),
    totalPosts: Number(totalPostsRows[0]?.total || 0),
    totalReels: Number(totalReelsRows[0]?.total || 0),
    totalComments: Number(totalCommentsRows[0]?.total || 0),
    totalLikes: Number(totalLikesRows[0]?.total || 0),
    totalReports: Number(totalReports || 0),
  };
};

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

const getUserGrowth = async (range = "7days") => {
  if (range === "7days") {
    // last 7 days including today
    const rows = await query(`
      SELECT DATE(created_at) AS date, COUNT(*) AS users
      FROM users
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `);

    const map = new Map(
      rows.map((r) => {
        const key = r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date).slice(0, 10);
        return [key, Number(r.users)];
      }),
    );

    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = _formatDate(d);
      data.push({ date: key, users: map.get(key) || 0 });
    }

    return { range, data };
  }

  if (range === "30days") {
    const rows = await query(`
      SELECT DATE(created_at) AS date, COUNT(*) AS users
      FROM users
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `);

    const map = new Map(
      rows.map((r) => {
        const key = r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date).slice(0, 10);
        return [key, Number(r.users)];
      }),
    );

    const data = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = _formatDate(d);
      data.push({ date: key, users: map.get(key) || 0 });
    }

    return { range, data };
  }

  if (range === "12months") {
    const rows = await query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m-01') AS date, COUNT(*) AS users
      FROM users
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at)
      ORDER BY YEAR(created_at), MONTH(created_at) ASC
    `);

    const map = new Map(
      rows.map((r) => {
        const key = r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date).slice(0, 10);
        return [key, Number(r.users)];
      }),
    );

    const data = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = _formatMonth(d);
      data.push({ date: key, users: map.get(key) || 0 });
    }

    return { range, data };
  }

  throw new Error("Invalid range");
};

const getStats = async (type, range = "7days") => {
  let tableName = "";
  let extraWhere = "";

  // Xác định bảng và điều kiện lọc dựa trên type
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
    default:
      throw new Error("Invalid stat type");
  }

  let sql = "";
  let interval = 0;
  let isMonth = false;

  if (range === "7days") {
    interval = 6;
    sql = `
      SELECT DATE(created_at) AS date, COUNT(*) AS count
      FROM ${tableName}
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) ${extraWhere}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `;
  } else if (range === "30days") {
    interval = 29;
    sql = `
      SELECT DATE(created_at) AS date, COUNT(*) AS count
      FROM ${tableName}
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY) ${extraWhere}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `;
  } else if (range === "12months") {
    isMonth = true;
    interval = 11;
    sql = `
      SELECT DATE_FORMAT(created_at, '%Y-%m-01') AS date, COUNT(*) AS count
      FROM ${tableName}
      WHERE created_at >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 11 MONTH) ${extraWhere}
      GROUP BY DATE_FORMAT(created_at, '%Y-%m-01')
      ORDER BY date ASC
    `;
  } else {
    throw new Error("Invalid range");
  }

  const rows = await query(sql);
  const map = new Map(
    rows.map((r) => {
      const key = r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date).slice(0, 10);
      return [key, Number(r.count)];
    })
  );

  const data = [];
  const now = new Date();

  if (isMonth) {
    for (let i = interval; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = _formatMonth(d);
      data.push({
        label: key.slice(0, 7), // Trả về dạng YYYY-MM cho frontend dễ hiển thị
        value: map.get(key) || 0,
      });
    }
  } else {
    for (let i = interval; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = _formatDate(d);
      data.push({
        label: key,
        value: map.get(key) || 0,
      });
    }
  }

  return {
    type,
    range,
    data,
  };
};

const getTopInteractedPosts = async () => {
  // Lấy top 5 bài viết có (likes + comments + shares) cao nhất trong tháng hiện tại
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
      u.username,
      u.name AS user_name,
      u.avata AS user_avatar
    FROM posts p
    JOIN users u ON p.user_id = u.user_id
    WHERE p.is_deleted = 0 
      AND p.created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
    ORDER BY total_interactions DESC
    LIMIT 5
  `;
  return await query(sql);
};

module.exports = {
  getOverview,
  getUserGrowth,
  getStats,
  getTopInteractedPosts,
};
