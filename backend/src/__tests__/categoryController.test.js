'use strict';

beforeAll(() => {
  process.env.DB_HOST = 'localhost';
  process.env.DB_PORT = '5432';
  process.env.DB_NAME = 'todolist';
  process.env.DB_USER = 'postgres';
  process.env.DB_PASSWORD = 'postgres';
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_EXPIRES_IN = '24h';
});

jest.mock('../services/categoryService');

const categoryService = require('../services/categoryService');
const categoryController = require('../controllers/categoryController');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('categoryController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategories 핸들러', () => {
    it('200 + 카테고리 배열 반환', async () => {
      const categories = [
        { id: '00000000-0000-0000-0000-000000000001', user_id: null, name: '기본' },
        { id: 'cat-uuid-1', user_id: 'user-uuid-1', name: '업무' },
      ];
      const req = { user: { userId: 'user-uuid-1' }, params: {}, body: {} };
      const res = mockRes();
      const next = jest.fn();

      categoryService.getCategories.mockResolvedValue(categories);

      await categoryController.getCategories(req, res, next);

      expect(categoryService.getCategories).toHaveBeenCalledWith('user-uuid-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(categories);
      expect(next).not.toHaveBeenCalled();
    });

    it('서비스 에러 → next(err)', async () => {
      const req = { user: { userId: 'user-uuid-1' }, params: {}, body: {} };
      const res = mockRes();
      const next = jest.fn();
      const error = Object.assign(new Error('서버 오류'), { status: 500 });

      categoryService.getCategories.mockRejectedValue(error);

      await categoryController.getCategories(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('createCategory 핸들러', () => {
    it('201 + 생성된 category 반환', async () => {
      const created = { id: 'cat-uuid-1', user_id: 'user-uuid-1', name: '업무' };
      const req = { user: { userId: 'user-uuid-1' }, params: {}, body: { name: '업무' } };
      const res = mockRes();
      const next = jest.fn();

      categoryService.createCategory.mockResolvedValue(created);

      await categoryController.createCategory(req, res, next);

      expect(categoryService.createCategory).toHaveBeenCalledWith('user-uuid-1', '업무');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
      expect(next).not.toHaveBeenCalled();
    });

    it('서비스 에러 → next(err)', async () => {
      const req = { user: { userId: 'user-uuid-1' }, params: {}, body: {} };
      const res = mockRes();
      const next = jest.fn();
      const error = Object.assign(new Error('name이 없습니다.'), { status: 400 });

      categoryService.createCategory.mockRejectedValue(error);

      await categoryController.createCategory(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('updateCategory 핸들러', () => {
    it('200 + 수정된 category 반환', async () => {
      const updated = { id: 'cat-uuid-1', user_id: 'user-uuid-1', name: '수정명' };
      const req = {
        user: { userId: 'user-uuid-1' },
        params: { id: 'cat-uuid-1' },
        body: { name: '수정명' },
      };
      const res = mockRes();
      const next = jest.fn();

      categoryService.updateCategory.mockResolvedValue(updated);

      await categoryController.updateCategory(req, res, next);

      expect(categoryService.updateCategory).toHaveBeenCalledWith('cat-uuid-1', 'user-uuid-1', '수정명');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updated);
      expect(next).not.toHaveBeenCalled();
    });

    it('403 에러 → next(err)', async () => {
      const req = {
        user: { userId: 'user-uuid-1' },
        params: { id: 'cat-uuid-1' },
        body: { name: '수정명' },
      };
      const res = mockRes();
      const next = jest.fn();
      const error = Object.assign(new Error('수정 권한이 없습니다.'), { status: 403 });

      categoryService.updateCategory.mockRejectedValue(error);

      await categoryController.updateCategory(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('deleteCategory 핸들러', () => {
    it('204 반환 (body 없음)', async () => {
      const req = {
        user: { userId: 'user-uuid-1' },
        params: { id: 'cat-uuid-1' },
        body: {},
      };
      const res = mockRes();
      const next = jest.fn();

      categoryService.deleteCategory.mockResolvedValue();

      await categoryController.deleteCategory(req, res, next);

      expect(categoryService.deleteCategory).toHaveBeenCalledWith('cat-uuid-1', 'user-uuid-1');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('403 에러 → next(err)', async () => {
      const req = {
        user: { userId: 'user-uuid-1' },
        params: { id: 'cat-uuid-1' },
        body: {},
      };
      const res = mockRes();
      const next = jest.fn();
      const error = Object.assign(new Error('삭제 권한이 없습니다.'), { status: 403 });

      categoryService.deleteCategory.mockRejectedValue(error);

      await categoryController.deleteCategory(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
