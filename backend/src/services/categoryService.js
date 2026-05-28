const categoryRepository = require('../repositories/categoryRepository');
const logger = require('../utils/logger');

async function getCategories(userId) {
  const categories = await categoryRepository.findAllByUser(userId);
  return categories;
}

async function createCategory(userId, name) {
  if (!name) {
    const err = new Error('카테고리 이름은 필수입니다.');
    err.status = 400;
    throw err;
  }
  const category = await categoryRepository.create({ userId, name });
  logger.info('카테고리 생성', { userId, name });
  return category;
}

async function updateCategory(categoryId, userId, name) {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    const err = new Error('카테고리를 찾을 수 없습니다.');
    err.status = 404;
    throw err;
  }
  if (category.user_id === null) {
    const err = new Error('기본 카테고리는 수정할 수 없습니다.');
    err.status = 403;
    throw err;
  }
  if (category.user_id !== userId) {
    const err = new Error('카테고리 수정 권한이 없습니다.');
    err.status = 403;
    throw err;
  }
  if (!name) {
    const err = new Error('카테고리 이름은 필수입니다.');
    err.status = 400;
    throw err;
  }
  const updated = await categoryRepository.update(categoryId, { name });
  logger.info('카테고리 수정', { categoryId, userId });
  return updated;
}

async function deleteCategory(categoryId, userId) {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    const err = new Error('카테고리를 찾을 수 없습니다.');
    err.status = 404;
    throw err;
  }
  if (category.user_id === null) {
    const err = new Error('기본 카테고리는 삭제할 수 없습니다.');
    err.status = 403;
    throw err;
  }
  if (category.user_id !== userId) {
    const err = new Error('카테고리 삭제 권한이 없습니다.');
    err.status = 403;
    throw err;
  }
  await categoryRepository.deleteById(categoryId);
  logger.info('카테고리 삭제', { categoryId, userId });
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
