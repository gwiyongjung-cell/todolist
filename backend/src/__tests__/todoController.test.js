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

jest.mock('../services/todoService');

const todoService = require('../services/todoService');
const todoController = require('../controllers/todoController');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const MY_TODO = {
  id: 'todo-uuid-1', user_id: 'user-uuid-1', category_id: 'cat-uuid-1',
  title: '테스트 할일', status: 'TODO', start_date: null, end_date: null
};

describe('todoController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTodos 핸들러', () => {
    it('200 + 할일 배열 반환', async () => {
      const todos = [MY_TODO];
      const req = {
        user: { userId: 'user-uuid-1' },
        query: { category_id: 'cat-uuid-1', status: 'TODO', overdue: 'true' },
        params: {},
        body: {},
      };
      const res = mockRes();
      const next = jest.fn();

      todoService.getTodos.mockResolvedValue(todos);

      await todoController.getTodos(req, res, next);

      expect(todoService.getTodos).toHaveBeenCalledWith(
        'user-uuid-1',
        expect.objectContaining({ overdue: true })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(todos);
      expect(next).not.toHaveBeenCalled();
    });

    it('서비스 에러 → next(err)', async () => {
      const req = {
        user: { userId: 'user-uuid-1' },
        query: { category_id: 'cat-uuid-1', status: 'TODO', overdue: 'true' },
        params: {},
        body: {},
      };
      const res = mockRes();
      const next = jest.fn();
      const error = Object.assign(new Error('서버 오류'), { status: 500 });

      todoService.getTodos.mockRejectedValue(error);

      await todoController.getTodos(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('createTodo 핸들러', () => {
    it('201 + 생성된 todo 반환', async () => {
      const created = { ...MY_TODO, start_date: '2026-05-01', end_date: '2026-05-10' };
      const req = {
        user: { userId: 'user-uuid-1' },
        body: { title: '할일', category_id: 'cat-uuid-1', start_date: '2026-05-01', end_date: '2026-05-10' },
        params: {},
      };
      const res = mockRes();
      const next = jest.fn();

      todoService.createTodo.mockResolvedValue(created);

      await todoController.createTodo(req, res, next);

      expect(todoService.createTodo).toHaveBeenCalledWith('user-uuid-1', {
        title: '할일',
        categoryId: 'cat-uuid-1',
        description: undefined,
        startDate: '2026-05-01',
        endDate: '2026-05-10',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
      expect(next).not.toHaveBeenCalled();
    });

    it('400 에러 → next(err)', async () => {
      const req = {
        user: { userId: 'user-uuid-1' },
        body: { title: '', category_id: 'cat-uuid-1' },
        params: {},
      };
      const res = mockRes();
      const next = jest.fn();
      const error = Object.assign(new Error('title은 필수입니다.'), { status: 400 });

      todoService.createTodo.mockRejectedValue(error);

      await todoController.createTodo(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('updateTodo 핸들러', () => {
    it('200 + 수정된 todo 반환', async () => {
      const updated = { ...MY_TODO, status: 'IN_PROGRESS' };
      const req = {
        user: { userId: 'user-uuid-1' },
        params: { id: 'todo-uuid-1' },
        body: { status: 'IN_PROGRESS' },
      };
      const res = mockRes();
      const next = jest.fn();

      todoService.updateTodo.mockResolvedValue(updated);

      await todoController.updateTodo(req, res, next);

      expect(todoService.updateTodo).toHaveBeenCalledWith('todo-uuid-1', 'user-uuid-1', { status: 'IN_PROGRESS' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updated);
      expect(next).not.toHaveBeenCalled();
    });

    it('403 에러 → next(err)', async () => {
      const req = {
        user: { userId: 'user-uuid-1' },
        params: { id: 'todo-uuid-1' },
        body: { status: 'IN_PROGRESS' },
      };
      const res = mockRes();
      const next = jest.fn();
      const error = Object.assign(new Error('수정 권한이 없습니다.'), { status: 403 });

      todoService.updateTodo.mockRejectedValue(error);

      await todoController.updateTodo(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('deleteTodo 핸들러', () => {
    it('204 반환 (body 없음)', async () => {
      const req = {
        user: { userId: 'user-uuid-1' },
        params: { id: 'todo-uuid-1' },
        body: { status: 'IN_PROGRESS' },
      };
      const res = mockRes();
      const next = jest.fn();

      todoService.deleteTodo.mockResolvedValue();

      await todoController.deleteTodo(req, res, next);

      expect(todoService.deleteTodo).toHaveBeenCalledWith('todo-uuid-1', 'user-uuid-1');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('403 에러 → next(err)', async () => {
      const req = {
        user: { userId: 'user-uuid-1' },
        params: { id: 'todo-uuid-1' },
        body: { status: 'IN_PROGRESS' },
      };
      const res = mockRes();
      const next = jest.fn();
      const error = Object.assign(new Error('삭제 권한이 없습니다.'), { status: 403 });

      todoService.deleteTodo.mockRejectedValue(error);

      await todoController.deleteTodo(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
