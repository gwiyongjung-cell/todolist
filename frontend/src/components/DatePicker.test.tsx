import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { DatePicker } from './DatePicker';

describe('DatePicker', () => {
  describe('렌더링', () => {
    it('label과 date input을 렌더링한다', () => {
      render(<DatePicker label="시작일" value="" onChange={vi.fn()} />);
      expect(screen.getByText('시작일')).toBeInTheDocument();
      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });

    it('value를 표시한다', () => {
      render(<DatePicker label="종료일" value="2026-05-28" onChange={vi.fn()} />);
      expect(screen.getByDisplayValue('2026-05-28')).toBeInTheDocument();
    });

    it('error prop이 있으면 에러 메시지를 표시한다', () => {
      render(
        <DatePicker label="종료일" value="" onChange={vi.fn()} error="종료일 오류" />,
      );
      expect(screen.getByRole('alert')).toHaveTextContent('종료일 오류');
    });

    it('error가 없으면 에러 메시지가 없다', () => {
      render(<DatePicker label="시작일" value="" onChange={vi.fn()} />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('disabled=true 시 입력 비활성화', () => {
      const { container } = render(
        <DatePicker label="시작일" value="" onChange={vi.fn()} disabled />,
      );
      expect(container.querySelector('input[type="date"]')).toBeDisabled();
    });
  });

  describe('onChange', () => {
    it('날짜 선택 시 value가 업데이트된다', async () => {
      function Wrapper() {
        const [val, setVal] = useState('');
        return <DatePicker label="시작일" value={val} onChange={setVal} />;
      }
      const { container } = render(<Wrapper />);
      const input = container.querySelector('input[type="date"]') as HTMLInputElement;
      await userEvent.type(input, '2026-05-28');
      expect(input.value).toBe('2026-05-28');
    });
  });
});
