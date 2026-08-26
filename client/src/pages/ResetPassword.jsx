import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@headlessui/react';
import Textbox from '../components/Textbox';
import logo from '../assets/logo.png';
import toast from 'react-hot-toast';
import { useResetPasswordMutation } from '../redux/slices/userSlice';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [done, setDone] = useState(false);
  const password = watch('password', '');

  const onSubmit = async (data) => {
    try {
      await resetPassword({ token, password: data.password }).unwrap();
      setDone(true);
      toast.success('Password updated. You are logged in.');
      setTimeout(() => navigate('/projects'), 1200);
    } catch (err) {
      toast.error(err?.data?.message || 'Could not reset password. The link may have expired.');
    }
  };

  return (
    <div className='w-full min-h-screen flex items-center justify-center bg-[var(--background)]'>
      <div className='w-full max-w-md mx-auto px-6'>
        <div className='flex flex-col items-center gap-4 mb-8'>
          <img src={logo} alt="Atlas Logo" className="rounded-full w-16 h-16" />
          <h1 className='text-3xl font-bold text-[var(--text)]'>Choose a new password</h1>
          <p className='text-sm text-[var(--text-muted)] text-center'>
            At least 8 characters, with one uppercase letter and one number.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className='bg-[var(--background-modal)] rounded-2xl border border-[var(--border-color-accent)] p-8'
        >
          {done ? (
            <p className='text-sm text-[var(--text)] text-center'>Redirecting to your projects...</p>
          ) : (
            <div className='flex flex-col gap-5'>
              <Textbox
                placeholder='New password'
                type='password'
                name='password'
                label='New password'
                className='w-full rounded-xl'
                register={register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'At least 8 characters, with an uppercase letter and a number.',
                  },
                  pattern: {
                    value: /^(?=.*[A-Z])(?=.*\d).+$/,
                    message: 'Must include an uppercase letter and a number.',
                  },
                })}
                error={errors.password ? errors.password.message : ''}
              />
              <Textbox
                placeholder='Confirm password'
                type='password'
                name='confirmPassword'
                label='Confirm password'
                className='w-full rounded-xl'
                register={register('confirmPassword', {
                  validate: (value) => value === password || 'Passwords do not match',
                })}
                error={errors.confirmPassword ? errors.confirmPassword.message : ''}
              />
              <Button
                type='submit'
                disabled={isLoading}
                className='w-full py-3 bg-[var(--color-primary)] text-white font-medium rounded-xl disabled:opacity-50'
              >
                {isLoading ? 'Saving...' : 'Update password'}
              </Button>
            </div>
          )}

          <div className='text-center mt-6 text-sm'>
            <Link to='/login' className='text-[var(--color-primary)] hover:underline'>
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
