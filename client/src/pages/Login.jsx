import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Textbox from "../components/Textbox";
import {Button} from "@headlessui/react";
import { useSelector, useDispatch } from "react-redux";
import logo from "../assets/logo.png";
import axios from "axios";
import { setUserCredentials } from "../redux/slices/authSlice";
import { useLoginMutation } from "../redux/slices/apiSlice";

/**
 * 
 * @returns Login page
 */
const Login = () => {
  //  
  const { user } = useSelector((state) => state.auth); // Get user from redux store to check if user is already logged in
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm(); // Use react-hook-form for form validation

  // use navigate hook to navigate from login to home page
  const navigate = useNavigate(); 
  const dispatch = useDispatch(); // useDispatch hook to dispatch actions

  const [login] = useLoginMutation();

  // Handles form submission using async function
  const handleLogin = async (credentials) => {
    try {
      const response = await axios.post('/api/users/login', credentials, {
        withCredentials: true // Crucial for cookies
      });
      
      dispatch(setUserCredentials(response.data.user));
      navigate('/home');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Redirect to home page if user is already logged in
  useEffect(() => {
    user && navigate("/home");
  }, [user, navigate]);

  return (
    <div className='w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#F4F9F9]'>
      <div className='w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center'>
        {/* left side */}
        <div className='h-full w-full lg:w-2/3 flex flex-col items-center justify-center'>
          <div className='w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20'>
            <img src={logo} alt="Logo" className="rounded-full w-32 h32"/>
            <p className='flex flex-col gap-0 md:gap-4 text-4xl md:text-6xl 2xl:text-7xl font-black text-center text-[#1B4965]'>
              <span>UniFlow</span>
            </p>
          </div>
        </div>

        {/* right side */}
        <div className='w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center'>
          <form
            onSubmit={handleSubmit(handleLogin)}
            className='form-container w-full md:w-[400px] flex flex-col gap-y-8 bg-white px-10 pt-14 pb-14'
          >
            <div className=''>
              <p className='text-[#1B4965] text-3xl font-bold text-center'>
                Log In
              </p>
             
            </div>

            <div className='flex flex-col gap-y-4'>
              <Textbox
                placeholder='email@example.com'
                type='email'
                name='email'
                label='Email Address'
                className='w-full rounded-full'
                register={register("email", {
                  required: "Email address is required!",
                })}
                error={errors.email ? errors.email.message : ""}
              />
              <Textbox
                placeholder='Password'
                type='password'
                name='password'
                label='Password'
                className='w-full rounded-full'
                register={register("password", {
                  required: "Password is required!",
                })}
                error={errors.password ? errors.password.message : ""}
              />

              <Button
                type='login'
                label='Login'
                className='w-full h-10 bg-blue-700 text-white rounded-full'
              >Login</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;