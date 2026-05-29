export const TODO_STATUS = Object.freeze({
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const);

export const THEME = Object.freeze({
  LIGHT: 'LIGHT',
  DARK: 'DARK',
} as const);

export const TODO_STATUS_LABEL: Record<string, string> = {
  TODO: '대기',
  IN_PROGRESS: '진행중',
  DONE: '완료',
};

export const DEFAULT_CATEGORY_ID = '00000000-0000-0000-0000-000000000001';
