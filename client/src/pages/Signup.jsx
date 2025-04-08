/**
 * Sign up page.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { Transition, Button, Input } from '@headlessui/react';
import ErrorMessage from '../components/ErrorMessage';

const Signup = () => {
    const [error, setError] = useState(""); // Error message state
    const [success, setSuccess] = useState(""); // Success message state
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm(); // Use react-hook-form

    const password = watch("password", ""); // Watch password input

    // Handles form submission
    const onSubmit = async (data) => {
        setError(""); // Reset error message
        setSuccess(""); // Reset success message
       
        try {
            // Remove confirmPassword from data before sending to API
            const { confirmPassword, ...userData } = data;
            // API endpoint for signup
            const response = await axios.post(
                "http://localhost:5001/api/users/signup",
                userData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            setSuccess("Account created successfully! Redirecting to login...");
            reset();

            // Redirect after 2 seconds
            setTimeout(() => navigate('/login'), 2000);

        } catch (error) {
            // Enhanced error handling
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        if (error.response.data?.message?.includes('already exists')) {
                            setError("An account with this email already exists");
                        } else {
                            setError("Invalid registration data. Please check your inputs.");
                        }
                        break;
                    case 409:
                        setError("An account with this email already exists.");
                        break;
                    case 500:
                        setError("Server error. Please try again later.");
                        break;
                    default:
                        setError("Registration failed. Please try again.");
                }
            } else if (error.request) {
                setError("Network error. Please check your connection.");
            } else {
                setError("An unexpected error occurred.");
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100"> {/* centres signup form */}
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-semibold mb-6">Sign Up</h2>
                <form onSubmit={handleSubmit(onSubmit)}> {/* calls handle submit here */}

                    <Input
                        type="text"
                        id="firstName"
                        placeholder="First Name"
                        {...register("firstName", {
                            required: "First name is required!",
                            minLength: {
                                value: 2,
                                message: "First name must be at least 2 characters"
                            }
                        })}
                        className="w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 relative"
                    />
                    <ErrorMessage message={errors.firstName?.message} />


                    <Input
                        type="text"
                        id="lastName"
                        placeholder="Last Name"
                        {...register("lastName", {
                            required: "Last name is required!",
                            minLength: {
                                value: 2,
                                message: "Last name must be at least 2 characters"
                            }
                        })}
                        className="w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 relative"
                    />
                    <ErrorMessage message={errors.lastName?.message} />

                    <Input
                        type="email"
                        id="email"
                        placeholder="Email"
                        {...register("email", {
                            required: "Email is required!",
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@student\.monash\.edu$/,
                                message: "Email must be a valid Monash address",
                            }
                        })}
                        className="w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 relative"
                    />
                    <ErrorMessage message={errors.email?.message} />

                    <Input
                        type="password"
                        id="password"
                        placeholder="New Password"
                        {...register("password", {
                            minLength: { value: 8, message: "Password must be at least 8 characters long" },
                            pattern: { value: /^(?=.*[A-Z])(?=.*\d).+$/, message: "Password must contain at least one upper case letter and one number" },
                        })}
                        className="w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 relative"
                    />
                    <ErrorMessage message={errors.password?.message} />

                    <Input
                        type="password"
                        id="confirmPassword"
                        placeholder="Confirm Password"
                        {...register('confirmPassword', {
                            validate: (value) => value === password || 'Passwords do not match.',
                        })}
                        className="w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 relative"
                    />
                    <ErrorMessage message={errors.confirmPassword?.message} />




                    {error && (
                        <Transition
                            show={!!error}
                            enter="transition-opacity duration-75"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity duration-150"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <p className="text-red-500">{error}</p>
                        </Transition>
                    )}

                    {success && ( // Display success message
                        <Transition
                            show={!!success}
                            enter="transition-opacity duration-75"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity duration-150"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <p className="text-green-500">{success}</p>
                        </Transition>
                    )}


                    <Button type="submit" className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600">Sign Up</Button>
                </form>
                <p>
                    Already have an account? <Link to="/login" className="hover:underline">Login</Link>
                </p>
            </div>

        </div>

    );
};

export default Signup;