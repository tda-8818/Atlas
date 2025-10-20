import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Presignup from "./pages/Presignup";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Projects from "./pages/Projects.jsx";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Kanban from "./pages/Kanban";
import Gantt from "./pages/Gantt";
import Settings from "./pages/Settings";
import ProjectLayout from "./layouts/ProjectLayout.jsx";
import { useEffect, useState, useRef } from "react";
import { useGetCurrentUserQuery } from './redux/slices/userSlice.js';
import { handleApiError } from "./components/errorToast.jsx";
import { useLocation } from "react-router-dom";
import { ProjectsProvider } from "./contexts/ProjectsContext.jsx";

// The main App component that defines the routes for the application
function App() {
  const { data: user, isLoading, isError, error } = useGetCurrentUserQuery();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });
  const location = useLocation();
  // Add a ref to track if we're in the process of logging out
  const isLoggingOut = useRef(false);

  // Check if we're on the login page and just arrived from another page
  useEffect(() => {
    if (location.pathname === '/login') {
      // If we just landed on the login page, assume we might be logging out
      isLoggingOut.current = true;

      // Reset this flag after a short delay
      const timer = setTimeout(() => {
        isLoggingOut.current = false;
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme); // apply theme to <html>
    localStorage.setItem("theme", theme); // persist
  }, [theme]);

  useEffect(() => {
    if (!isLoading && !isError && user) {
      // User is authenticated
    }
  }, [user, isLoading, isError]);

  // Add this effect to handle API errors with toast notifications
  useEffect(() => {
    if (isError && error) {
      // Don't show error toasts for auth errors when on login or presignup page or when logging out
      const isAuthError = error?.status === 401;
      const isLoginPage = location.pathname === '/login';
      const isSignupPage = location.pathname === '/signup';
      const isPresignupPage = location.pathname === '/';

      if (!(isAuthError && (isLoginPage || isSignupPage || isPresignupPage || isLoggingOut.current))) {
        handleApiError(error);
      }
    }
  }, [isError, error, location.pathname]);

  //if (isLoading) return <div>Loading...</div>;

  return (
    <div className={theme}>
      {/* Add the Toaster component here */}
      <Toaster />

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <ProjectsProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={ isLoading ? ( null) : user ? (<Navigate to="/projects" replace />) : (<Presignup />)}/>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/projects" replace />} />
            <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/projects" replace />} />

            {/* Protected Routes (Require Authentication) */}
            <Route path="/projects" element={user ? <Projects /> : <Navigate to="/" replace />} />
            <Route path="/settings" element={user ? <Settings setTheme={setTheme} /> : <Navigate to="/" replace />} />

            {/* Project-Specific Routes (Nested) */}
            <Route path="/projects/:id" element={user ? <ProjectLayout /> : <Navigate to="/" replace />}>
              <Route index element={<Navigate to="dashboard" replace />} /> {/* Default project page */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="kanban" element={<Kanban />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="gantt" element={<Gantt />} />
            </Route>

            {/* Catch-All Route (404 equivalent) */}
            <Route path="*" element={<Navigate to={user ? "/projects" : "/"} replace />} />
          </Routes>
        </ProjectsProvider>
      )}
    </div>
  );
}

export default App;