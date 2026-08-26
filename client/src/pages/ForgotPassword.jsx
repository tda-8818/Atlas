import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@headlessui/react';
import Textbox from '../components/Textbox';
import logo from '../assets/logo.png';
import toast from 'react-hot-toast';
import { useForgotPasswordMutation } from '../redux/slices/userSlice';

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [sent, setSent] = useState(false);

  const onSubmit = async (data) => {
    try {
      const result = await forgotPassword({ email: data.email.toLowerCase() }).unwrap();
      setSent(true);
      toast.success(result?.message || 'Check your email for a reset link.');
    } catch (err) {
      toast.error(err?.data?.message || 'Could not send reset email.');
    }
  };

  return (
    <div className='w-full min-h-screen flex items-center justify-center bg-[var(--background)]'>
      <div className='w-full max-w-md mx-auto px-6'>
        <div className='flex flex-col items-center gap-4 mb-8'>
          <img src={logo} alt="Atlas Logo" className="rounded-full w-16 h-16" />
          <h1 className='text-3xl font-bold text-[var(--text)]'>Reset password</h1>
          <p className='text-sm text-[var(--text-muted)] text-center'>
            Enter the email for your Atlas account. If it exists, we will send a reset link.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className='bg-[var(--background-modal)] rounded-2xl border border-[var(--border-color-accent)] p-8'
        >
          {sent ? (
            <p className='text-sm text-[var(--text)] text-center'>
              If that email is in Atlas, the reset link is on its way. It expires in one hour.
            </p>
          ) : (
            <div className='flex flex-col gap-5'>
              <Textbox
                placeholder='email@example.com'
                type='email'
                name='email'
                label='Email Address'
                className='w-full rounded-xl'
                register={register('email', {
                  required: 'Email address is required!',
                })}
                error={errors.email ? errors.email.message : ''}
              />
              <Button
                type='submit'
                disabled={isLoading}
                className='w-full py-3 bg-[var(--color-primary)] text-white font-medium rounded-xl disabled:opacity-50'
              >
                {isLoading ? 'Sending...' : 'Send reset link'}
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

export default ForgotPassword;
