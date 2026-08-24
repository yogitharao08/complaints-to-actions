import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { getStoredUser, logout } from "./api.js";
import { LandingPage } from "./pages/LandingPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { CitizenPortal } from "./pages/CitizenPortal.jsx";
import { OfficerPortal } from "./pages/OfficerPortal.jsx";
import { AdminPortal } from "./pages/AdminPortal.jsx";

export default function App() {
  const [user, setUser] = useState(getStoredUser());
  const [theme, setTheme] = useState(() => localStorage.getItem("cta_theme") || "dark");
  const navigate = useNavigate();
  const userHome = user ? `/${user.role}` : "/login";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("cta_theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      navigate("/login");
    };
    window.addEventListener("cta_unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("cta_unauthorized", handleUnauthorized);
    };
  }, [navigate]);

  function exit() {
    logout();
    setUser(null);
    navigate("/login");
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage theme={theme} onThemeChange={setTheme} />} />
      <Route path="/login" element={user ? <Navigate to={userHome} /> : <LoginPage setUser={setUser} theme={theme} onThemeChange={setTheme} />} />
      <Route path="/officer/login" element={<Navigate to="/login" />} />
      <Route path="/admin/login" element={<Navigate to="/login" />} />
      <Route path="/citizen" element={user?.role === "citizen" ? <CitizenPortal user={user} setUser={setUser} onExit={exit} theme={theme} onThemeChange={setTheme} /> : <Navigate to={userHome} />} />
      <Route path="/officer" element={user?.role === "officer" ? <OfficerPortal user={user} setUser={setUser} onExit={exit} theme={theme} onThemeChange={setTheme} /> : <Navigate to={userHome} />} />
      <Route path="/admin" element={user?.role === "admin" ? <AdminPortal user={user} setUser={setUser} onExit={exit} theme={theme} onThemeChange={setTheme} /> : <Navigate to={userHome} />} />
      <Route path="*" element={<Navigate to={userHome} />} />
    </Routes>
  );
}
