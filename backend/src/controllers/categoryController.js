const categoryService = require('../services/categoryService');
const logger = require('../utils/logger');

async function getCategories(req, res, next) {
  try {
    const categories = await categoryService.getCategories(req.user.userId);
    res.status(200).json(categories);
  } catch (err) {
    logger.error('카테고리 목록 조회 실패', { message: err.message });
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name } = req.body;
    const category = await categoryService.createCategory(req.user.userId, name);
    res.status(201).json(category);
  } catch (err) {
    logger.error('카테고리 생성 실패', { message: err.message });
    next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const category = await categoryService.updateCategory(id, req.user.userId, name);
    res.status(200).json(category);
  } catch (err) {
    logger.error('카테고리 수정 실패', { message: err.message });
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    await categoryService.deleteCategory(id, req.user.userId);
    res.status(204).send();
  } catch (err) {
    logger.error('카테고리 삭제 실패', { message: err.message });
    next(err);
  }
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
