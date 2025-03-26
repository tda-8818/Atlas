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
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm(); // Use react-hook-form

    const password = watch("password", ""); // Watch password input
    
    // Handles form submission
    const onSubmit = async (data) => {
        console.log(data);
        try {
            // API endpoint for sign up
            const response = await axios.post("http://localhost:5001/signup", data);
            console.log(response.data);
        } catch (axiosError) {
            if (axiosError.response && axiosError.response.status === 400) {
                // Check if the error is a duplicate username error
                if (axiosError.response.data.message === 'Username already exists') {
                    setError('Username already exists. Please choose a different username.');
                } else {
                    setError(axiosError.response.data.message || 'Signup failed. Please try again.');
                }
            } else {
                setError('Network error. Please try again.', axiosError.response.data.message);
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