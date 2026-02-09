import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('auth/forgot_password.php', { email });
            if (res.success) {
                setSubmitted(true);
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center p-4 position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            {/* Background Decor */}
            <div className="position-absolute top-0 start-0 w-100 h-100 opacity-50" style={{ background: 'radial-gradient(circle at 10% 20%, rgba(98, 114, 255, 0.1) 0%, transparent 40%)' }}></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card border-0 shadow-lg rounded-4 p-4 p-md-5 position-relative z-1"
                style={{ maxWidth: '480px', width: '100%', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)' }}
            >
                <div className="text-center mb-5">
                    <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                        className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex p-4 mb-3 shadow-inner"
                    >
                        <HelpCircle size={40} />
                    </motion.div>
                    <h2 className="fw-bold text-dark mb-1">Forgot Password?</h2>
                    <p className="text-muted">No worries, we'll send you reset instructions.</p>
                </div>

                {!submitted ? (
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="alert alert-danger border-0 small rounded-3 py-2 mb-4">
                                {error}
                            </motion.div>
                        )}
                        <div className="mb-4">
                            <label className="form-label small fw-bold text-uppercase tracking-wider text-muted ms-1">Email Address</label>
                            <div className="input-group shadow-sm rounded-3 overflow-hidden">
                                <span className="input-group-text bg-white border-0 ps-3">
                                    <Mail size={18} className="text-muted" />
                                </span>
                                <input
                                    type="email"
                                    className="form-control border-0 py-3 fs-6"
                                    placeholder="Enter your registered email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{ boxShadow: 'none' }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow-lg d-flex align-items-center justify-content-center gap-2 mb-4 hover-scale transition-all"
                            disabled={loading}
                            style={{ background: 'linear-gradient(45deg, #2193b0, #6dd5ed)', border: 'none' }}
                        >
                            {loading ? (
                                <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                                <>Reset Password <Send size={18} /></>
                            )}
                        </button>
                    </form>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                        <div className="alert alert-success border-0 rounded-4 p-4 mb-4 bg-success bg-opacity-10 text-success">
                            <CheckCircle size={32} className="mb-2" />
                            <h6 className="fw-bold mb-2">Check your email</h6>
                            <p className="small mb-0">We have sent a password reset link to <br /><strong>{email}</strong></p>
                        </div>
                        <button
                            className="btn btn-outline-primary w-100 rounded-pill py-2 fw-bold"
                            onClick={() => setSubmitted(false)}
                        >
                            Didn't receive email? Try again
                        </button>
                    </motion.div>
                )}

                <div className="text-center mt-2 border-top pt-4">
                    <Link to="/login" className="text-decoration-none text-muted small d-inline-flex align-items-center gap-2 fw-bold hover-primary transition-all">
                        <ArrowLeft size={16} /> Back to Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
