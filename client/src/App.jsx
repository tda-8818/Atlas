import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Kanban from "./pages/Kanban"; 
import Gantt from "./pages/Gantt";
import Settings from "./pages/Settings";
import Messages from "./pages/Messages";
import axios from "axios";
import { useEffect } from "react";
import { setUserCredentials, logout } from './redux/slices/authSlice'; 

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await axios.get('/api/users/me', { withCredentials: true });
        setVerified(true);
      } catch (err) {
        setVerified(false);
      }
    };

    if (!user) verifyAuth();
  }, [user]);

  if (!user && !verified) {
    return <div>Verifying session...</div>;
  }

  return children;
};

// Public route component (for login/signup when already authenticated)
const PublicRoute = ({ children }) => {
  const { user, isLoading } = useSelector((state) => state.auth);
  
  if (isLoading) {
    return <div>Loading...</div>; // Show loading indicator
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }
  
  return children ? children : <Outlet />;
};

// The main App component that defines the routes for the application

function App() {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  // Check auth status when app loads
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/users/me', {
          withCredentials: true
        });
        dispatch(setUserCredentials({ user: response.data.user }));
      } catch (error) {
        dispatch(logout());
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  if (isLoading) {
    return <div>Loading application...</div>; // App-level loading state
  }
  

  return (
   <div className="light">
    <Routes>
      <Route path='/' element={<Signup/>}/>
      <Route path='/signup' element={<Signup/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/home' element={<Home/>}/>
      <Route path='/Dashboard' element={<Dashboard/>}/>
      <Route path='/calendar' element={<Calendar/>}/>
      <Route path='/gantt' element={<Gantt/>}/>
      <Route path='/kanban' element={<Kanban/>} />
      <Route path='/messages' element={<Messages/>}/>
      <Route path='/settings' element={<Settings/>}/>

      <Route path='*' element={<Navigate to='/login'/>}/> {/* Redirect to login page if route not found */} 
    </Routes>
    </div>
  );

}

export default App;
