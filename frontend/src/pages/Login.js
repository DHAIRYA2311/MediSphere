import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Activity, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';

// Particles.js Background - Teal theme
const ParticleBackground = () => {
    const particlesInit = useCallback(async (engine) => {
        await loadSlim(engine);
    }, []);

    return (
        <Particles
            id="login-particles"
            init={particlesInit}
            options={{
                background: { color: { value: "transparent" } },
                fpsLimit: 60,
                interactivity: {
                    events: {
                        onHover: { enable: true, mode: "grab" },
                        onClick: { enable: true, mode: "push" },
                        resize: true
                    },
                    modes: {
                        grab: { distance: 140, links: { opacity: 1 } },
                        push: { quantity: 0.01 }
                    }
                },
                particles: {
                    color: { value: "#5eaab5" },
                    links: { color: "#5eaab5", distance: 150, enable: true, opacity: 0.2, width: 1 },
                    move: { direction: "none", enable: true, outModes: { default: "out" }, random: false, speed: 0.8, straight: false },
                    number: { density: { enable: true, area: 800 }, value: 50 },
                    opacity: { value: 0.3 },
                    shape: { type: "circle" },
                    size: { value: { min: 1, max: 4 } }
                },
                detectRetina: true
            }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
        />
    );
};

// Interactive Hero Particles - for dark hero section
const HeroParticles = () => {
    const particlesInit = useCallback(async (engine) => {
        await loadSlim(engine);
    }, []);

    return (
        <Particles
            id="hero-particles"
            init={particlesInit}
            options={{
                background: { color: { value: "transparent" } },
                fpsLimit: 60,
                interactivity: {
                    events: {
                        onHover: { enable: true, mode: "repulse" },
                        onClick: { enable: true, mode: "push" },
                        resize: true
                    },
                    modes: {
                        repulse: { distance: 100, duration: 0.4 },
                        push: { quantity: 1 }
                    }
                },
                particles: {
                    color: { value: ["#5eaab5", "#7fc4ce", "#a5f3fc"] },
                    links: { color: "#5eaab5", distance: 120, enable: true, opacity: 0.3, width: 1 },
                    move: {
                        direction: "none",
                        enable: true,
                        outModes: { default: "bounce" },
                        random: true,
                        speed: 1.5,
                        straight: false,
                        attract: { enable: true, rotateX: 600, rotateY: 1200 }
                    },
                    number: { density: { enable: true, area: 600 }, value: 40 },
                    opacity: { value: { min: 0.3, max: 0.7 }, animation: { enable: true, speed: 1, minimumValue: 0.1 } },
                    shape: { type: "circle" },
                    size: { value: { min: 1, max: 5 } }
                },
                detectRetina: true
            }}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 1,
                borderRadius: '24px'
            }}
        />
    );
};

