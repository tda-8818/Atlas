import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Kanban from "./pages/Kanban";
import Gantt from "./pages/Gantt";
import Settings from "./pages/Settings";
import Messages from "./pages/Messages";
import ProjectLayout from "./layouts/ProjectLayout.jsx";
import { useEffect, useState } from "react";
import { useGetCurrentUserQuery } from './redux/slices/apiSlice.js';


// The main App component that defines the routes for the application
function App() {
  const { data: user, isLoading, isError } = useGetCurrentUserQuery();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });
  
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme); // apply theme to <html>
    localStorage.setItem("theme", theme); // persist
  }, [theme]);
  

  useEffect(() => {
    if (!isLoading && !isError && user) {
      // User is authenticated
    }
  }, [user, isLoading, isError]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className={theme}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/home" replace />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/home" replace />} />

        {/* Protected routes */}
        <Route path="/" element={user ? <Outlet /> : <Navigate to="/login" replace />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="settings" element={<Settings setTheme={setTheme} />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="kanban" element={<Kanban />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="gantt" element={<Gantt />} />
        </Route>

        {/* Project Routes */}
        <Route path="/project/:id" element={<ProjectLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="kanban" element={<Kanban />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="gantt" element={<Gantt />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to={user ? "/home" : "/login"} replace />} />
      </Routes>
    </div>
  );
}

export default App;
