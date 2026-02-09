import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Play, ArrowRight, Users, Calendar, Pill, Stethoscope, BedDouble, FileText, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import { api } from '../services/api';

// Particles.js Background - Teal theme with connected dots
const ParticleBackground = () => {
    const particlesInit = useCallback(async (engine) => {
        await loadSlim(engine);
    }, []);

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            options={{
                background: {
                    color: {
                        value: "transparent"
                    }
                },
                fpsLimit: 60,
                interactivity: {
                    events: {
                        onHover: {
                            enable: true,
                            mode: "grab"
                        },
                        onClick: {
                            enable: true,
                            mode: "push"
                        },
                        resize: true
                    },
                    modes: {
                        grab: {
                            distance: 140,
                            links: {
                                opacity: 1
                            }
                        },
                        push: {
                            quantity: 0.01
                        }
                    }
                },
                particles: {
                    color: {
                        value: "#5eaab5"
                    },
                    links: {
                        color: "#5eaab5",
                        distance: 150,
                        enable: true,
                        opacity: 0.2,
                        width: 1
                    },
                    move: {
                        direction: "none",
                        enable: true,
                        outModes: {
                            default: "out"
                        },
                        random: false,
                        speed: 0.8,
                        straight: false
                    },
                    number: {
                        density: {
                            enable: true,
                            area: 800
                        },
                        value: 50
                    },
                    opacity: {
                        value: 0.3
                    },
                    shape: {
                        type: "circle"
                    },
                    size: {
                        value: { min: 1, max: 4 }
                    }
                },
                detectRetina: true
            }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                pointerEvents: 'none'
            }}
        />
    );
};

