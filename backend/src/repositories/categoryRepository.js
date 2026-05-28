const pool = require('../db/pool');
const logger = require('../utils/logger');

async function findAllByUser(userId) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM categories WHERE user_id IS NULL OR user_id = $1 ORDER BY created_at ASC',
      [userId]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

async function findById(id) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

async function create({ userId, name }) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO categories (user_id, name) VALUES ($1, $2) RETURNING *',
      [userId, name]
    );
    logger.info('카테고리 생성 완료', { userId, name });
    return result.rows[0];
  } finally {
    client.release();
  }
}

async function update(id, { name }) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    logger.info('카테고리 수정 완료', { id, name });
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

async function deleteById(id) {
  const client = await pool.connect();
  try {
    await client.query(
      'DELETE FROM categories WHERE id = $1',
      [id]
    );
    logger.info('카테고리 삭제 완료', { id });
  } finally {
    client.release();
  }
}

module.exports = { findAllByUser, findById, create, update, deleteById };
