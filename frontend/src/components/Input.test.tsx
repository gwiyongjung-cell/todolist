import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useState as useReactState } from 'react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  describe('렌더링', () => {
    it('label 텍스트를 표시한다', () => {
      render(<Input label="이메일" value="" onChange={vi.fn()} />);
      expect(screen.getByText('이메일')).toBeInTheDocument();
    });

    it('label로 input을 찾을 수 있다', () => {
      render(<Input label="이메일" value="" onChange={vi.fn()} />);
      expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    });

    it('기본 type은 text이다', () => {
      render(<Input label="이름" value="" onChange={vi.fn()} />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
    });

    it('type="password" 를 설정할 수 있다', () => {
      const { container } = render(
        <Input label="비밀번호" type="password" value="" onChange={vi.fn()} />,
      );
      expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
    });

    it('placeholder를 표시한다', () => {
      render(
        <Input label="이메일" value="" onChange={vi.fn()} placeholder="이메일을 입력하세요" />,
      );
      expect(screen.getByPlaceholderText('이메일을 입력하세요')).toBeInTheDocument();
    });

    it('required=true 일 때 * 표시가 렌더링된다', () => {
      render(<Input label="이메일" value="" onChange={vi.fn()} required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('required=false 일 때 * 표시가 없다', () => {
      render(<Input label="이메일" value="" onChange={vi.fn()} />);
      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });
  });

  describe('에러 상태', () => {
    it('error prop이 있으면 에러 메시지를 표시한다', () => {
      render(
        <Input label="이메일" value="" onChange={vi.fn()} error="올바른 이메일을 입력하세요." />,
      );
      expect(screen.getByRole('alert')).toHaveTextContent('올바른 이메일을 입력하세요.');
    });

    it('error prop이 없으면 에러 메시지가 표시되지 않는다', () => {
      render(<Input label="이메일" value="" onChange={vi.fn()} />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('에러 상태일 때 aria-invalid가 true이다', () => {
      render(<Input label="이메일" value="" onChange={vi.fn()} error="오류" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('에러가 없을 때 aria-invalid가 false이다', () => {
      render(<Input label="이메일" value="" onChange={vi.fn()} />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('onChange', () => {
    it('입력 시 onChange가 호출되고 value가 업데이트된다', async () => {
      // controlled input은 state 관리 wrapper 필요
      function Wrapper() {
        const [val, setVal] = useReactState('');
        return <Input label="이름" value={val} onChange={setVal} />;
      }
      render(<Wrapper />);
      await userEvent.type(screen.getByRole('textbox'), '홍길동');
      expect(screen.getByRole('textbox')).toHaveValue('홍길동');
    });
  });

  describe('disabled 상태', () => {
    it('disabled=true 일 때 입력 필드가 비활성화된다', () => {
      render(<Input label="이메일" value="" onChange={vi.fn()} disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });
  });
});
