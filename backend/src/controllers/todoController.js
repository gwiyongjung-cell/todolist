const todoService = require('../services/todoService');
const logger = require('../utils/logger');

async function getTodos(req, res, next) {
  try {
    const { category_id, status, overdue } = req.query;
    const filters = {};
    if (category_id !== undefined) filters.categoryId = category_id;
    if (status !== undefined) filters.status = status;
    if (overdue !== undefined) filters.overdue = overdue === 'true';

    const todos = await todoService.getTodos(req.user.userId, filters);
    res.status(200).json(todos);
  } catch (err) {
    logger.error('할일 목록 조회 실패', { message: err.message });
    next(err);
  }
}

async function createTodo(req, res, next) {
  try {
    const { title, category_id, description, start_date, end_date } = req.body;
    const todo = await todoService.createTodo(req.user.userId, {
      title,
      categoryId: category_id,
      description,
      startDate: start_date,
      endDate: end_date,
    });
    res.status(201).json(todo);
  } catch (err) {
    logger.error('할일 생성 실패', { message: err.message });
    next(err);
  }
}

async function updateTodo(req, res, next) {
  try {
    const { id } = req.params;
    const { title, category_id, description, start_date, end_date, status } = req.body;
    const todo = await todoService.updateTodo(id, req.user.userId, {
      title,
      categoryId: category_id,
      description,
      startDate: start_date,
      endDate: end_date,
      status,
    });
    res.status(200).json(todo);
  } catch (err) {
    logger.error('할일 수정 실패', { message: err.message });
    next(err);
  }
}

async function deleteTodo(req, res, next) {
  try {
    const { id } = req.params;
    await todoService.deleteTodo(id, req.user.userId);
    res.status(204).send();
  } catch (err) {
    logger.error('할일 삭제 실패', { message: err.message });
    next(err);
  }
}

module.exports = { getTodos, createTodo, updateTodo, deleteTodo };