const LandingPage = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await api.get('doctors/list.php');
                if (res.status === 'success') {
                    setDoctors(res.data.slice(0, 4)); // Show max 4 doctors
                }
            } catch (error) {
                console.error('Error fetching doctors:', error);
            }
        };
        fetchDoctors();
    }, []);

    return (
        <div className="landing-page" style={{ background: 'linear-gradient(180deg, rgba(94, 170, 181, 0.15) 0%, #f8fafc 100%)', minHeight: '100vh', position: 'relative' }}>
            {/* Particle Background Effect */}
            <ParticleBackground />

            {/* Navbar */}
            <nav className="navbar navbar-expand-lg py-3 px-4" style={{ background: 'transparent', position: 'relative', zIndex: 10 }}>
                <div className="container">
                    <a className="navbar-brand d-flex align-items-center gap-2 fw-bold fs-4" href="/" style={{ color: '#5eaab5' }}>
                        <div className="d-flex align-items-center gap-1">
                            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>|||</span>
                            <span style={{ letterSpacing: '-0.5px', fontWeight: 700, color: '#1e293b' }}>MediSphere</span>
                        </div>
                    </a>
                    <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
                        <ul className="navbar-nav gap-4 align-items-center">
                            <li className="nav-item">
                                <a className="nav-link text-dark fw-medium px-3" href="#book-appointment" style={{ fontSize: '0.95rem' }}>Book Appointment</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link text-dark fw-medium px-3" href="#doctors" style={{ fontSize: '0.95rem' }}>Doctors</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link text-dark fw-medium px-3" href="#about" style={{ fontSize: '0.95rem' }}>About</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link text-dark fw-medium px-3" href="#contact" style={{ fontSize: '0.95rem' }}>Contact</a>
                            </li>
                        </ul>
                    </div>
                    <div className="d-none d-lg-block">
                        <button
                            className="btn px-4 py-2 fw-semibold"
                            onClick={() => navigate('/login')}
                            style={{
                                background: '#1e293b',
                                color: '#fff',
                                borderRadius: '50px',
                                fontSize: '0.9rem'
                            }}
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-5 pb-0">
                <div className="container">
                    <div className="text-center pt-5 pb-4">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="display-3 fw-bold mb-4" style={{ color: '#1e293b', lineHeight: 1.1 }}>
                                Transform <span style={{ color: '#0d9488' }}>Healthcare</span> Efficiency
                                <br />
                                with Cutting-Edge Technology
                            </h1>
                            <p className="lead text-muted mx-auto mb-5" style={{ maxWidth: '600px', fontSize: '1.1rem' }}>
                                Manage patients, staff, finances, and more with our comprehensive, user-friendly system.
                            </p>
                            <div className="d-flex justify-content-center gap-3 flex-wrap">
                                <button
                                    className="btn d-flex align-items-center gap-2 px-4 py-3 fw-semibold"
                                    onClick={() => navigate('/register')}
                                    style={{
                                        background: '#1e293b',
                                        color: '#fff',
                                        borderRadius: '50px',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    Get Started <ArrowRight size={18} />
                                </button>
                                <button
                                    className="btn d-flex align-items-center gap-2 px-4 py-3 fw-semibold"
                                    style={{
                                        background: '#fff',
                                        color: '#1e293b',
                                        borderRadius: '50px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    Watch a Demo
                                    <div
                                        className="d-flex align-items-center justify-content-center"
                                        style={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: '50%',
                                            background: '#1e293b',
                                            color: '#fff'
                                        }}
                                    >
                                        <Play size={12} fill="#fff" />
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mt-5"
                    >
                        <div
                            className="mx-auto position-relative"
                            style={{
                                maxWidth: '1100px',
                                background: '#f8fafc',
                                borderRadius: '16px 16px 0 0',
                                border: '1px solid #e2e8f0',
                                borderBottom: 'none',
                                padding: '12px 12px 0 12px',
                                boxShadow: '0 -10px 60px rgba(0,0,0,0.08)'
                            }}
                        >
                            {/* Browser Chrome */}
                            <div className="d-flex align-items-center justify-content-between mb-3 px-2">
                                <div className="d-flex align-items-center gap-2">
                                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }}></div>
                                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }}></div>
                                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }}></div>
                                </div>
                                <div className="flex-grow-1 mx-4">
                                    <div
                                        className="d-flex align-items-center justify-content-center gap-2 px-4 py-2 mx-auto"
                                        style={{
                                            background: '#fff',
                                            borderRadius: '8px',
                                            maxWidth: '400px',
                                            fontSize: '0.8rem',
                                            color: '#64748b',
                                            border: '1px solid #e2e8f0'
                                        }}
                                    >
                                        <span>🔒</span> https://www.medisphere.com/
                                    </div>
                                </div>
                                <div className="d-flex gap-2 text-muted" style={{ fontSize: '0.8rem' }}>
                                    <span>⟳</span>
                                    <span>⊕</span>
                                    <span>⊖</span>
                                </div>
                            </div>

                            {/* Dashboard Content */}
                            <div
                                style={{
                                    background: '#fff',
                                    borderRadius: '12px 12px 0 0',
                                    padding: '24px',
                                    minHeight: '400px'
                                }}
                            >
                                {/* Dashboard Header */}
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="d-flex align-items-center gap-2" style={{ color: '#5eaab5' }}>
                                            <Activity size={24} />
                                            <span className="fw-bold">MediSphere</span>
                                        </div>
                                        <div className="d-flex gap-2 ms-4">
                                            <span className="px-3 py-2 rounded-pill fw-medium" style={{ background: '#1e293b', color: '#fff', fontSize: '0.8rem' }}>Dashboard</span>
                                            <span className="px-3 py-2 rounded-pill text-muted" style={{ fontSize: '0.8rem' }}>Patient</span>
                                            <span className="px-3 py-2 rounded-pill text-muted" style={{ fontSize: '0.8rem' }}>Doctors and Staff</span>
                                            <span className="px-3 py-2 rounded-pill text-muted" style={{ fontSize: '0.8rem' }}>Room</span>
                                            <span className="px-3 py-2 rounded-pill text-muted" style={{ fontSize: '0.8rem' }}>Medicine</span>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="rounded-circle" style={{ width: 36, height: 36, background: '#f1f5f9' }}></div>
                                        <div className="rounded-circle" style={{ width: 36, height: 36, background: '#e0f2fe' }}></div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="row g-3">
                                    <div className="col-md-8">
                                        <div className="p-3 rounded-3 mb-3" style={{ background: '#f8fafc' }}>
                                            <h6 className="fw-bold text-dark mb-3">Statistical Summary</h6>
                                            <div className="row g-3">
                                                {[
                                                    { label: 'Number of patients', value: '547', sub: 'Adult Patients', subVal: '372', icon: Users, color: '#ef4444' },
                                                    { label: 'Daily Visit', value: '78', sub: 'Polyclinic', subVal: '243', icon: Calendar, color: '#5eaab5' },
                                                    { label: 'Room Capacity', value: '12', sub: 'Occupied Bed', subVal: '188', icon: BedDouble, color: '#3b82f6' }
                                                ].map((stat, idx) => (
                                                    <div className="col-md-4" key={idx}>
                                                        <div className="p-3 rounded-3 bg-white h-100">
                                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                                <span className="text-muted small">{stat.label}</span>
                                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: stat.color }}></div>
                                                            </div>
                                                            <div className="d-flex align-items-center gap-2 mb-3">
                                                                <stat.icon size={16} style={{ color: stat.color }} />
                                                                <span className="fw-bold fs-4">{stat.value}</span>
                                                            </div>
                                                            <div className="pt-2 border-top">
                                                                <div className="d-flex justify-content-between small text-muted">
                                                                    <span>{stat.sub}</span>
                                                                    <span className="fw-bold text-dark">{stat.subVal}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-3" style={{ background: '#f8fafc' }}>
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h6 className="fw-bold text-dark mb-0">Health Trends</h6>
                                                <span className="badge bg-light text-dark">Dec 24</span>
                                            </div>
                                            <div className="d-flex gap-4 small text-muted">
                                                <span className="fw-medium">Disease</span>
                                                <span>Characteristic</span>
                                                <span>Patients</span>
                                                <span>Recovers</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="p-3 rounded-3 h-100" style={{ background: '#f8fafc' }}>
                                            <h6 className="fw-bold text-dark mb-3">Doctor's Conference</h6>
                                            {[
                                                { time: 'Tue, 15 Jan\n09:00 am', title: 'Heart bypass surgery conference', color: '#5eaab5' },
                                                { time: 'Tue, 15 Jan\n16:00 pm', title: 'Conference to respond to rising covid-19 cases', color: '#f59e0b' }
                                            ].map((conf, idx) => (
                                                <div className="d-flex gap-3 mb-3 p-2 rounded bg-white" key={idx}>
                                                    <div className="text-muted small" style={{ minWidth: '70px', fontSize: '0.7rem', whiteSpace: 'pre-line' }}>{conf.time}</div>
                                                    <div>
                                                        <div className="small fw-medium text-dark">{conf.title}</div>
                                                        <div className="d-flex gap-1 mt-2">
                                                            <div className="rounded-circle" style={{ width: 20, height: 20, background: '#e0f2fe' }}></div>
                                                            <div className="rounded-circle" style={{ width: 20, height: 20, background: '#fef3c7' }}></div>
                                                            <div className="rounded-circle" style={{ width: 20, height: 20, background: '#fce7f3' }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-5 bg-white">
                <div className="container py-5">
                    <div className="text-center mb-5">
                        <span className="text-uppercase fw-bold small" style={{ color: '#5eaab5', letterSpacing: '2px' }}>Features</span>
                        <h2 className="display-5 fw-bold mt-2" style={{ color: '#1e293b' }}>Everything You Need</h2>
                        <p className="text-muted mx-auto" style={{ maxWidth: '500px' }}>Powerful tools designed to streamline hospital operations and improve patient care.</p>
                    </div>
                    <div className="row g-4">
                        {[
                            { icon: Users, title: 'Patient Management', desc: 'Complete patient records, history, and treatment tracking in one place.', color: '#5eaab5' },
                            { icon: Calendar, title: 'Appointment Scheduling', desc: 'Smart scheduling system with automated reminders and conflict detection.', color: '#3b82f6' },
                            { icon: Stethoscope, title: 'Doctor Portal', desc: 'Dedicated dashboard for doctors to manage consultations and prescriptions.', color: '#8b5cf6' },
                            { icon: BedDouble, title: 'Bed Management', desc: 'Real-time bed availability and ward management system.', color: '#f59e0b' },
                            { icon: Pill, title: 'Pharmacy Integration', desc: 'Seamless prescription to pharmacy workflow with inventory tracking.', color: '#ef4444' },
                            { icon: FileText, title: 'Reports & Analytics', desc: 'Comprehensive reports and insights for data-driven decisions.', color: '#06b6d4' }
                        ].map((feature, idx) => (
                            <div className="col-md-4" key={idx}>
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="p-4 rounded-4 h-100"
                                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                                >
                                    <div
                                        className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                                        style={{ width: 50, height: 50, background: `${feature.color}15` }}
                                    >
                                        <feature.icon size={24} style={{ color: feature.color }} />
                                    </div>
                                    <h5 className="fw-bold mb-2" style={{ color: '#1e293b' }}>{feature.title}</h5>
                                    <p className="text-muted mb-0 small">{feature.desc}</p>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Doctors Section */}
            <section id="doctors" className="py-5">
                <div className="container py-5">
                    <div className="d-flex justify-content-between align-items-center mb-5">
                        <div>
                            <span className="text-uppercase fw-bold small" style={{ color: '#5eaab5', letterSpacing: '2px' }}>OUR TEAM</span>
                            <h2 className="display-5 fw-bold mt-2" style={{ color: '#1e293b' }}>Meet Our Specialists</h2>
                        </div>
                        <button
                            className="btn px-4 py-2 fw-medium"
                            style={{
                                border: '2px solid #5eaab5',
                                color: '#5eaab5',
                                borderRadius: '50px',
                                background: 'transparent'
                            }}
                            onClick={() => navigate('/doctors')}
                        >
                            View All Doctors
                        </button>
                    </div>
                    <div className="row g-4">
                        {doctors.length > 0 ? (
                            doctors.map((doc, idx) => (
                                <div className="col-lg-3 col-md-6" key={idx}>
                                    <motion.div
                                        whileHover={{ y: -5 }}
                                        className="text-center p-4 rounded-4 h-100"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.8)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                                        }}
                                    >
                                        <div
                                            className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                                            style={{
                                                width: 100,
                                                height: 100,
                                                borderRadius: '16px',
                                                background: '#e2e8f0'
                                            }}
                                        >
                                            <Stethoscope size={40} style={{ color: '#64748b' }} />
                                        </div>
                                        <h5 className="fw-bold mb-1" style={{ color: '#1e293b' }}>
                                            Dr. {doc.first_name} {doc.last_name}
                                        </h5>
                                        <p className="text-muted small mb-0">{doc.specialization || doc.department}</p>
                                    </motion.div>
                                </div>
                            ))
                        ) : (
                            [1, 2, 3, 4].map((_, idx) => (
                                <div className="col-lg-3 col-md-6" key={idx}>
                                    <motion.div
                                        whileHover={{ y: -5 }}
                                        className="text-center p-4 rounded-4 h-100"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.8)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                                        }}
                                    >
                                        <div
                                            className="mx-auto mb-3"
                                            style={{
                                                width: 100,
                                                height: 100,
                                                borderRadius: '16px',
                                                background: '#e2e8f0'
                                            }}
                                        />
                                        <h5 className="fw-bold mb-1" style={{ color: '#1e293b' }}>Dr. Specialist {idx + 1}</h5>
                                        <p className="text-muted small mb-0">Cardiology</p>
                                    </motion.div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Book Appointment Section */}
            <section id="book-appointment" className="py-5 position-relative">
                <div className="container py-4">
                    <div className="row g-4">
                        {/* Left Side - Info Card */}
                        <div className="col-lg-5">
                            <div
                                className="h-100 p-5 d-flex flex-column justify-content-center"
                                style={{
                                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                    borderRadius: '24px',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                                }}
                            >
                                <h2 className="display-6 fw-bold text-white mb-3">Book Your Appointment</h2>
                                <p style={{ color: 'rgba(255,255,255,0.7)' }} className="mb-4">
                                    New to Medisphere? Fill out this form to create your patient account and book your first consultation instantly.
                                </p>
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: 44, height: 44, background: 'rgba(94, 234, 212, 0.15)', border: '1px solid rgba(94, 234, 212, 0.3)' }}>
                                        <Phone size={20} style={{ color: '#5eead4' }} />
                                    </div>
                                    <span style={{ color: '#5eead4' }} className="fw-medium">+1 (555) 123-4567</span>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: 44, height: 44, background: 'rgba(94, 234, 212, 0.15)', border: '1px solid rgba(94, 234, 212, 0.3)' }}>
                                        <Mail size={20} style={{ color: '#5eead4' }} />
                                    </div>
                                    <span style={{ color: '#5eead4' }} className="fw-medium">appointments@medisphere.com</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Glassmorphism Form Card */}
                        <div className="col-lg-7">
                            <div
                                className="p-5"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    backdropFilter: 'blur(24px)',
                                    WebkitBackdropFilter: 'blur(24px)',
                                    borderRadius: '24px',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
                                }}
                            >
                                <h5 className="fw-bold mb-4" style={{ color: '#1a3a4a' }}>Patient Details</h5>
                                <form>
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold" style={{ color: '#1a3a4a' }}>FIRST NAME</label>
                                            <input type="text" className="form-control form-control-lg" placeholder="John" style={{ background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(255, 255, 255, 0.8)', borderRadius: '12px', padding: '14px 16px', fontSize: '0.9375rem', color: '#1a3a4a', backdropFilter: 'blur(10px)' }} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold" style={{ color: '#1a3a4a' }}>LAST NAME</label>
                                            <input type="text" className="form-control form-control-lg" placeholder="Doe" style={{ background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(255, 255, 255, 0.8)', borderRadius: '12px', padding: '14px 16px', fontSize: '0.9375rem', color: '#1a3a4a', backdropFilter: 'blur(10px)' }} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold" style={{ color: '#1a3a4a' }}>EMAIL</label>
                                            <input type="email" className="form-control form-control-lg" placeholder="you@example.com" style={{ background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(255, 255, 255, 0.8)', borderRadius: '12px', padding: '14px 16px', fontSize: '0.9375rem', color: '#1a3a4a', backdropFilter: 'blur(10px)' }} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold" style={{ color: '#1a3a4a' }}>PHONE</label>
                                            <input type="tel" className="form-control form-control-lg" placeholder="+1 (555) 000-0000" style={{ background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(255, 255, 255, 0.8)', borderRadius: '12px', padding: '14px 16px', fontSize: '0.9375rem', color: '#1a3a4a', backdropFilter: 'blur(10px)' }} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold" style={{ color: '#1a3a4a' }}>DATE OF BIRTH</label>
                                            <input type="date" className="form-control form-control-lg" style={{ background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(255, 255, 255, 0.8)', borderRadius: '12px', padding: '14px 16px', fontSize: '0.9375rem', color: '#1a3a4a', backdropFilter: 'blur(10px)' }} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold" style={{ color: '#1a3a4a' }}>GENDER</label>
                                            <select className="form-select form-select-lg" style={{ background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(255, 255, 255, 0.8)', borderRadius: '12px', padding: '14px 16px', fontSize: '0.9375rem', color: '#1a3a4a', backdropFilter: 'blur(10px)' }}>
                                                <option value="">Select Gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label small fw-semibold" style={{ color: '#1a3a4a' }}>PASSWORD</label>
                                            <input type="password" className="form-control form-control-lg" placeholder="Create a secure password" style={{ background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(255, 255, 255, 0.8)', borderRadius: '12px', padding: '14px 16px', fontSize: '0.9375rem', color: '#1a3a4a', backdropFilter: 'blur(10px)' }} />
                                        </div>
                                    </div>

                                    <h5 className="fw-bold mb-4" style={{ color: '#1a3a4a' }}>Appointment Details</h5>
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold" style={{ color: '#1a3a4a' }}>DEPARTMENT</label>
                                            <select className="form-select form-select-lg" style={{ background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(255, 255, 255, 0.8)', borderRadius: '12px', padding: '14px 16px', fontSize: '0.9375rem', color: '#1a3a4a', backdropFilter: 'blur(10px)' }}>
                                                <option value="">Select Department</option>
                                                <option value="cardiology">Cardiology</option>
                                                <option value="neurology">Neurology</option>
                                                <option value="orthopedics">Orthopedics</option>
                                                <option value="pediatrics">Pediatrics</option>
                                                <option value="dermatology">Dermatology</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold" style={{ color: '#1a3a4a' }}>DOCTOR</label>
                                            <select className="form-select form-select-lg" style={{ background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(255, 255, 255, 0.8)', borderRadius: '12px', padding: '14px 16px', fontSize: '0.9375rem', color: '#1a3a4a', backdropFilter: 'blur(10px)' }}>
                                                <option value="">Select Doctor</option>
                                                <option value="dr1">Dr. Smith</option>
                                                <option value="dr2">Dr. Johnson</option>
                                                <option value="dr3">Dr. Williams</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold" style={{ color: '#1a3a4a' }}>APPOINTMENT DATE</label>
                                            <input type="date" className="form-control form-control-lg" style={{ background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(255, 255, 255, 0.8)', borderRadius: '12px', padding: '14px 16px', fontSize: '0.9375rem', color: '#1a3a4a', backdropFilter: 'blur(10px)' }} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold" style={{ color: '#1a3a4a' }}>TIME</label>
                                            <input type="time" className="form-control form-control-lg" style={{ background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(255, 255, 255, 0.8)', borderRadius: '12px', padding: '14px 16px', fontSize: '0.9375rem', color: '#1a3a4a', backdropFilter: 'blur(10px)' }} />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn w-100 py-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                                        style={{
                                            background: 'linear-gradient(135deg, #1a3a4a 0%, #2d5a6e 100%)',
                                            color: '#fff',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            border: 'none',
                                            boxShadow: '0 4px 14px rgba(26, 58, 74, 0.3)'
                                        }}
                                    >
                                        Confirm & Book Appointment <ArrowRight size={18} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-5" style={{ background: '#1e293b' }}>
                <div className="container py-5 text-center">
                    <h2 className="display-5 fw-bold text-white mb-4">Ready to Transform Your Hospital?</h2>
                    <p className="lead text-white opacity-75 mb-5 mx-auto" style={{ maxWidth: '500px' }}>
                        Join thousands of healthcare providers who trust MediSphere for their daily operations.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                        <button
                            className="btn px-5 py-3 fw-semibold"
                            onClick={() => navigate('/register')}
                            style={{ background: '#0d9488', color: '#fff', borderRadius: '50px' }}
                        >
                            Start Free Trial
                        </button>
                        <button
                            className="btn px-5 py-3 fw-semibold"
                            onClick={() => navigate('/login')}
                            style={{ background: 'transparent', color: '#fff', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.3)' }}
                        >
                            Contact Sales
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="contact" className="py-5" style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                <div className="container">
                    <div className="row g-4">
                        {/* Brand Column */}
                        <div className="col-lg-4 col-md-6">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <div
                                    className="d-flex align-items-center justify-content-center rounded-3"
                                    style={{
                                        width: 40,
                                        height: 40,
                                        background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                                        boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)'
                                    }}
                                >
                                    <Activity size={22} className="text-white" />
                                </div>
                                <span className="fs-5 fw-bold" style={{ color: '#1e293b' }}>MediSphere</span>
                            </div>
                            <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>
                                Transforming healthcare management with cutting-edge technology. Trusted by healthcare providers worldwide.
                            </p>
                            <div className="d-flex gap-2 mt-3">
                                {['facebook', 'twitter', 'linkedin', 'instagram'].map((social, idx) => (
                                    <button
                                        key={idx}
                                        className="d-flex align-items-center justify-content-center rounded-circle border-0 p-0"
                                        onClick={(e) => e.preventDefault()}
                                        style={{
                                            width: 36,
                                            height: 36,
                                            background: '#f1f5f9',
                                            border: '1px solid #e2e8f0',
                                            color: '#0d9488',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <span style={{ fontSize: '0.8rem' }}>{social[0].toUpperCase()}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="col-lg-2 col-md-6">
                            <h6 className="fw-bold mb-3" style={{ color: '#1e293b' }}>Quick Links</h6>
                            <ul className="list-unstyled">
                                {['About Us', 'Services', 'Doctors', 'Book Appointment'].map((link, idx) => (
                                    <li key={idx} className="mb-2">
                                        <button className="text-muted text-decoration-none bg-transparent border-0 p-0" style={{ fontSize: '0.9rem' }} onClick={(e) => e.preventDefault()}>{link}</button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Services */}
                        <div className="col-lg-2 col-md-6">
                            <h6 className="fw-bold mb-3" style={{ color: '#1e293b' }}>Services</h6>
                            <ul className="list-unstyled">
                                {['Patient Management', 'Appointments', 'Billing', 'Reports'].map((service, idx) => (
                                    <li key={idx} className="mb-2">
                                        <button className="text-muted text-decoration-none bg-transparent border-0 p-0" style={{ fontSize: '0.9rem' }} onClick={(e) => e.preventDefault()}>{service}</button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="col-lg-4 col-md-6">
                            <h6 className="fw-bold mb-3" style={{ color: '#1e293b' }}>Contact Us</h6>
                            <div className="mb-3 d-flex align-items-start gap-3">
                                <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: 36, height: 36, background: 'rgba(13, 148, 136, 0.1)', flexShrink: 0 }}>
                                    <Phone size={16} style={{ color: '#0d9488' }} />
                                </div>
                                <div>
                                    <div className="text-muted small">Phone</div>
                                    <div style={{ color: '#1e293b', fontSize: '0.9rem' }}>+1 (555) 123-4567</div>
                                </div>
                            </div>
                            <div className="mb-3 d-flex align-items-start gap-3">
                                <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: 36, height: 36, background: 'rgba(13, 148, 136, 0.1)', flexShrink: 0 }}>
                                    <Mail size={16} style={{ color: '#0d9488' }} />
                                </div>
                                <div>
                                    <div className="text-muted small">Email</div>
                                    <div style={{ color: '#1e293b', fontSize: '0.9rem' }}>contact@medisphere.com</div>
                                </div>
                            </div>
                            <div className="d-flex align-items-start gap-3">
                                <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: 36, height: 36, background: 'rgba(13, 148, 136, 0.1)', flexShrink: 0 }}>
                                    <Calendar size={16} style={{ color: '#0d9488' }} />
                                </div>
                                <div>
                                    <div className="text-muted small">Hours</div>
                                    <div style={{ color: '#1e293b', fontSize: '0.9rem' }}>Mon-Fri: 8AM - 8PM</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Copyright Bar */}
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                    <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
                        <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                            © 2026 MediSphere. All rights reserved.
                        </div>
                        <div className="d-flex gap-4">
                            <button className="text-muted text-decoration-none bg-transparent border-0 p-0" style={{ fontSize: '0.85rem' }} onClick={(e) => e.preventDefault()}>Privacy Policy</button>
                            <button className="text-muted text-decoration-none bg-transparent border-0 p-0" style={{ fontSize: '0.85rem' }} onClick={(e) => e.preventDefault()}>Terms of Service</button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
