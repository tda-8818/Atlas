/**
 * Sign up page.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/Button';

const Signup = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Handles form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        // Send a POST request to the backend API endpoint to create a new user
        axios.post('http://localhost:5173/signup', { firstName, lastName, email, password })
            .then(result => console.log(result))
            .catch(err => console.error(err));
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100"> {/* centres signup form */}
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h2>Sign Up</h2>
                <form onSubmit={handleSubmit}> {/* calls handle submit here */}
                    <input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="password"
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                    <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Sign Up</button>
                </form>

                <p className="mt-4 text-center">Or sign up with:</p>
                <button className="border p-2 rounded">Google</button>
                <button className="border p-2 rounded">GitHub</button>
                <p>
                    Already have an account? <Link to="/login" className="hover:underline">Login</Link>
                </p>
            </div>

        </div>

    );
};

export default Signup;