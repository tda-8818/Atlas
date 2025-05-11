/**
 * Sign up page with updated display to match login page.
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Transition, Button } from '@headlessui/react';
import Textbox from '../components/Textbox';
import logo from '../assets/logo.png';
import { showErrorToast } from '../components/errorToast.jsx'; // Import the toast utility
import toast from 'react-hot-toast'; // Import toast for success messages
import { useSignupMutation } from '../redux/slices/userSlice.js';

const Signup = () => {
    const navigate = useNavigate();
    const [signup, { isLoading }] = useSignupMutation(); // Use the signup mutation hook

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        reset
    } = useForm(); // Use react-hook-form

    const password = watch("password", ""); // Watch password input

    // Handles form submission
    const onSubmit = async (data) => {
        try {
            // Convert email, firstName, and lastName to lowercase
            const userData = {
                ...data,
                email: data.email.toLowerCase(),
                firstName: data.firstName.toLowerCase(),
                lastName: data.lastName.toLowerCase(),
            };

            // Remove confirmPassword from data before sending to API
            delete userData.confirmPassword;

            // Trigger the signup mutation
            const result = await signup(userData).unwrap();

            // Show success toast
            toast.success("Account created successfully! Redirecting to login...", {
                duration: 2000,
                position: "bottom-right"
            });

            reset();

            // Redirect after 2 seconds
            setTimeout(() => navigate('/home'), 2000);

        } catch (error) {
            // Enhanced error handling with toast notifications based on RTK Query error structure
            if (error?.data) {
                switch (error.data.status) {
                    case 400:
                        if (error.data?.message?.includes('already exists')) {
                            showErrorToast("An account with this email already exists", "400");
                        } else {
                            showErrorToast("Invalid registration data. Please check your inputs.", "400");
                        }
                        break;
                    case 409:
                        showErrorToast("An account with this email already exists.", "409");
                        break;
                    case 500:
                        showErrorToast("Server error. Please try again later.", "500");
                        break;
                    default:
                        showErrorToast(`Registration failed: ${error.data.message}`, error.data.status.toString());
                }
            } else if (error?.error) {
                showErrorToast(`Network error: ${error.error}`, "network");
            } else {
                showErrorToast("An unexpected error occurred.", "error");
            }
        }
    };

    return (
        <div className='w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#F4F9F9]'>
            <div className='w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center'>
                {/* Left side - logo and app name */}
                <div className='h-full w-full lg:w-2/3 flex flex-col items-center justify-center'>
                    <div className='w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20'>
                        <img src={logo} alt="Logo" className="rounded-full w-32 h32" />
                        <p className='flex flex-col gap-0 md:gap-4 text-4xl md:text-6xl 2xl:text-7xl font-black text-center text-[#1B4965]'>
                            <span>UniFlow</span>
                        </p>
                    </div>
                </div>

                {/* Right side - form */}
                <div className='w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center'>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className='form-container w-full md:w-[400px] flex flex-col gap-y-5 bg-white px-10 pt-10 pb-10'
                    >
                        <div className='mb-2'>
                            <p className='text-[#1B4965] text-2xl font-bold text-center'>
                                Sign Up
                            </p>
                        </div>

                        <div className='flex flex-col gap-y-3'>
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
                                        value: /^[A-Z0-9._%+-]+@student\.monash\.edu$/i,
                                        message: "Must be a valid Monash student email"
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
                                className='w-full h-9 bg-blue-700 text-white rounded-full text-sm mt-1'
                                disabled={isLoading} // Disable button while signing up
                            >
                                {isLoading ? 'Signing Up...' : 'Sign Up'}
                            </Button>

                            {toast.success && (
                                <div className="text-green-500 text-center text-xs mt-1">
                                    {toast.success}
                                </div>
                            )}

                            <div className="text-center text-xs text-gray-600 mt-1">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="text-blue-600 hover:underline font-medium"
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