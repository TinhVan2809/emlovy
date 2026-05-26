const { execute, query } = require("../config/database");

const publicUserFields = `
  user_id,
  name,
  username,
  birthday,
  gender,
  phone,
  avata,
  email,
  role,
  status,
  created_at
`;

const toPublicUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    user_id: user.user_id,
    name: user.name,
    username: user.username,
    birthday: user.birthday,
    gender: user.gender,
    phone: user.phone,
    avata: user.avata,
    avatar_url: user.avata,
    email: user.email,
    role: user.role,
    status: user.status,
    created_at: user.created_at,
  };
};

const findById = async (userId) => {
  const rows = await query(
    `
      SELECT ${publicUserFields}
      FROM users
      WHERE user_id = :userId
      LIMIT 1
    `,
    { userId },
  );

  return toPublicUser(rows[0]);
};

const findByLogin = async (login) => {
  const rows = await query(
    `
      SELECT *
      FROM users
      WHERE username = :login OR email = :login
      LIMIT 1
    `,
    { login },
  );

  return rows[0] || null;
};

const findExistingAccount = async ({ username, email }) => {
  const rows = await query(
    `
      SELECT user_id, username, email
      FROM users
      WHERE username = :username OR (:email IS NOT NULL AND email = :email)
      LIMIT 1
    `,
    {
      username,
      email: email || null,
    },
  );

  return rows[0] || null;
};

const create = async ({
  name,
  username,
  passwordHash,
  birthday = null,
  gender = null,
  phone = null,
  email = null,
}) => {
  const result = await execute(
    `
      INSERT INTO users
        (name, username, password, birthday, gender, phone, email)
      VALUES
        (:name, :username, :passwordHash, :birthday, :gender, :phone, :email)
    `,
    {
      name,
      username,
      passwordHash,
      birthday,
      gender,
      phone,
      email,
    },
  );

  return findById(result.insertId);
};

const buildProfileSelectFields = ({ publicPostsOnly = false, viewerId = null } = {}) => {
  let fields = publicUserFields;

  if (publicPostsOnly) {
    fields += `,
      (SELECT COUNT(*) FROM posts WHERE user_id = u.user_id AND status = 1) AS public_posts_count
    `;
  }
  return fields;
};

module.exports = {
  create,
  findById,
  findByLogin,
  findExistingAccount,
  toPublicUser,
  buildProfileSelectFields,
};
