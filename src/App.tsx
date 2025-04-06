import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import GenPasswordPage from "./pages/GenPasswordPage";
import SettingsPage from "./pages/SettingsPage";
import PasswordsPage from "./pages/PasswordsPage";
import NotFoundPage from "./pages/NotFoundPage";
import RegisterPage from "./pages/RegisterPage";
import { usePasswordContext } from "./data/PasswordContext";
import { JSX } from "react";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { state } = usePasswordContext();
  const isAuthenticated = !!state.token && state.token.length > 2;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const UnProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { state } = usePasswordContext();
  const isAuthenticated = !!state.token && state.token.length > 2;

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <UnProtectedRoute>
              <LoginPage />
            </UnProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <UnProtectedRoute>
              <RegisterPage />
            </UnProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/genpass"
          element={
            <ProtectedRoute>
              <GenPasswordPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/passwords"
          element={
            <ProtectedRoute>
              <PasswordsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reset-password/:id"
          element={
            <ResetPasswordPage />
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}