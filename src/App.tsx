import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import GenPasswordPage from "./pages/GenPasswordPage";
import SettingsPage from "./pages/SettingsPage";
import PasswordsPage from "./pages/PasswordsPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/genpass" element={<GenPasswordPage/>}/>
        <Route path="/passwords" element={<PasswordsPage/>}/>
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

