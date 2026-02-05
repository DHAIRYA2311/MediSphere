import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await api.post('auth/reset_password.php', { token, password });
            if (res.success) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center p-4">
                <div className="text-center">
                    <h3 className="text-danger">Invalid Reset Link</h3>
                    <p className="text-muted">This password reset link is invalid or has expired.</p>
                    <Link to="/forgot-password" title="Medisphere | Forgot Password" className="btn btn-primary rounded-pill px-4">Request New Link</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card border-0 shadow-lg rounded-4 p-4 p-md-5"
                style={{ maxWidth: '450px', width: '100%' }}
            >
                {!success ? (
                    <>
                        <div className="text-center mb-4">
                            <div className="bg-danger bg-opacity-10 text-danger rounded-circle d-inline-flex p-3 mb-3">
                                <Lock size={32} />
                            </div>
                            <h2 className="fw-bold text-dark">Set New Password</h2>
                            <p className="text-muted">Choose a secure password for your account.</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {error && (
                                <div className="alert alert-danger border-0 small rounded-3 py-2">
                                    {error}
                                </div>
                            )}

                            <div className="mb-3">
                                <label className="form-label small fw-bold text-uppercase text-muted">New Password</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0 rounded-start-3">
                                        <Lock size={18} className="text-muted" />
                                    </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control border-start-0 py-2"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="input-group-text bg-white border-start-0 rounded-end-3"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} className="text-muted" /> : <Eye size={18} className="text-muted" />}
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label small fw-bold text-uppercase text-muted">Confirm Password</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0 rounded-start-3">
                                        <Lock size={18} className="text-muted" />
                                    </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control border-start-0 rounded-end-3 py-2"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-danger w-100 rounded-pill py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                    <>Update Password <ArrowRight size={18} /></>
                                )}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <div className="text-success mb-3">
                            <CheckCircle size={64} className="mx-auto" />
                        </div>
                        <h2 className="fw-bold text-dark mb-2">Password Reset!</h2>
                        <p className="text-muted mb-4">Your password has been updated successfully. Redirecting you to login...</p>
                        <Link to="/login" title="Medisphere | Login" className="btn btn-primary rounded-pill px-5">Go to Login</Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPassword;
