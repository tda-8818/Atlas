import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useLoginMutation } from '../redux/slices/userSlice';
import logo from '../assets/logo.png';
import Textbox from '../components/Textbox';
import { Button } from '@headlessui/react';
import { showErrorToast } from '../components/errorToast.jsx';
import toast from 'react-hot-toast';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OAuth handlers
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/auth/github`;
  };

  // Debounced submit handler to prevent rapid submissions
  const onSubmit = useCallback(async (data) => {
    // Prevent multiple submissions
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const loginData = {
        ...data,
        email: data.email.toLowerCase()
      };

      // Make login request
      const result = await login(loginData).unwrap();

      // Show success toast
      toast.success("Login successful!", {
        duration: 2000,
        position: "bottom-right"
      });

      // Redirect to projects
      navigate('/projects');

    } catch (err) {
      console.error('Login failed:', err);

      // Use generic error message for all authentication failures
      showErrorToast("Invalid credentials", "error");
    } finally {
      // Re-enable form after 1 second to prevent spam
      setTimeout(() => setIsSubmitting(false), 1000);
    }
  }, [isSubmitting, login, navigate]);

  return (
    <div className='w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f8ff] via-white to-[#e3f2fd]'>
      <div className='w-full max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20'>
        {/* Left side - Branding */}
        <div className='flex-1 flex flex-col items-center lg:items-start justify-center text-center lg:text-left'>
          <div className='flex flex-col items-center lg:items-start gap-6'>
            <div className='flex items-center gap-4'>
              <img src={logo} alt="Atlas Logo" className="rounded-full w-20 h-20 shadow-lg" />
              <h1 className='text-5xl md:text-6xl font-black bg-gradient-to-r from-[#0b80c3] to-[#0d9ae6] bg-clip-text text-transparent'>
                Atlas
              </h1>
            </div>
            <div className='space-y-3'>
              <h2 className='text-3xl md:text-4xl font-bold text-[#0b80c3]'>
                Welcome Back
              </h2>
              <p className='text-lg text-[#546e7a] max-w-md'>
                Log in to continue managing your projects and conquering your goals
              </p>
            </div>
            <div className='mt-6'>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-[#0b80c3] hover:text-[#0d9ae6] font-semibold transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className='w-full lg:w-auto flex justify-center'>
          <div className='w-full max-w-md'>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className='bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-[#bbdefb]/50 p-8 md:p-10'
            >
              <div className='mb-8'>
                <h3 className='text-2xl font-bold text-[#0b80c3] text-center mb-2'>
                  Log In
                </h3>
                <p className='text-sm text-[#546e7a] text-center'>
                  Enter your credentials to access your account
                </p>
              </div>

              <div className='flex flex-col gap-5'>
                <Textbox
                  placeholder='email@example.com'
                  type='email'
                  name='email'
                  label='Email Address'
                  className='w-full rounded-full'
                  register={register("email", {
                    required: "Email address is required!",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
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
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters"
                    }
                  })}
                  error={errors.password ? errors.password.message : ""}
                />

                <Button
                  type='submit'
                  disabled={isLoading || isSubmitting}
                  className='w-full py-3 bg-gradient-to-r from-[#0b80c3] to-[#0d9ae6] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
                >
                  {isLoading || isSubmitting ? 'Logging in...' : 'Log In'}
                </Button>

                {/* Divider */}
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#bbdefb]" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white/70 text-[#546e7a] font-medium">Or continue with</span>
                  </div>
                </div>

                {/* OAuth Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleGoogleLogin}
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border-2 border-[#bbdefb] text-[#546e7a] font-semibold rounded-full hover:border-[#0b80c3] hover:bg-[#f0f8ff] transition-all duration-300"
                  >
                    <FcGoogle className="text-xl" />
                    Google
                  </Button>
                  <Button
                    onClick={handleGithubLogin}
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border-2 border-[#bbdefb] text-[#546e7a] font-semibold rounded-full hover:border-[#0b80c3] hover:bg-[#f0f8ff] transition-all duration-300"
                  >
                    <FaGithub className="text-gray-900 text-lg" />
                    GitHub
                  </Button>
                </div>

                {/* Sign Up Link */}
                <div className="text-center mt-4 text-sm">
                  <span className="text-[#546e7a]">Don't have an account? </span>
                  <Link
                    to="/signup"
                    className="text-[#0b80c3] hover:text-[#0d9ae6] font-semibold hover:underline transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;