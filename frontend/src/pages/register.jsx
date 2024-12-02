import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import API_BASE_URL from '../apiConfig'; // Import API_BASE_URL

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/register`, { // Updated URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Registration successful');
                navigate('/login');
            } else {
                setErrorMessage(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Error during registration:', error);
            setErrorMessage('An error occurred during registration');
        }
    };

    return (
        <div className="relative py-3 sm:max-w-xl sm:mx-auto w-full">
            <div className="relative px-4 py-10 bg-gray-900 mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
                <div className="max-w-md mx-auto text-white">
                    <h2 className="text-2xl font-bold text-center mb-6">
                        Get Started Today!
                    </h2>

                    <div className="mt-5">
                        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
                        <form onSubmit={handleRegister}>
                            <label htmlFor="username" className="font-semibold text-sm text-gray-400 pb-1 block">Username</label>
                            <input
                                id="username"
                                type="text"
                                className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full bg-gray-800 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
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
                            <label htmlFor="confirmPassword" className="font-semibold text-sm text-gray-400 pb-1 block">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full bg-gray-800 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <div className="flex justify-center items-center">
                                <button
                                    type="submit"
                                    className="flex items-center justify-center py-2 px-20 bg-white hover:bg-gray-200 focus:ring-blue-500 focus:ring-offset-blue-200 text-gray-700 w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
                                >
                                    <i className="fas fa-user-plus mr-2"></i> Register
                                </button>
                            </div>
                            <p className="text-center text-gray-400 text-sm mt-4">
                                Already have an account? <Link to="/login" className="text-blue-500">Login here</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
