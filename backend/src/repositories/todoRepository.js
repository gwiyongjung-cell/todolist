const pool = require('../db/pool');
const logger = require('../utils/logger');

async function findAllByUser(userId, filters = {}) {
  const client = await pool.connect();
  try {
    let paramIndex = 1;
    const conditions = ['user_id = $1'];
    const values = [userId];

    if (filters.categoryId) {
      conditions.push('category_id = $' + (++paramIndex));
      values.push(filters.categoryId);
    }

    if (filters.status) {
      conditions.push('status = $' + (++paramIndex));
      values.push(filters.status);
    }

    if (filters.overdue === true) {
      conditions.push("end_date < CURRENT_DATE AND status != 'DONE'");
    }

    const sql = `SELECT * FROM todos WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`;
    const result = await client.query(sql, values);
    return result.rows;
  } finally {
    client.release();
  }
}

async function findById(id) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM todos WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

async function create({ userId, categoryId, title, description, startDate, endDate }) {
  const client = await pool.connect();
  try {
    const resolvedCategoryId = categoryId || '00000000-0000-0000-0000-000000000001';
    const result = await client.query(
      'INSERT INTO todos (user_id, category_id, title, description, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, resolvedCategoryId, title, description, startDate, endDate]
    );
    logger.info('할일 생성 완료', { userId, title });
    return result.rows[0];
  } finally {
    client.release();
  }
}

async function update(id, fields) {
  const client = await pool.connect();
  try {
    const keys = Object.keys(fields);
    const setClauses = keys.map((key, index) => `${key} = $${index + 1}`);
    setClauses.push('updated_at = NOW()');
    const values = keys.map((key) => fields[key]);
    values.push(id);

    const sql = `UPDATE todos SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`;
    const result = await client.query(sql, values);
    logger.info('할일 수정 완료', { id });
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

async function deleteById(id) {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM todos WHERE id = $1', [id]);
    logger.info('할일 삭제 완료', { id });
  } finally {
    client.release();
  }
}

module.exports = { findAllByUser, findById, create, update, deleteById };