// Runaway Icon Component - Flees from mouse cursor
const RunawayIcon = ({ emoji, size, initialPosition, baseAnimation }) => {
    const iconRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isRunning, setIsRunning] = useState(false);

    const handleMouseMove = useCallback((e) => {
        if (!iconRef.current) return;

        const iconRect = iconRef.current.getBoundingClientRect();
        const iconCenterX = iconRect.left + iconRect.width / 2;
        const iconCenterY = iconRect.top + iconRect.height / 2;

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const distanceX = mouseX - iconCenterX;
        const distanceY = mouseY - iconCenterY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        // If mouse is within 150px, run away!
        if (distance < 150) {
            setIsRunning(true);
            // Calculate escape direction (opposite of mouse)
            const escapeX = -distanceX * (150 / distance) * 0.8;
            const escapeY = -distanceY * (150 / distance) * 0.8;

            // Clamp to prevent going too far
            const clampedX = Math.max(-100, Math.min(100, escapeX));
            const clampedY = Math.max(-80, Math.min(80, escapeY));

            setPosition({ x: clampedX, y: clampedY });
        } else {
            setIsRunning(false);
            // Slowly return to original position
            setPosition(prev => ({
                x: prev.x * 0.95,
                y: prev.y * 0.95
            }));
        }
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [handleMouseMove]);

    return (
        <div className="position-absolute" style={initialPosition}>
            <motion.div
                ref={iconRef}
                animate={{
                    x: position.x,
                    y: position.y + (baseAnimation?.y || 0),
                    rotate: isRunning ? [0, -15, 15, -10, 10, 0] : (baseAnimation?.rotate || 0),
                    scale: isRunning ? 1.2 : 1
                }}
                transition={{
                    x: { type: "spring", stiffness: 300, damping: 20 },
                    y: { type: "spring", stiffness: 300, damping: 20 },
                    rotate: { duration: 0.3 },
                    scale: { duration: 0.2 }
                }}
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    background: 'rgba(94, 170, 181, 0.1)',
                    borderRadius: size > 45 ? '12px' : '50%',
                    border: '1px solid rgba(94, 170, 181, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)'
                }}
            >
                <span style={{ fontSize: `${size * 0.5}px` }}>{emoji}</span>
            </motion.div>
        </div>
    );
};


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [magicLinkMode, setMagicLinkMode] = useState(false);
    const [magicLinkSent, setMagicLinkSent] = useState(false);
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
            const res = await login(email, password);
            if (res.status === 'success') {
                navigate('/dashboard');
            } else {
                setError(res.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleMagicLink = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await api.post('auth/send_magic_link.php', { email });
            if (data.status === 'success') {
                setMagicLinkSent(true);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Could not send magic link.');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="min-vh-100 d-flex" style={{
            background: 'linear-gradient(180deg, rgba(94, 170, 181, 0.15) 0%, #f8fafc 100%)',
            position: 'relative'
        }}>
            {/* Particle Background */}
            <ParticleBackground />

            {/* Left Side - Glassmorphism Form */}
            <div className="col-12 col-lg-5 d-flex flex-column p-4 p-lg-5" style={{ position: 'relative', zIndex: 1 }}>
                <div
                    className="h-100 d-flex flex-column p-4 p-lg-5"
                    style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
                    }}
                >
                    {/* Logo */}
                    <div className="mb-4">
                        <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none">
                            <div
                                className="d-flex align-items-center justify-content-center rounded-3"
                                style={{
                                    width: 44,
                                    height: 44,
                                    background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                                    boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
                                }}
                            >
                                <Activity size={24} className="text-white" />
                            </div>
                            <span className="h5 fw-bold mb-0" style={{ color: '#0d9488' }}>MediSphere</span>
                        </Link>
                    </div>

                    {/* Form Content */}
                    <div className="flex-grow-1 d-flex flex-column justify-content-center" style={{ maxWidth: '380px' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <h1 className="display-6 fw-bold mb-0" style={{ color: '#1a3a4a' }}>
                                    Welcome Back!
                                </h1>
                                <Sparkles size={24} style={{ color: '#14b8a6' }} />
                            </div>
                            <p className="mb-4" style={{ color: '#4a6572', fontSize: '0.9375rem' }}>
                                Please enter log in details below
                            </p>

                            {magicLinkSent ? (
                                <div
                                    className="text-center py-4 px-3"
                                    style={{
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(16, 185, 129, 0.2)'
                                    }}
                                >
                                    <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
                                        style={{ width: 64, height: 64, background: 'rgba(16, 185, 129, 0.15)' }}>
                                        <Mail size={28} style={{ color: '#10b981' }} />
                                    </div>
                                    <h5 className="fw-bold" style={{ color: '#1a3a4a' }}>Check Your Email</h5>
                                    <p style={{ color: '#4a6572' }}>
                                        We've sent a magic login link to <strong>{email}</strong>
                                    </p>
                                    <button
                                        className="btn btn-light mt-3"
                                        onClick={() => { setMagicLinkSent(false); setMagicLinkMode(false); }}
                                        style={{ borderRadius: '12px' }}
                                    >
                                        Back to Login
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={magicLinkMode ? handleMagicLink : handleSubmit}>
                                    {error && (
                                        <div
                                            className="d-flex align-items-center gap-2 py-3 px-3 mb-4"
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                color: '#dc2626'
                                            }}
                                        >
                                            <Activity size={18} />
                                            <span className="small fw-medium">{error}</span>
                                        </div>
                                    )}

                                    {/* Email Field */}
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold" style={{ color: '#1a3a4a' }}>EMAIL</label>
                                        <input
                                            type="email"
                                            className="form-control form-control-lg"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.6)',
                                                border: '1px solid rgba(255, 255, 255, 0.8)',
                                                borderRadius: '12px',
                                                padding: '14px 16px',
                                                fontSize: '0.9375rem',
                                                color: '#1a3a4a',
                                                backdropFilter: 'blur(10px)'
                                            }}
                                        />
                                    </div>

                                    {/* Password Field */}
                                    {!magicLinkMode && (
                                        <div className="mb-3">
                                            <label className="form-label small fw-semibold" style={{ color: '#1a3a4a' }}>PASSWORD</label>
                                            <div className="position-relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    className="form-control form-control-lg"
                                                    placeholder="Enter your password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    style={{
                                                        background: 'rgba(255, 255, 255, 0.6)',
                                                        border: '1px solid rgba(255, 255, 255, 0.8)',
                                                        borderRadius: '12px',
                                                        padding: '14px 16px',
                                                        paddingRight: '50px',
                                                        fontSize: '0.9375rem',
                                                        color: '#1a3a4a',
                                                        backdropFilter: 'blur(10px)'
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn position-absolute border-0"
                                                    style={{ right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent' }}
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <EyeOff size={20} color="#4a6572" /> : <Eye size={20} color="#4a6572" />}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Forgot Password */}
                                    {!magicLinkMode && (
                                        <div className="text-end mb-4">
                                            <Link to="/forgot-password" className="text-decoration-none small fw-medium" style={{ color: '#4a6572' }}>
                                                Forget password?
                                            </Link>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        className="btn w-100 py-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                                        disabled={loading}
                                        style={{
                                            background: 'linear-gradient(135deg, #1a3a4a 0%, #2d5a6e 100%)',
                                            color: '#fff',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            border: 'none',
                                            boxShadow: '0 4px 14px rgba(26, 58, 74, 0.3)'
                                        }}
                                    >
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm" />
                                        ) : (
                                            <>
                                                {magicLinkMode ? 'Send Magic Link' : 'Sign in'}
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>

                                    {/* Divider */}
                                    <div className="d-flex align-items-center my-4">
                                        <hr className="flex-grow-1" style={{ borderColor: 'rgba(74, 101, 114, 0.2)' }} />
                                        <span className="px-3 small" style={{ color: '#4a6572' }}>or continue</span>
                                        <hr className="flex-grow-1" style={{ borderColor: 'rgba(74, 101, 114, 0.2)' }} />
                                    </div>

                                    {/* Magic Link / Password Toggle */}
                                    <button
                                        type="button"
                                        className="btn w-100 py-3 fw-medium d-flex align-items-center justify-content-center gap-2"
                                        style={{
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255, 255, 255, 0.8)',
                                            background: 'rgba(255, 255, 255, 0.4)',
                                            color: '#1a3a4a'
                                        }}
                                        onClick={() => setMagicLinkMode(!magicLinkMode)}
                                    >
                                        <Mail size={20} />
                                        {magicLinkMode ? 'Use password instead' : 'Login with Magic Link'}
                                    </button>
                                </form>
                            )}

                            {/* Sign Up Link */}
                            <p className="text-center mt-4 mb-0" style={{ color: '#4a6572' }}>
                                Don't have an account?{' '}
                                <Link to="/register" className="fw-semibold text-decoration-none" style={{ color: '#1a3a4a' }}>
                                    Sign Up
                                </Link>
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Right Side - Dark Navy Hero */}
            <div className="d-none d-lg-flex col-lg-7 p-4">
                <div
                    className="w-100 h-100 position-relative overflow-hidden d-flex flex-column justify-content-center"
                    style={{
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, #050a0c 0%, #0d1f26 40%, #132a33 70%, #0a1a20 100%)'
                    }}
                >
                    {/* Interactive Particles */}
                    <HeroParticles />

                    {/* Grid Pattern */}
                    <div
                        className="position-absolute w-100 h-100"
                        style={{
                            backgroundImage: `
                                linear-gradient(rgba(94, 170, 181, 0.04) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(94, 170, 181, 0.04) 1px, transparent 1px)
                            `,
                            backgroundSize: '40px 40px',
                            zIndex: 0
                        }}
                    />

                    {/* Glowing Orbs */}
                    <div className="position-absolute" style={{ top: '20%', right: '20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(94, 170, 181, 0.15) 0%, transparent 70%)', zIndex: 0 }} />
                    <div className="position-absolute" style={{ bottom: '30%', left: '10%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(26, 58, 74, 0.2) 0%, transparent 70%)', zIndex: 0 }} />

                    {/* Runaway Icons */}
                    <div className="position-absolute w-100 h-100" style={{ zIndex: 1, pointerEvents: 'auto' }}>
                        <RunawayIcon emoji="🏥" size={55} initialPosition={{ top: '8%', left: '8%' }} />
                        <RunawayIcon emoji="💊" size={45} initialPosition={{ top: '12%', left: '45%' }} />
                        <RunawayIcon emoji="🩺" size={42} initialPosition={{ top: '10%', right: '12%' }} />
                        <RunawayIcon emoji="❤️" size={40} initialPosition={{ top: '45%', left: '6%' }} />
                        <RunawayIcon emoji="💉" size={42} initialPosition={{ bottom: '15%', left: '12%' }} />
                        <RunawayIcon emoji="🧬" size={38} initialPosition={{ bottom: '18%', left: '48%' }} />
                        <RunawayIcon emoji="🌡️" size={40} initialPosition={{ bottom: '12%', right: '10%' }} />
                    </div>

                    {/* Content */}
                    <div className="position-relative px-5 py-4" style={{ zIndex: 3 }}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            {/* Badge */}
                            <motion.div
                                className="d-inline-flex align-items-center gap-2 px-3 py-2 mb-4"
                                whileHover={{ scale: 1.05 }}
                                style={{
                                    background: 'rgba(94, 170, 181, 0.15)',
                                    borderRadius: '50px',
                                    border: '1px solid rgba(94, 170, 181, 0.25)',
                                    cursor: 'pointer'
                                }}
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{ width: '8px', height: '8px', background: '#5eaab5', borderRadius: '50%' }}
                                />
                                <span style={{ color: '#5eaab5', fontSize: '0.85rem', fontWeight: 500 }}>Healthcare Excellence</span>
                            </motion.div>

                            {/* Main Headline */}
                            <motion.h1
                                className="fw-bold mb-3"
                                style={{ color: '#ffffff', fontSize: '3rem', lineHeight: 1.1 }}
                                whileHover={{ x: 5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                Your Health,<br />
                                <motion.span
                                    style={{ color: '#5eaab5', display: 'inline-block' }}
                                    whileHover={{ scale: 1.02, textShadow: '0 0 20px rgba(94, 170, 181, 0.5)' }}
                                >
                                    Our Priority
                                </motion.span>
                            </motion.h1>

                            {/* Subtext */}
                            <p className="mb-4" style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1.1rem', maxWidth: '400px', lineHeight: 1.6 }}>
                                Experience seamless healthcare management with AI-powered insights, real-time monitoring, and expert care.
                            </p>

                            {/* Stats */}
                            <div className="d-flex gap-4 mt-5">
                                <motion.div whileHover={{ scale: 1.1, y: -5 }} style={{ cursor: 'pointer' }}>
                                    <motion.div className="fw-bold" style={{ color: '#5eaab5', fontSize: '2rem' }} whileHover={{ textShadow: '0 0 15px rgba(94, 170, 181, 0.6)' }}>500+</motion.div>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Expert Doctors</div>
                                </motion.div>
                                <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                                <motion.div whileHover={{ scale: 1.1, y: -5 }} style={{ cursor: 'pointer' }}>
                                    <motion.div className="fw-bold" style={{ color: '#5eaab5', fontSize: '2rem' }} whileHover={{ textShadow: '0 0 15px rgba(94, 170, 181, 0.6)' }}>50K+</motion.div>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Happy Patients</div>
                                </motion.div>
                                <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                                <motion.div whileHover={{ scale: 1.1, y: -5 }} style={{ cursor: 'pointer' }}>
                                    <motion.div className="fw-bold" style={{ color: '#5eaab5', fontSize: '2rem' }} whileHover={{ textShadow: '0 0 15px rgba(94, 170, 181, 0.6)' }}>24/7</motion.div>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Support</div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
