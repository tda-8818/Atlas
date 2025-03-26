import { Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Calendar from "./pages/Calendar";
import Gantt from "./pages/Gantt";
import Settings from "./pages/Settings";
import Messages from "./pages/Messages";

function Layout (){
  const {user} = useSelector((state) => state.auth);
  const location = useLocation();
  
  return user ? (
    <div className="w-full h-screen flex flex-col md:flex-row">
      <div className='w-1/5 h-screen bg-white sticky top-0 hidden md:block'>
      {/* <Sidebar/> */}
      </div>

      <div className="flex-1 overflow-y-auto">

      </div>

    </div>
  ) : (
    <Navigate to='/log-in' state={{ from: location }} replace/>
  )
}

// function App() {
//   return (
//     <main className='w-full min-h-screen bg[f3f446]'>
//       <Routes>
//         <Route element={<Layout/>}>
//           <Route path="/" element={<Navigate to="/home" />} />
//           <Route path="/home" element={<Home />} />
//           {/* <Route path="/gantt" element={<Gantt />} />
//           <Route path="/calendar" element={<Calendar />} />
//           <Route path="/messages" element={<Messages />} />
//           <Route path="/settings" element={<Settings />} /> */}

//           <Route path="/log-in" element={<Login />} />
//         </Route>
//       </Routes>
//     </main>
//   );
// }

function App() {
  return (
    <Routes>
      <Route path='/' element={<Signup/>}/>
      <Route path='/signup' element={<Signup/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/home' element={<Home/>}/>
      <Route path='/calendar' element={<Calendar/>}/>
    </Routes>
  
  );

}

export default App;
