import { Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Calendar from "./pages/Calendar";
import Kanban from "./pages/Kanban"; 
import Gantt from "./pages/Gantt";
import Settings from "./pages/Settings";
import Messages from "./pages/Messages";

function App() {
  return (
    <Routes>
      <Route path='/' element={<Signup/>}/>
      <Route path='/signup' element={<Signup/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/home' element={<Home/>}/>
      <Route path='/calendar' element={<Calendar/>}/>
      <Route path='/gantt' element={<Gantt/>}/>
      <Route path='/kanban' element={<Kanban/>} />
      <Route path='/messages' element={<Messages/>}/>
      <Route path='/settings' element={<Settings/>}/>

      <Route path='*' element={<Navigate to='/login'/>}/> {/* Redirect to login page if route not found */} 
    </Routes>
  
  );

}

export default App;
