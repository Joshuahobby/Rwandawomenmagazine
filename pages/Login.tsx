import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageView } from '../types';

interface LoginProps {
    navigate: (page: PageView) => void;
}

const Login: React.FC<LoginProps> = ({ navigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const emailTrimmed = email.trim();
        const passwordTrimmed = password.trim();

        if (!emailTrimmed || !passwordTrimmed) {
            setError('Please enter both email and password');
            setIsLoading(false);
            return;
        }

        try {
            const response = await api.post('/auth/login', { email: emailTrimmed, password: passwordTrimmed });
            const { user, token } = response.data;
            login(user, token);
            navigate('DASHBOARD');
        } catch (err: any) {
            console.error('Login error:', err);
            // Handle both structure: { message: "..." } and { error: "..." }
            const msg = err.response?.data?.error || err.response?.data?.message || 'Invalid email or password';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md w-full space-y-8 bg-white p-10 shadow-2xl border-t-8 border-primary">
                <div className="text-center">
                    <img
                        src="/uploads/logo.png"
                        alt="Rwanda Women Magazine"
                        className="h-24 w-auto mx-auto mb-4 object-contain"
                    />
                    <p className="mt-4 text-sm font-medium text-gray-500 uppercase tracking-widest">
                        Magazine CMS Login
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm flex items-center gap-3">
                            <span className="material-icons text-lg">error_outline</span>
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1" htmlFor="email">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="admin@rwandawomen.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-1" htmlFor="password">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold uppercase tracking-widest text-white bg-primary hover:bg-opacity-90 focus:outline-none transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => navigate('HOME')}
                            className="text-xs font-medium text-gray-500 hover:text-primary transition-colors flex items-center justify-center gap-1 mx-auto"
                        >
                            <span className="material-icons text-sm">arrow_back</span>
                            Back to Website
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
