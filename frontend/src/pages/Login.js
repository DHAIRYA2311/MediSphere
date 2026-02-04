import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Activity, Wand2, CheckCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
    const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'magic'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (loginMethod === 'password') {
                const res = await login(email, password);
                if (res.success) {
                    navigate('/dashboard');
                } else {
                    setError(res.message);
                }
            } else {
                // Connection Test (GET)
                try {
                    const testRes = await fetch('http://127.0.0.1:8080/Medisphere-Project/backend/api/auth/test_get.php');
                    if (!testRes.ok) throw new Error("Test GET failed");
                    console.log("Connection Test OK");

                    // Real Call
                    const response = await fetch('http://127.0.0.1:8080/Medisphere-Project/backend/api/auth/send_magic_link.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email })
                    });

                    const text = await response.text();
                    try {
                        const data = JSON.parse(text);
                        if (data.success) {
                            setMagicLinkSent(true);
                            console.log("MAGIC LINK:", data.debug_link);
                        } else {
                            setError(data.message || "Failed to send magic link.");
                        }
                    } catch (e) {
                        console.error("Server Error:", text);
                        setError("Server Error: " + text.substring(0, 50));
                    }

                } catch (e) {
                    console.error(e);
                    setError("Network Error: Cannot connect to backend. " + e.message);
                }
            }
        } catch (err) {
            console.error("Critical Error", err);
            setError("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid min-vh-100 d-flex p-0 bg-white overflow-hidden">
            {/* Left Side - Hero Image */}
            <div className="d-none d-lg-flex col-lg-6 bg-light position-relative p-0 align-items-center justify-content-center overflow-hidden">
                <div className="position-absolute w-100 h-100" style={{ left: 0, top: 0 }}>
                    <img
                        src="/assets/images/login-hero.png"
                        alt="Medical Background"
                        className="w-100 h-100 object-fit-cover"
                        style={{ filter: 'brightness(0.9)' }}
                    />
                    {/* Overlay */}
                    <div className="position-absolute w-100 h-100 bg-primary bg-opacity-25" style={{ left: 0, top: 0, mixBlendMode: 'overlay' }}></div>
                    <div className="position-absolute w-100 h-100" style={{ background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)', left: 0, top: 0 }}></div>
                </div>

                <div className="position-relative z-1 p-5 text-end pe-5 me-5 fade-in-up">
                    <div className="d-inline-block p-3 rounded-circle bg-white bg-opacity-25 backdrop-blur shadow-lg mb-4">
                        <Activity size={48} className="text-primary" />
                    </div>
                    <h1 className="display-4 fw-bold text-dark mb-3 tracking-tight">Medisphere<br />Enterprise</h1>
                    <p className="lead text-secondary mb-4 opacity-75 fw-medium">
                        Next-Generation Hospital Management<br />& AI Diagnostics System
                    </p>
                    <div className="d-flex justify-content-end gap-3">
                        <div className="d-flex align-items-center gap-2 bg-white bg-opacity-50 px-3 py-2 rounded-pill shadow-sm">
                            <ShieldCheck size={18} className="text-success" />
                            <span className="small fw-bold text-dark">HIPAA Compliant</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="col-12 col-lg-6 d-flex flex-column align-items-center justify-content-center p-5 position-relative">

                {/* Mobile Header */}
                <div className="d-lg-none text-center mb-5">
                    <span className="d-flex align-items-center justify-content-center gap-2 mb-2">
                        <Activity size={32} className="text-primary" />
                        <span className="h3 fw-bold m-0">Medisphere</span>
                    </span>
                </div>

                <div className="w-100" style={{ maxWidth: '420px' }}>
                    <div className="mb-4">
                        <h2 className="fw-bold text-dark mb-2">Welcome Back</h2>
                        <p className="text-muted">Please sign in to your account</p>
                    </div>

                    {/* Method Toggle */}
                    <div className="d-flex bg-light p-1 rounded-3 mb-4 border">
                        <button
                            className={`flex-grow-1 btn btn-sm fw-bold rounded-2 transition-all ${loginMethod === 'password' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`}
                            onClick={() => { setLoginMethod('password'); setMagicLinkSent(false); setError(''); }}
                        >
                            <Lock size={14} className="me-2 mb-1" /> Password
                        </button>
                        <button
                            className={`flex-grow-1 btn btn-sm fw-bold rounded-2 transition-all ${loginMethod === 'magic' ? 'bg-white shadow-sm text-primary' : 'text-muted'}`}
                            onClick={() => { setLoginMethod('magic'); setError(''); }}
                        >
                            <Wand2 size={14} className="me-2 mb-1" /> Magic Link
                        </button>
                    </div>

                    <AnimatePresence mode='wait'>
                        {/* Success State for Magic Link */}
                        {magicLinkSent ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center p-5 bg-success bg-opacity-10 rounded-4 border border-success border-opacity-25"
                            >
                                <div className="mb-3 d-inline-flex bg-white rounded-circle p-3 shadow-sm">
                                    <Mail size={32} className="text-success" />
                                </div>
                                <h4 className="fw-bold text-success mb-2">Check your inbox!</h4>
                                <p className="text-muted small mb-4">
                                    We sent a secure magic link to <strong>{email}</strong>.<br />
                                    Click the link to sign in instantly.
                                </p>
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => setMagicLinkSent(false)}
                                >
                                    Try distinct email
                                </button>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onSubmit={handleSubmit}
                            >
                                {error && (
                                    <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small rounded-3 mb-4">
                                        <div className="flex-shrink-0"><Activity size={16} /></div>
                                        <div>{error}</div>
                                    </div>
                                )}

                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-uppercase text-secondary">Email</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0 text-muted ps-3"><Mail size={18} /></span>
                                        <input
                                            type="email"
                                            className="form-control form-control-lg bg-light border-start-0 ps-2 fs-6"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="doctor@medisphere.com"
                                            required
                                            style={{ minHeight: '52px' }}
                                        />
                                    </div>
                                </div>

                                {loginMethod === 'password' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mb-4"
                                    >
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <label className="form-label small fw-bold text-uppercase text-secondary mb-0">Password</label>
                                            <Link to="/forgot-password" className="small text-primary text-decoration-none fw-bold">Forgot?</Link>
                                        </div>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0 text-muted ps-3"><Lock size={18} /></span>
                                            <input
                                                type="password"
                                                className="form-control form-control-lg bg-light border-start-0 ps-2 fs-6"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                                style={{ minHeight: '52px' }}
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg w-100 py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 mt-4"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm" />
                                    ) : (
                                        <>
                                            {loginMethod === 'password' ? 'Sign In' : 'Send Magic Link'}
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {!magicLinkSent && (
                        <div className="text-center mt-5">
                            <p className="text-muted small">
                                Don't have an account? <Link to="/register" className="fw-bold text-primary text-decoration-none hover-underline">Create Account</Link>
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Copyright */}
                <div className="position-absolute bottom-0 w-100 text-center p-4">
                    <small className="text-muted opacity-50">© 2026 Medisphere Inc. Privacy & Terms</small>
                </div>
            </div>
        </div>
    );
};

export default Login;
