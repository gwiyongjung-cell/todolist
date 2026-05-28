const todoRepository = require('../repositories/todoRepository');
const logger = require('../utils/logger');
const { TODO_STATUS } = require('../constants/statusConstants');

function validateDateRange(startDate, endDate) {
  if (startDate && endDate) {
    if (new Date(endDate) < new Date(startDate)) {
      const err = new Error('종료일은 시작일보다 이전일 수 없습니다.');
      err.status = 400;
      throw err;
    }
  }
}

async function getTodos(userId, filters) {
  return todoRepository.findAllByUser(userId, filters);
}

async function createTodo(userId, { title, categoryId, description, startDate, endDate }) {
  if (!title) {
    const err = new Error('할일 제목은 필수입니다.');
    err.status = 400;
    throw err;
  }
  validateDateRange(startDate, endDate);
  const todo = await todoRepository.create({ userId, categoryId, title, description, startDate, endDate });
  logger.info('할일 생성', { userId, title });
  return todo;
}

async function updateTodo(todoId, userId, data) {
  const todo = await todoRepository.findById(todoId);
  if (!todo) {
    const err = new Error('할일을 찾을 수 없습니다.');
    err.status = 404;
    throw err;
  }
  if (todo.user_id !== userId) {
    const err = new Error('할일 수정 권한이 없습니다.');
    err.status = 403;
    throw err;
  }
  if (data.status && todo.status === TODO_STATUS.DONE) {
    const err = new Error('완료된 할일의 상태는 변경할 수 없습니다.');
    err.status = 400;
    throw err;
  }
  if (data.startDate || data.endDate) {
    validateDateRange(data.startDate, data.endDate);
  }

  const fields = {};
  if (data.title !== undefined) fields.title = data.title;
  if (data.description !== undefined) fields.description = data.description;
  if (data.categoryId !== undefined) fields.category_id = data.categoryId;
  if (data.startDate !== undefined) fields.start_date = data.startDate;
  if (data.endDate !== undefined) fields.end_date = data.endDate;
  if (data.status !== undefined) fields.status = data.status;

  const updated = await todoRepository.update(todoId, fields);
  logger.info('할일 수정', { todoId, userId });
  return updated;
}

async function deleteTodo(todoId, userId) {
  const todo = await todoRepository.findById(todoId);
  if (!todo) {
    const err = new Error('할일을 찾을 수 없습니다.');
    err.status = 404;
    throw err;
  }
  if (todo.user_id !== userId) {
    const err = new Error('할일 삭제 권한이 없습니다.');
    err.status = 403;
    throw err;
  }
  await todoRepository.deleteById(todoId);
  logger.info('할일 삭제', { todoId, userId });
}

module.exports = { getTodos, createTodo, updateTodo, deleteTodo };
