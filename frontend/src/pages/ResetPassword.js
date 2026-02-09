import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
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

        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

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
            <div className="min-vh-100 d-flex align-items-center justify-content-center p-4 bg-light">
                <div className="text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-danger mb-3">
                        <ShieldCheck size={48} />
                    </motion.div>
                    <h3 className="fw-bold text-dark">Invalid Reset Link</h3>
                    <p className="text-muted mb-4">This password reset link is invalid or has expired.</p>
                    <Link to="/forgot-password" className="btn btn-primary rounded-pill px-5 py-2 fw-bold shadow-sm">Request New Link</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center p-4 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card border-0 shadow-2xl rounded-4 p-4 p-md-5 position-relative z-1"
                style={{ maxWidth: '450px', width: '100%', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)' }}
            >
                {!success ? (
                    <>
                        <div className="text-center mb-4">
                            <div className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex p-3 mb-3 shadow-sm">
                                <Lock size={32} />
                            </div>
                            <h2 className="fw-bold text-dark mb-1">Set New Password</h2>
                            <p className="text-muted small">Choose a secure password for your account.</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {error && (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="alert alert-danger border-0 small rounded-3 py-2 mb-3">
                                    {error}
                                </motion.div>
                            )}

                            <div className="mb-3">
                                <label className="form-label small fw-bold text-uppercase text-muted ms-1">New Password</label>
                                <div className="input-group shadow-sm rounded-3 overflow-hidden">
                                    <span className="input-group-text bg-white border-0 ps-3">
                                        <Lock size={18} className="text-muted" />
                                    </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control border-0 py-2"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        style={{ boxShadow: 'none' }}
                                    />
                                    <button
                                        type="button"
                                        className="input-group-text bg-white border-0"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} className="text-muted" /> : <Eye size={18} className="text-muted" />}
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label small fw-bold text-uppercase text-muted ms-1">Confirm Password</label>
                                <div className="input-group shadow-sm rounded-3 overflow-hidden">
                                    <span className="input-group-text bg-white border-0 ps-3">
                                        <Lock size={18} className="text-muted" />
                                    </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control border-0 py-2"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        style={{ boxShadow: 'none' }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow-lg d-flex align-items-center justify-content-center gap-2 hover-scale transition-all"
                                disabled={loading}
                                style={{ background: 'linear-gradient(45deg, #11998e, #38ef7d)', border: 'none' }}
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
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="text-success mb-3">
                            <CheckCircle size={80} className="mx-auto" style={{ filter: 'drop-shadow(0px 10px 10px rgba(40,167,69,0.3))' }} />
                        </motion.div>
                        <h2 className="fw-bold text-dark mb-2">All Set!</h2>
                        <p className="text-muted mb-4">Your password has been updated successfully.<br />Redirecting you to login...</p>
                        <Link to="/login" className="btn btn-outline-dark rounded-pill px-5 shadow-sm fw-bold">Go to Login</Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPassword;
