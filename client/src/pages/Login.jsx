import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation, useGetCurrentUserQuery } from '../redux/slices/apiSlice';
import logo from '../assets/logo.png';
import Textbox from '../components/Textbox';
import { Button } from '@headlessui/react';

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const [login, { isLoading, error }] = useLoginMutation();
  const { refetch } = useGetCurrentUserQuery(); // Add this


  const onSubmit = async (data) => {
    try {
      
      // 2. Make login request
      await login(data).unwrap();
      
      // 3. Verify cookie was set
      console.log('Document cookies:', document.cookie);
      
      // 4. Force refresh to ensure auth state updates
      window.location.href = '/home';
      
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.data?.message || 'Login failed');
    }
  };

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
                    value: 6,
                    message: "Password must be at least 6 characters"
                  }
                })}
                error={errors.password ? errors.password.message : ""}
              />

              <Button
                type='submit'
                label={isLoading ? 'Logging in...' : 'Login'}
                disabled={isLoading}
                className='w-full h-10 bg-blue-700 text-white rounded-full'
              />

              {error && (
                <div className="text-red-500 text-center mt-2">
                  {error.data?.message || 'Login failed'}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;