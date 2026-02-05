import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
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
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card border-0 shadow-lg rounded-4 p-4 p-md-5"
                style={{ maxWidth: '450px', width: '100%' }}
            >
                <div className="text-center mb-4">
                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex p-3 mb-3">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="fw-bold text-dark">Forgot Password?</h2>
                    <p className="text-muted">No worries, we'll send you reset instructions.</p>
                </div>

                {!submitted ? (
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="alert alert-danger border-0 small rounded-3 py-2">
                                {error}
                            </div>
                        )}
                        <div className="mb-4">
                            <label className="form-label small fw-bold text-uppercase tracking-wider text-muted">Email Address</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0 rounded-start-3 pe-0">
                                    <Mail size={18} className="text-muted" />
                                </span>
                                <input
                                    type="email"
                                    className="form-control border-start-0 rounded-end-3 py-2 fs-6"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100 rounded-pill py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 mb-3"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                                <>Reset Password <Send size={18} /></>
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="text-center">
                        <div className="alert alert-success border-0 rounded-4 p-4 mb-4">
                            <h6 className="fw-bold mb-2">Check your email</h6>
                            <p className="small mb-0">We have sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the link.</p>
                        </div>
                        <button
                            className="btn btn-outline-primary w-100 rounded-pill py-2 fw-bold"
                            onClick={() => setSubmitted(false)}
                        >
                            Didn't receive email? Try again
                        </button>
                    </div>
                )}

                <div className="text-center mt-4">
                    <Link to="/login" className="text-decoration-none text-muted small d-inline-flex align-items-center gap-2 hover-primary">
                        <ArrowLeft size={16} /> Back to Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
