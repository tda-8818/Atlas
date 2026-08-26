import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const apiRoot = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiRoot}/api/users/verify-email/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Your email has been verified successfully!');

          // Redirect to projects after 3 seconds
          setTimeout(() => {
            navigate('/projects');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. The link may be invalid or expired.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('No verification token provided.');
    }
  }, [token, navigate]);

  return (
    <div className='w-full min-h-screen flex items-center justify-center flex-col bg-gradient-to-br from-[#f0f8ff] via-white to-[#e3f2fd]'>
      <div className='w-full md:max-w-md flex flex-col items-center justify-center gap-8 p-8'>
        {/* Logo */}
        <div className='flex flex-col items-center gap-4'>
          <img src={logo} alt="Atlas Logo" className="rounded-full w-24 h-24 shadow-lg" />
          <h1 className='text-4xl font-black bg-gradient-to-r from-[#0b80c3] to-[#0d9ae6] bg-clip-text text-transparent'>
            Atlas
          </h1>
          <p className='text-sm text-[#546e7a] font-medium'>Navigate Your Work, Conquer Your Goals</p>
        </div>

        {/* Verification Card */}
        <div className='w-full bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-[#bbdefb]/50 p-8'>
          {status === 'verifying' && (
            <div className='text-center'>
              <div className='flex justify-center mb-4'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#0b80c3]'></div>
              </div>
              <h2 className='text-2xl font-bold text-[#0b80c3] mb-2'>Verifying your email...</h2>
              <p className='text-[#546e7a]'>Please wait while we verify your email address.</p>
            </div>
          )}

          {status === 'success' && (
            <div className='text-center'>
              <div className='flex justify-center mb-4'>
                <svg className='w-16 h-16 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              </div>
              <h2 className='text-2xl font-bold text-green-600 mb-2'>Email Verified!</h2>
              <p className='text-[#546e7a] mb-4'>{message}</p>
              <p className='text-sm text-[#546e7a]'>Redirecting you to your projects...</p>
            </div>
          )}

          {status === 'error' && (
            <div className='text-center'>
              <div className='flex justify-center mb-4'>
                <svg className='w-16 h-16 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              </div>
              <h2 className='text-2xl font-bold text-red-600 mb-2'>Verification Failed</h2>
              <p className='text-[#546e7a] mb-6'>{message}</p>

              <div className='flex flex-col gap-3'>
                <Link
                  to='/login'
                  className='w-full py-3 bg-gradient-to-r from-[#0b80c3] to-[#0d9ae6] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center'
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        {status === 'error' && (
          <div className='text-center text-sm text-[#546e7a] bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-[#bbdefb]/30'>
            <p>Need help? Contact support or try requesting a new verification email after logging in.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
