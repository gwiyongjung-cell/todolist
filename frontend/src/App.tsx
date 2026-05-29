import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute, PublicRoute } from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CategoryPage from './pages/CategoryPage';
import TodoListPage from './pages/TodoListPage';
import TodoFormPage from './pages/TodoFormPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 공개 라우트 — 로그인 상태면 /todos로 리다이렉트 */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* 보호 라우트 — 비인증 상태면 /login으로 리다이렉트 */}
        <Route path="/todos" element={<PrivateRoute><TodoListPage /></PrivateRoute>} />
        <Route path="/todos/new" element={<PrivateRoute><TodoFormPage /></PrivateRoute>} />
        <Route path="/todos/:id/edit" element={<PrivateRoute><TodoFormPage /></PrivateRoute>} />
        <Route path="/categories" element={<PrivateRoute><CategoryPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />

        {/* 기본 리다이렉트 */}
        <Route path="/" element={<Navigate to="/todos" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
