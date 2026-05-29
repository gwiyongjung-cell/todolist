import type { TodoStatus } from '../types/todo';

/** ISO 8601 datetime → YYYY-MM-DD (UTC 기준) */
export function toDateString(isoString: string | null): string {
  if (!isoString) return '';
  return isoString.split('T')[0];
}

/** ISO 8601 datetime → 화면 표시용 YYYY.MM.DD */
export function formatDate(isoString: string | null): string {
  if (!isoString) return '-';
  return isoString.split('T')[0].replace(/-/g, '.');
}

/** Date 객체 → YYYY-MM-DD (API 요청 전송용) */
export function toApiDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/** 기한 초과 여부: end_date < 현재 시각 이고 status !== DONE */
export function isOverdue(endDate: string | null, status: TodoStatus): boolean {
  if (!endDate || status === 'DONE') return false;
  return new Date(endDate) < new Date();
}

/** 날짜 범위 유효성: endDate >= startDate (둘 중 하나가 없으면 true) */
export function isValidDateRange(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
): boolean {
  if (!startDate || !endDate) return true;
  return new Date(endDate) >= new Date(startDate);
}
