import { describe, it, expect } from 'vitest';
import { TODO_STATUS, THEME, TODO_STATUS_LABEL, DEFAULT_CATEGORY_ID } from './statusConstants';

describe('TODO_STATUS', () => {
  it('TODO 값 일치', () => {
    expect(TODO_STATUS.TODO).toBe('TODO');
  });

  it('IN_PROGRESS 값 일치', () => {
    expect(TODO_STATUS.IN_PROGRESS).toBe('IN_PROGRESS');
  });

  it('DONE 값 일치', () => {
    expect(TODO_STATUS.DONE).toBe('DONE');
  });
});

describe('THEME', () => {
  it('LIGHT 값 일치', () => {
    expect(THEME.LIGHT).toBe('LIGHT');
  });

  it('DARK 값 일치', () => {
    expect(THEME.DARK).toBe('DARK');
  });
});

describe('TODO_STATUS_LABEL', () => {
  it('TODO 한국어 레이블', () => {
    expect(TODO_STATUS_LABEL['TODO']).toBe('대기');
  });

  it('IN_PROGRESS 한국어 레이블', () => {
    expect(TODO_STATUS_LABEL['IN_PROGRESS']).toBe('진행중');
  });

  it('DONE 한국어 레이블', () => {
    expect(TODO_STATUS_LABEL['DONE']).toBe('완료');
  });
});

describe('DEFAULT_CATEGORY_ID', () => {
  it('기본 카테고리 UUID 형식', () => {
    expect(DEFAULT_CATEGORY_ID).toBe('00000000-0000-0000-0000-000000000001');
  });
});
