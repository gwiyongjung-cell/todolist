'use strict';

describe('categoryService', () => {
  let categoryService;
  let categoryRepository;

  const DEFAULT_CATEGORY = { id: '00000000-0000-0000-0000-000000000001', user_id: null, name: '기본' };
  const USER_CATEGORY = { id: 'cat-uuid-1', user_id: 'user-uuid-1', name: '업무' };
  const OTHER_CATEGORY = { id: 'cat-uuid-2', user_id: 'other-user-uuid', name: '타인것' };

  beforeAll(() => {
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_NAME = 'todolist';
    process.env.DB_USER = 'postgres';
    process.env.DB_PASSWORD = 'postgres';
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '24h';

    jest.resetModules();
    jest.mock('../repositories/categoryRepository');

    categoryRepository = require('../repositories/categoryRepository');
    categoryService = require('../services/categoryService');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategories(userId)', () => {
    it('findAllByUser 호출 결과를 그대로 반환한다', async () => {
      const userId = 'user-uuid-1';
      const categories = [DEFAULT_CATEGORY, USER_CATEGORY];

      categoryRepository.findAllByUser.mockResolvedValue(categories);

      const result = await categoryService.getCategories(userId);

      expect(categoryRepository.findAllByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(categories);
    });
  });

  describe('createCategory(userId, name)', () => {
    it('정상 생성 → repository.create 호출, 생성된 category 반환', async () => {
      const userId = 'user-uuid-1';
      const created = { id: 'cat-uuid-new', user_id: userId, name: '신규' };

      categoryRepository.create.mockResolvedValue(created);

      const result = await categoryService.createCategory(userId, '신규');

      expect(categoryRepository.create).toHaveBeenCalledWith({ userId, name: '신규' });
      expect(result).toEqual(created);
    });

    it('name 누락 → status 400 에러 throw', async () => {
      await expect(
        categoryService.createCategory('user-uuid-1', '')
      ).rejects.toMatchObject({ status: 400 });
    });
  });

  describe('updateCategory(categoryId, userId, name)', () => {
    it('정상 수정 → repository.update 호출, 수정된 category 반환', async () => {
      const updated = { ...USER_CATEGORY, name: '수정명' };

      categoryRepository.findById.mockResolvedValue(USER_CATEGORY);
      categoryRepository.update.mockResolvedValue(updated);

      const result = await categoryService.updateCategory('cat-uuid-1', 'user-uuid-1', '수정명');

      expect(categoryRepository.update).toHaveBeenCalledWith('cat-uuid-1', { name: '수정명' });
      expect(result).toEqual(updated);
    });

    it('카테고리 없음(findById → null) → status 404 throw', async () => {
      categoryRepository.findById.mockResolvedValue(null);

      await expect(
        categoryService.updateCategory('cat-uuid-1', 'user-uuid-1', '수정명')
      ).rejects.toMatchObject({ status: 404 });
    });

    it('기본 카테고리(user_id=null) 수정 시도 → status 403 throw', async () => {
      categoryRepository.findById.mockResolvedValue(DEFAULT_CATEGORY);

      await expect(
        categoryService.updateCategory(DEFAULT_CATEGORY.id, 'user-uuid-1', '수정명')
      ).rejects.toMatchObject({ status: 403 });
    });

    it('타인 카테고리(user_id !== userId) 수정 시도 → status 403 throw', async () => {
      categoryRepository.findById.mockResolvedValue(OTHER_CATEGORY);

      await expect(
        categoryService.updateCategory(OTHER_CATEGORY.id, 'user-uuid-1', '수정명')
      ).rejects.toMatchObject({ status: 403 });
    });

    it('name 누락 → status 400 throw', async () => {
      categoryRepository.findById.mockResolvedValue(USER_CATEGORY);

      await expect(
        categoryService.updateCategory('cat-uuid-1', 'user-uuid-1', '')
      ).rejects.toMatchObject({ status: 400 });
    });
  });

  describe('deleteCategory(categoryId, userId)', () => {
    it('정상 삭제 → repository.deleteById 호출', async () => {
      categoryRepository.findById.mockResolvedValue(USER_CATEGORY);
      categoryRepository.deleteById.mockResolvedValue();

      await categoryService.deleteCategory('cat-uuid-1', 'user-uuid-1');

      expect(categoryRepository.deleteById).toHaveBeenCalledWith('cat-uuid-1');
    });

    it('카테고리 없음 → status 404 throw', async () => {
      categoryRepository.findById.mockResolvedValue(null);

      await expect(
        categoryService.deleteCategory('cat-uuid-1', 'user-uuid-1')
      ).rejects.toMatchObject({ status: 404 });
    });

    it('기본 카테고리 삭제 시도 → status 403 throw', async () => {
      categoryRepository.findById.mockResolvedValue(DEFAULT_CATEGORY);

      await expect(
        categoryService.deleteCategory(DEFAULT_CATEGORY.id, 'user-uuid-1')
      ).rejects.toMatchObject({ status: 403 });
    });

    it('타인 카테고리 삭제 시도 → status 403 throw', async () => {
      categoryRepository.findById.mockResolvedValue(OTHER_CATEGORY);

      await expect(
        categoryService.deleteCategory(OTHER_CATEGORY.id, 'user-uuid-1')
      ).rejects.toMatchObject({ status: 403 });
    });
  });
});
