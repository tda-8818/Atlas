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
import { FaGoogle, FaGithub } from 'react-icons/fa';

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
        <div className='w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#F4F9F9]'>
            <div className='w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center'>
                {/* Left side - logo and app name */}
                <div className='h-full w-full lg:w-2/3 flex flex-col items-center justify-center'>
                    <div className='w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20'>
                        <img src={logo} alt="Logo" className="rounded-full w-32 h-32" />
                        <p className='flex flex-col gap-0 md:gap-4 text-4xl md:text-6xl 2xl:text-7xl font-black text-center text-[#1B4965]'>
                            <span>Atlas</span>
                        </p>
                    </div>
                </div>

                {/* Right side - form */}
                <div className='w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center'>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className='form-container w-full md:w-[400px] flex flex-col gap-y-8 bg-white px-10 pt-14 pb-14'
                    >
                        <div className=''>
                            <p className='text-[#1B4965] text-3xl font-bold text-center'>
                                Sign Up
                            </p>
                        </div>

                        <div className='flex flex-col gap-y-4'>
                            <div className='flex gap-x-2'>
                                <div className='w-1/2'>
                                    <Textbox
                                        placeholder='First Name'
                                        type='text'
                                        name='firstName'
                                        register={register("firstName", {
                                            required: "Required"
                                        })}
                                        error={errors.firstName ? errors.firstName.message : ""}
                                        className='w-full rounded-full text-sm'
                                    />
                                </div>
                                <div className='w-1/2'>
                                    <Textbox
                                        placeholder='Last Name'
                                        type='text'
                                        name='lastName'
                                        register={register("lastName", {
                                            required: "Required"
                                        })}
                                        error={errors.lastName ? errors.lastName.message : ""}
                                        className='w-full rounded-full text-sm'
                                    />
                                </div>
                            </div>

                            <Textbox
                                placeholder='Email'
                                type='email'
                                name='email'
                                register={register("email", {
                                    required: "Email required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                                error={errors.email ? errors.email.message : ""}
                                className='w-full rounded-full text-sm'
                            />

                            <Textbox
                                placeholder='Password'
                                type='password'
                                name='password'
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
                                className='w-full rounded-full text-sm'
                            />

                            <Textbox
                                placeholder='Confirm Password'
                                type='password'
                                name='confirmPassword'
                                register={register("confirmPassword", {
                                    validate: (value) => value === password || 'Passwords do not match'
                                })}
                                error={errors.confirmPassword ? errors.confirmPassword.message : ""}
                                className='w-full rounded-full text-sm'
                            />

                            <Button
                                type='submit'
                                className='w-full h-10 bg-[var(--color-primary)] text-white rounded-full'
                                disabled={isLoading || isSubmitting}
                            >
                                {isLoading || isSubmitting ? 'Signing Up...' : 'Sign Up'}
                            </Button>

                            {/* OAuth Buttons */}
                            <div className="flex flex-col gap-2 mt-4">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleGoogleSignup}
                                        className="flex-1 flex items-center justify-center gap-2 h-10 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50"
                                    >
                                        <FaGoogle className="text-red-500" />
                                        Google
                                    </Button>
                                    <Button
                                        onClick={handleGithubSignup}
                                        className="flex-1 flex items-center justify-center gap-2 h-10 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50"
                                    >
                                        <FaGithub className="text-gray-900" />
                                        GitHub
                                    </Button>
                                </div>
                            </div>

                            <div className="text-center mt-4 text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="text-[var(--color-primary)] hover:underline font-medium"
                                >
                                    Login
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;