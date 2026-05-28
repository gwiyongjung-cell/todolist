const pool = require('../db/pool');
const logger = require('../utils/logger');

async function findByEmail(email) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT id, email, password, name, theme, language, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

async function create({ email, password, name }) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO users (email, password, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, theme, language, created_at, updated_at`,
      [email, password, name]
    );
    logger.info('사용자 생성 완료', { email });
    return result.rows[0];
  } finally {
    client.release();
  }
}

async function findById(id) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT id, email, name, theme, language, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

async function update(id, fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) {
    return findById(id);
  }

  const setClauses = keys.map((key, index) => `${key} = $${index + 1}`);
  const values = keys.map((key) => fields[key]);

  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE users
       SET ${setClauses.join(', ')}, updated_at = NOW()
       WHERE id = $${keys.length + 1}
       RETURNING id, email, name, theme, language, created_at, updated_at`,
      [...values, id]
    );
    logger.info('사용자 정보 업데이트 완료', { id });
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

module.exports = { findByEmail, create, findById, update };
