import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiLock, FiPhone, FiUser } from 'react-icons/fi';
import { GiLotus } from 'react-icons/gi';
import { useAuth } from '../contexts/AuthContext';

export default function AuthPage({ mode }) {
    const isRegister = mode === 'register';
    const navigate = useNavigate();
    const { login, register, user } = useAuth();
    const [form, setForm] = useState({ username: '', mobile_no: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (user) {
        return <Navigate to={user.role === 'admin' ? '/admin/stories' : '/stories'} replace />;
    }

    const updateField = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            const payload = isRegister
                ? form
                : { username: form.username, password: form.password };
            const data = isRegister ? await register(payload) : await login(payload);
            navigate(data.user.role === 'admin' ? '/admin/stories' : '/stories');
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 sm:pt-28 px-4 flex items-center justify-center parchment-bg">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-xl"
            >
                <div className="text-center mb-8">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-saffron/10 text-saffron">
                        <GiLotus className="text-3xl" />
                    </div>
                    <p className="text-saffron text-xs tracking-[0.3em] uppercase mb-2">
                        {isRegister ? 'Begin Your Journey' : 'Welcome Back'}
                    </p>
                    <h1 className="font-heading text-3xl text-[var(--text-primary)]">
                        {isRegister ? 'Create Account' : 'Login'}
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-2">
                        {isRegister
                            ? 'The first account becomes admin. Later accounts can read stories.'
                            : 'Sign in to continue exploring Mystic India.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="block">
                        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                            Username
                        </span>
                        <div className="mt-2 flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3">
                            <FiUser className="text-saffron" />
                            <input
                                value={form.username}
                                onChange={(e) => updateField('username', e.target.value)}
                                className="w-full bg-transparent text-sm outline-none text-[var(--text-primary)]"
                                required
                                minLength={3}
                            />
                        </div>
                    </label>

                    {isRegister && (
                        <label className="block">
                            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                Mobile Number
                            </span>
                            <div className="mt-2 flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3">
                                <FiPhone className="text-saffron" />
                                <input
                                    value={form.mobile_no}
                                    onChange={(e) => updateField('mobile_no', e.target.value)}
                                    className="w-full bg-transparent text-sm outline-none text-[var(--text-primary)]"
                                />
                            </div>
                        </label>
                    )}

                    <label className="block">
                        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                            Password
                        </span>
                        <div className="mt-2 flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3">
                            <FiLock className="text-saffron" />
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => updateField('password', e.target.value)}
                                className="w-full bg-transparent text-sm outline-none text-[var(--text-primary)]"
                                required
                                minLength={6}
                            />
                        </div>
                    </label>

                    {error && (
                        <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-saffron to-saffron-dark px-5 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-saffron/25 disabled:opacity-60"
                    >
                        {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
                        <FiArrowRight />
                    </button>
                </form>

                <p className="text-center text-sm text-[var(--text-muted)] mt-6">
                    {isRegister ? 'Already have an account?' : 'New here?'}{' '}
                    <Link
                        to={isRegister ? '/login' : '/register'}
                        className="font-medium text-saffron hover:underline"
                    >
                        {isRegister ? 'Login' : 'Register'}
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
