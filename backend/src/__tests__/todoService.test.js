'use strict';

describe('todoService', () => {
  let todoService;
  let todoRepository;

  const MY_TODO = {
    id: 'todo-uuid-1', user_id: 'user-uuid-1', category_id: 'cat-uuid-1',
    title: '테스트 할일', status: 'TODO', start_date: null, end_date: null
  };
  const DONE_TODO = { ...MY_TODO, status: 'DONE' };
  const OTHER_TODO = { ...MY_TODO, id: 'todo-uuid-2', user_id: 'other-uuid' };

  beforeAll(() => {
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_NAME = 'todolist';
    process.env.DB_USER = 'postgres';
    process.env.DB_PASSWORD = 'postgres';
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '24h';

    jest.resetModules();
    jest.mock('../repositories/todoRepository');

    todoRepository = require('../repositories/todoRepository');
    todoService = require('../services/todoService');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTodos(userId, filters)', () => {
    it('todoRepository.findAllByUser 호출 결과를 그대로 반환한다', async () => {
      const userId = 'user-uuid-1';
      const filters = { category_id: 'cat-uuid-1', status: 'TODO', overdue: true };
      const todos = [MY_TODO];

      todoRepository.findAllByUser.mockResolvedValue(todos);

      const result = await todoService.getTodos(userId, filters);

      expect(todoRepository.findAllByUser).toHaveBeenCalledWith(userId, filters);
      expect(result).toEqual(todos);
    });
  });

  describe('createTodo(userId, data)', () => {
    it('정상 생성 → repository.create 호출, 반환값 일치', async () => {
      const userId = 'user-uuid-1';
      const data = { title: '테스트 할일', category_id: 'cat-uuid-1', start_date: null, end_date: null };

      todoRepository.create.mockResolvedValue(MY_TODO);

      const result = await todoService.createTodo(userId, data);

      expect(todoRepository.create).toHaveBeenCalled();
      expect(result).toEqual(MY_TODO);
    });

    it('title 누락 → status 400 throw', async () => {
      await expect(
        todoService.createTodo('user-uuid-1', { title: '', categoryId: 'cat-uuid-1' })
      ).rejects.toMatchObject({ status: 400 });
    });

    it('endDate < startDate → status 400 throw', async () => {
      await expect(
        todoService.createTodo('user-uuid-1', {
          title: '테스트 할일',
          categoryId: 'cat-uuid-1',
          startDate: '2026-05-10',
          endDate: '2026-05-01',
        })
      ).rejects.toMatchObject({ status: 400 });
    });

    it('endDate >= startDate → 정상 생성', async () => {
      const data = {
        title: '테스트 할일',
        categoryId: 'cat-uuid-1',
        startDate: '2026-05-01',
        endDate: '2026-05-10',
      };
      const created = { ...MY_TODO, start_date: '2026-05-01', end_date: '2026-05-10' };

      todoRepository.create.mockResolvedValue(created);

      const result = await todoService.createTodo('user-uuid-1', data);

      expect(todoRepository.create).toHaveBeenCalled();
      expect(result).toEqual(created);
    });
  });

  describe('updateTodo(todoId, userId, data)', () => {
    it('정상 수정 → repository.update 호출', async () => {
      const updated = { ...MY_TODO, title: '수정된 할일' };

      todoRepository.findById.mockResolvedValue(MY_TODO);
      todoRepository.update.mockResolvedValue(updated);

      const result = await todoService.updateTodo('todo-uuid-1', 'user-uuid-1', { title: '수정된 할일' });

      expect(todoRepository.update).toHaveBeenCalledWith('todo-uuid-1', expect.objectContaining({ title: '수정된 할일' }));
      expect(result).toEqual(updated);
    });

    it('존재하지 않는 todoId → status 404 throw', async () => {
      todoRepository.findById.mockResolvedValue(null);

      await expect(
        todoService.updateTodo('non-existent-uuid', 'user-uuid-1', { title: '수정' })
      ).rejects.toMatchObject({ status: 404 });
    });

    it('타인 todo → status 403 throw', async () => {
      todoRepository.findById.mockResolvedValue(OTHER_TODO);

      await expect(
        todoService.updateTodo('todo-uuid-2', 'user-uuid-1', { title: '수정' })
      ).rejects.toMatchObject({ status: 403 });
    });

    it('DONE 상태에서 status 변경 시도 → status 400 throw', async () => {
      todoRepository.findById.mockResolvedValue(DONE_TODO);

      await expect(
        todoService.updateTodo('todo-uuid-1', 'user-uuid-1', { status: 'IN_PROGRESS' })
      ).rejects.toMatchObject({ status: 400 });
    });

    it('IN_PROGRESS → TODO 되돌리기 허용 (status 400 아님)', async () => {
      const IN_PROGRESS_TODO = { ...MY_TODO, status: 'IN_PROGRESS' };
      const updated = { ...MY_TODO, status: 'TODO' };

      todoRepository.findById.mockResolvedValue(IN_PROGRESS_TODO);
      todoRepository.update.mockResolvedValue(updated);

      await expect(
        todoService.updateTodo('todo-uuid-1', 'user-uuid-1', { status: 'TODO' })
      ).resolves.not.toThrow();
    });

    it('DONE 상태에서 title만 변경(status 변경 없음) → 정상 수정 허용', async () => {
      const updated = { ...DONE_TODO, title: '수정된 제목' };

      todoRepository.findById.mockResolvedValue(DONE_TODO);
      todoRepository.update.mockResolvedValue(updated);

      const result = await todoService.updateTodo('todo-uuid-1', 'user-uuid-1', { title: '수정된 제목' });

      expect(todoRepository.update).toHaveBeenCalled();
      expect(result).toEqual(updated);
    });

    it('endDate < startDate → status 400 throw', async () => {
      todoRepository.findById.mockResolvedValue(MY_TODO);

      await expect(
        todoService.updateTodo('todo-uuid-1', 'user-uuid-1', {
          startDate: '2026-05-10',
          endDate: '2026-05-01',
        })
      ).rejects.toMatchObject({ status: 400 });
    });
  });

  describe('deleteTodo(todoId, userId)', () => {
    it('정상 삭제 → repository.deleteById 호출', async () => {
      todoRepository.findById.mockResolvedValue(MY_TODO);
      todoRepository.deleteById.mockResolvedValue();

      await todoService.deleteTodo('todo-uuid-1', 'user-uuid-1');

      expect(todoRepository.deleteById).toHaveBeenCalledWith('todo-uuid-1');
    });

    it('존재하지 않는 todoId → status 404 throw', async () => {
      todoRepository.findById.mockResolvedValue(null);

      await expect(
        todoService.deleteTodo('non-existent-uuid', 'user-uuid-1')
      ).rejects.toMatchObject({ status: 404 });
    });

    it('타인 todo → status 403 throw', async () => {
      todoRepository.findById.mockResolvedValue(OTHER_TODO);

      await expect(
        todoService.deleteTodo('todo-uuid-2', 'user-uuid-1')
      ).rejects.toMatchObject({ status: 403 });
    });
  });
});
