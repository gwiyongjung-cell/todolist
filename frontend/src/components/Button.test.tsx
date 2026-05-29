import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  describe('렌더링', () => {
    it('children 텍스트를 표시한다', () => {
      render(<Button>로그인</Button>);
      expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
    });

    it('기본 type은 button이다', () => {
      render(<Button>버튼</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('type="submit" 을 설정할 수 있다', () => {
      render(<Button type="submit">제출</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });
  });

  describe('variant', () => {
    it('primary variant — bg-primary 클래스 포함', () => {
      render(<Button variant="primary">저장</Button>);
      expect(screen.getByRole('button').className).toContain('bg-primary');
    });

    it('secondary variant — bg-white 클래스 포함', () => {
      render(<Button variant="secondary">취소</Button>);
      expect(screen.getByRole('button').className).toContain('bg-white');
    });

    it('danger variant — text-danger 클래스 포함', () => {
      render(<Button variant="danger">삭제</Button>);
      expect(screen.getByRole('button').className).toContain('text-danger');
    });
  });

  describe('loading 상태', () => {
    it('loading=true 일 때 버튼이 disabled 된다', () => {
      render(<Button loading>로딩 중</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('loading=true 일 때 스피너 요소가 렌더링된다', () => {
      render(<Button loading>로딩 중</Button>);
      const spinner = screen.getByRole('button').querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('loading=false 일 때 스피너가 없다', () => {
      render(<Button>일반 버튼</Button>);
      const spinner = screen.getByRole('button').querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });
  });

  describe('disabled 상태', () => {
    it('disabled=true 일 때 버튼이 비활성화된다', () => {
      render(<Button disabled>비활성</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('disabled 상태에서 onClick이 호출되지 않는다', async () => {
      const onClick = vi.fn();
      render(<Button disabled onClick={onClick}>비활성</Button>);
      await userEvent.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('onClick', () => {
    it('클릭 시 onClick 핸들러가 호출된다', async () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>클릭</Button>);
      await userEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
