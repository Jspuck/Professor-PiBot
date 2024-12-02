import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import API_BASE_URL from '../apiConfig'; // Import API base URL

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API_BASE_URL}/api/login`, { // Use API_BASE_URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Login successful');
                navigate('/dashboard');
            } else {
                setErrorMessage(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Error during login:', error);
            setErrorMessage('An error occurred during login');
        }
    };

    return (
        <div className="relative py-3 sm:max-w-xl sm:mx-auto w-full">
            <div className="relative px-4 py-10 bg-gray-900 mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
                <div className="max-w-md mx-auto text-white">
                    <h2 className="text-2xl font-bold text-center mb-6">
                        Welcome Back!
                    </h2>

                    <div className="mt-5">
                        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
                        <form onSubmit={handleLogin}>
                            <label htmlFor="email" className="font-semibold text-sm text-gray-400 pb-1 block">Email</label>
                            <input
                                id="email"
                                type="email"
                                className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full bg-gray-800 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <label htmlFor="password" className="font-semibold text-sm text-gray-400 pb-1 block">Password</label>
                            <input
                                id="password"
                                type="password"
                                className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full bg-gray-800 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <div className="flex justify-center items-center mb-5">
                                <Link to="/forgot-password" className="text-xs font-semibold text-gray-400 hover:text-gray-300">
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="flex justify-center items-center">
                                <button
                                    type="submit"
                                    className="flex items-center justify-center py-2 px-20 bg-white hover:bg-gray-200 focus:ring-blue-500 focus:ring-offset-blue-200 text-gray-700 w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
                                >
                                    <i className="fas fa-sign-in-alt mr-2"></i> Login
                                </button>
                            </div>
                            <p className="text-center text-gray-400 text-sm mt-4">
                                Don’t have an account?{' '}
                                <Link to="/register" className="text-blue-500">Register here</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
