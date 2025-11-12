/**
 * Sign up page with updated display to match login page.
 */
import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@headlessui/react';
import Textbox from '../components/Textbox';
import logo from '../assets/logo.png';
import toast from 'react-hot-toast';
import { useSignupMutation } from '../redux/slices/userSlice.js';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

const Signup = () => {
    const navigate = useNavigate();
    const [signup, { isLoading }] = useSignupMutation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        reset
    } = useForm();

    const password = watch("password", "");

    // OAuth handlers
    const handleGoogleSignup = () => {
      window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/auth/google`;
    };

    const handleGithubSignup = () => {
      window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/auth/github`;
    };

    // Debounced submit handler to prevent rapid submissions
    const onSubmit = useCallback(async (data) => {
        // Prevent multiple submissions
        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            // Convert email, firstName, and lastName to proper format
            const userData = {
                ...data,
                email: data.email.toLowerCase(),
                firstName: data.firstName.charAt(0).toUpperCase() + data.firstName.slice(1).toLowerCase(),
                lastName: data.lastName.charAt(0).toUpperCase() + data.lastName.slice(1).toLowerCase()
            };

            // Remove confirmPassword from data before sending to API
            delete userData.confirmPassword;

            // Trigger the signup mutation
            await signup(userData).unwrap();

            // Show success toast
            toast.success("Account created successfully! Please check your email to verify your account.", {
                duration: 3000,
            });

            reset();

            // Redirect to projects immediately
            navigate('/projects');

        } catch (error) {
            console.error('Signup failed:', error);

            // Enhanced error handling with specific messages
            if (error?.data) {
                if (error.status === 409 || error.data?.message?.includes('already exists')) {
                    toast.error("An account with this email already exists.");
                } else if (error.status === 500) {
                    toast.error("Server error. Please try again later.");
                } else {
                    toast.error(error.data?.message || "Registration failed. Please check your inputs.");
                }
            } else if (error?.error) {
                toast.error("Network error. Please check your connection.");
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            // Re-enable form after 1 second to prevent spam
            setTimeout(() => setIsSubmitting(false), 1000);
        }
    }, [isSubmitting, signup, navigate, reset]);

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
                                Start Your Journey
                            </h2>
                            <p className='text-lg text-[#546e7a] max-w-md'>
                                Create your account and begin navigating your work to conquer your goals
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

                {/* Right side - Signup Form */}
                <div className='w-full lg:w-auto flex justify-center'>
                    <div className='w-full max-w-md'>
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className='bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-[#bbdefb]/50 p-8 md:p-10'
                        >
                            <div className='mb-8'>
                                <h3 className='text-2xl font-bold text-[#0b80c3] text-center mb-2'>
                                    Sign Up
                                </h3>
                                <p className='text-sm text-[#546e7a] text-center'>
                                    Create your account to get started
                                </p>
                            </div>

                            <div className='flex flex-col gap-5'>
                                <div className='flex gap-3'>
                                    <div className='flex-1'>
                                        <Textbox
                                            placeholder='First Name'
                                            type='text'
                                            name='firstName'
                                            register={register("firstName", {
                                                required: "Required"
                                            })}
                                            error={errors.firstName ? errors.firstName.message : ""}
                                            className='w-full rounded-full'
                                        />
                                    </div>
                                    <div className='flex-1'>
                                        <Textbox
                                            placeholder='Last Name'
                                            type='text'
                                            name='lastName'
                                            register={register("lastName", {
                                                required: "Required"
                                            })}
                                            error={errors.lastName ? errors.lastName.message : ""}
                                            className='w-full rounded-full'
                                        />
                                    </div>
                                </div>

                                <Textbox
                                    placeholder='email@example.com'
                                    type='email'
                                    name='email'
                                    label='Email Address'
                                    register={register("email", {
                                        required: "Email required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address"
                                        }
                                    })}
                                    error={errors.email ? errors.email.message : ""}
                                    className='w-full rounded-full'
                                />

                                <Textbox
                                    placeholder='Password'
                                    type='password'
                                    name='password'
                                    label='Password'
                                    register={register("password", {
                                        required: "Password required",
                                        minLength: {
                                            value: 8,
                                            message: "Your password must be at least 8 characters long and include an uppercase letter and a number."
                                        },
                                        pattern: {
                                            value: /^(?=.*[A-Z])(?=.*\d).+$/,
                                            message: "Your password must contain at least one uppercase letter (A-Z) and one number (0-9)."
                                        }
                                    })}
                                    error={errors.password ? errors.password.message : ""}
                                    className='w-full rounded-full'
                                />

                                <Textbox
                                    placeholder='Confirm Password'
                                    type='password'
                                    name='confirmPassword'
                                    label='Confirm Password'
                                    register={register("confirmPassword", {
                                        validate: (value) => value === password || 'Passwords do not match'
                                    })}
                                    error={errors.confirmPassword ? errors.confirmPassword.message : ""}
                                    className='w-full rounded-full'
                                />

                                <Button
                                    type='submit'
                                    className='w-full py-3 bg-gradient-to-r from-[#0b80c3] to-[#0d9ae6] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
                                    disabled={isLoading || isSubmitting}
                                >
                                    {isLoading || isSubmitting ? 'Signing Up...' : 'Sign Up'}
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
                                        onClick={handleGoogleSignup}
                                        type="button"
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border-2 border-[#bbdefb] text-[#546e7a] font-semibold rounded-full hover:border-[#0b80c3] hover:bg-[#f0f8ff] transition-all duration-300"
                                    >
                                        <FcGoogle className="text-xl" />
                                        Google
                                    </Button>
                                    <Button
                                        onClick={handleGithubSignup}
                                        type="button"
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border-2 border-[#bbdefb] text-[#546e7a] font-semibold rounded-full hover:border-[#0b80c3] hover:bg-[#f0f8ff] transition-all duration-300"
                                    >
                                        <FaGithub className="text-gray-900 text-lg" />
                                        GitHub
                                    </Button>
                                </div>

                                {/* Login Link */}
                                <div className="text-center mt-4 text-sm">
                                    <span className="text-[#546e7a]">Already have an account? </span>
                                    <Link
                                        to="/login"
                                        className="text-[#0b80c3] hover:text-[#0d9ae6] font-semibold hover:underline transition-colors"
                                    >
                                        Log In
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

export default Signup;