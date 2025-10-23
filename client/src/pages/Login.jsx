import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useLoginMutation } from '../redux/slices/userSlice';
import logo from '../assets/logo.png';
import Textbox from '../components/Textbox';
import { Button } from '@headlessui/react';
import { showErrorToast } from '../components/errorToast.jsx';
import toast from 'react-hot-toast';

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <div className='w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#F4F9F9]'>
      <div className='w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center'>
        {/* Left side - unchanged */}
        <div className='h-full w-full lg:w-2/3 flex flex-col items-center justify-center'>
          <div className='w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20'>
            <img src={logo} alt="Logo" className="rounded-full w-32 h32" />
            <p className='flex flex-col gap-0 md:gap-4 text-4xl md:text-6xl 2xl:text-7xl font-black text-center text-[#1B4965]'>
              <span>UniFlow</span>
            </p>
          </div>
        </div>

        {/* Right side - form with improved logic */}
        <div className='w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center'>
          <form
            onSubmit={handleSubmit(onSubmit)}
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
                label={isLoading || isSubmitting ? 'Logging in...' : 'Login'}
                disabled={isLoading || isSubmitting}
                className='w-full h-10 bg-blue-700 text-white rounded-full'
              >
                {isLoading || isSubmitting ? 'Logging in...' : 'Login'}
              </Button>

              <div className="text-center mt-4 text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-blue-600 hover:underline font-medium"
                >Sign Up</Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;