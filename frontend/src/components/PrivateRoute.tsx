import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface RouteProps {
  children: React.ReactNode;
}

/** 비인증 사용자를 /login으로 리다이렉트 */
export function PrivateRoute({ children }: RouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

/** 이미 로그인된 사용자를 /todos로 리다이렉트 */
export function PublicRoute({ children }: RouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/todos" replace /> : <>{children}</>;
}
