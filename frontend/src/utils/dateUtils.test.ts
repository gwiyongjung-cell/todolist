import { describe, it, expect } from 'vitest';
import {
  toDateString,
  formatDate,
  toApiDate,
  isOverdue,
  isValidDateRange,
} from './dateUtils';

describe('toDateString', () => {
  it('ISO datetime → YYYY-MM-DD 반환', () => {
    expect(toDateString('2026-05-28T00:00:00.000Z')).toBe('2026-05-28');
  });

  it('시간대가 있는 ISO datetime도 날짜 파트만 반환', () => {
    expect(toDateString('2026-05-28T15:00:00.000Z')).toBe('2026-05-28');
  });

  it('null 입력 → 빈 문자열 반환', () => {
    expect(toDateString(null)).toBe('');
  });
});

describe('formatDate', () => {
  it('ISO datetime → YYYY.MM.DD 형식 반환', () => {
    expect(formatDate('2026-05-28T00:00:00.000Z')).toBe('2026.05.28');
  });

  it('null 입력 → "-" 반환', () => {
    expect(formatDate(null)).toBe('-');
  });
});

describe('toApiDate', () => {
  it('Date 객체 → YYYY-MM-DD 문자열 반환', () => {
    const date = new Date('2026-05-28T00:00:00.000Z');
    expect(toApiDate(date)).toBe('2026-05-28');
  });
});

describe('isOverdue', () => {
  const PAST_DATE = '2020-01-01T00:00:00.000Z';
  const FUTURE_DATE = '2099-12-31T00:00:00.000Z';

  it('end_date가 과거이고 TODO 상태 → true', () => {
    expect(isOverdue(PAST_DATE, 'TODO')).toBe(true);
  });

  it('end_date가 과거이고 IN_PROGRESS 상태 → true', () => {
    expect(isOverdue(PAST_DATE, 'IN_PROGRESS')).toBe(true);
  });

  it('end_date가 과거이고 DONE 상태 → false (완료는 초과 아님)', () => {
    expect(isOverdue(PAST_DATE, 'DONE')).toBe(false);
  });

  it('end_date가 미래이고 TODO 상태 → false', () => {
    expect(isOverdue(FUTURE_DATE, 'TODO')).toBe(false);
  });

  it('end_date가 null → false', () => {
    expect(isOverdue(null, 'TODO')).toBe(false);
  });
});

describe('isValidDateRange', () => {
  it('endDate >= startDate → true', () => {
    expect(isValidDateRange('2026-05-01', '2026-05-31')).toBe(true);
  });

  it('endDate === startDate → true', () => {
    expect(isValidDateRange('2026-05-01', '2026-05-01')).toBe(true);
  });

  it('endDate < startDate → false', () => {
    expect(isValidDateRange('2026-05-31', '2026-05-01')).toBe(false);
  });

  it('startDate가 null → true (검증 생략)', () => {
    expect(isValidDateRange(null, '2026-05-01')).toBe(true);
  });

  it('endDate가 null → true (검증 생략)', () => {
    expect(isValidDateRange('2026-05-01', null)).toBe(true);
  });

  it('둘 다 null → true', () => {
    expect(isValidDateRange(null, null)).toBe(true);
  });
});
