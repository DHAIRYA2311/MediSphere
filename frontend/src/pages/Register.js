import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
    User, Mail, Lock, Phone, MapPin, Calendar,
    ChevronRight, ArrowRight, Activity, ShieldCheck,
    Smartphone, HeartPulse
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        gender: 'Male',
        dob: '',
        address: '',
        role: 'patient' // Hardcoded to patient as requested
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await register(formData);
            if (res.status === 'success') {
                navigate('/login');
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError("Connectivity error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid min-vh-100 d-flex p-0 bg-white overflow-hidden">
            {/* Left Side - Hero Image (Consistent with Login) */}
            <div className="d-none d-lg-flex col-lg-5 bg-light position-relative p-0 align-items-center justify-content-center overflow-hidden">
                <div className="position-absolute w-100 h-100" style={{ left: 0, top: 0 }}>
                    <img
                        src="/assets/images/login-hero.png"
                        alt="Medical Background"
                        className="w-100 h-100 object-fit-cover"
                        style={{ filter: 'brightness(0.85) grayscale(20%)' }}
                    />
                    <div className="position-absolute w-100 h-100 bg-primary bg-opacity-25" style={{ left: 0, top: 0, mixBlendMode: 'multiply' }}></div>
                    <div className="position-absolute w-100 h-100" style={{ background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)', left: 0, top: 0 }}></div>
                </div>

                <div className="position-relative z-1 p-5 text-end pe-5 me-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="d-inline-block p-3 rounded-circle bg-white bg-opacity-25 backdrop-blur shadow-lg mb-4">
                            <HeartPulse size={48} className="text-primary" />
                        </div>
                        <h1 className="display-4 fw-bold text-dark mb-3 tracking-tight">Patient<br />Portal</h1>
                        <p className="lead text-secondary mb-4 opacity-75 fw-medium">
                            Join our digital healthcare network.<br />Secure, smart, and patient-first.
                        </p>

                        <div className="d-flex justify-content-end gap-3 pt-3">
                            <div className="d-flex align-items-center gap-2 bg-white bg-opacity-50 px-3 py-2 rounded-pill shadow-sm border border-white">
                                <ShieldCheck size={18} className="text-success" />
                                <span className="small fw-bold text-dark">Data Encrypted</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="col-12 col-lg-7 d-flex flex-column align-items-center justify-content-center p-4 p-md-5 position-relative overflow-auto">

                {/* Mobile Header */}
                <div className="d-lg-none text-center mb-5">
                    <span className="d-flex align-items-center justify-content-center gap-2 mb-2">
                        <Activity size={32} className="text-primary" />
                        <span className="h3 fw-bold m-0">Medisphere</span>
                    </span>
                </div>

                <div className="w-100" style={{ maxWidth: '580px' }}>
                    <div className="mb-4">
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-bold small">PATIENT ENROLLMENT</span>
                        </div>
                        <h2 className="fw-bold text-dark mb-1">Create Account</h2>
                        <p className="text-muted small">Fill in the details to join Medisphere Intelligence</p>
                    </div>

                    <form onSubmit={handleSubmit} className="row g-3">
                        {error && (
                            <div className="col-12">
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="alert alert-danger d-flex align-items-center gap-2 py-2 small rounded-3 mb-2"
                                >
                                    <Activity size={16} />
                                    <div>{error}</div>
                                </motion.div>
                            </div>
                        )}

                        {/* Personal Section */}
                        <div className="col-12 mt-4">
                            <h6 className="fw-bold text-secondary small text-uppercase mb-3 d-flex align-items-center">
                                <span className="bg-primary bg-opacity-10 p-1 rounded-2 me-2"><User size={14} className="text-primary" /></span>
                                Personal Information
                            </h6>
                            <div className="row g-2">
                                <div className="col-md-6 mb-2">
                                    <input
                                        type="text" name="first_name"
                                        className="form-control form-control-lg bg-light border-0 fs-6 py-3 px-3 rounded-3"
                                        placeholder="First Name"
                                        value={formData.first_name} onChange={handleChange} required
                                    />
                                </div>
                                <div className="col-md-6 mb-2">
                                    <input
                                        type="text" name="last_name"
                                        className="form-control form-control-lg bg-light border-0 fs-6 py-3 px-3 rounded-3"
                                        placeholder="Last Name"
                                        value={formData.last_name} onChange={handleChange} required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact & Security */}
                        <div className="col-12 mt-3">
                            <h6 className="fw-bold text-secondary small text-uppercase mb-3 d-flex align-items-center">
                                <span className="bg-primary bg-opacity-10 p-1 rounded-2 me-2"><Smartphone size={14} className="text-primary" /></span>
                                Contact & Security
                            </h6>
                            <div className="row g-2">
                                <div className="col-md-6 mb-2">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-0 text-muted"><Mail size={16} /></span>
                                        <input
                                            type="email" name="email"
                                            className="form-control form-control-lg bg-light border-0 fs-6 py-3 ps-1"
                                            placeholder="Email Address"
                                            value={formData.email} onChange={handleChange} required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-0 text-muted"><Smartphone size={16} /></span>
                                        <input
                                            type="text" name="phone"
                                            className="form-control form-control-lg bg-light border-0 fs-6 py-3 ps-1"
                                            placeholder="Phone Number"
                                            value={formData.phone} onChange={handleChange} required
                                        />
                                    </div>
                                </div>
                                <div className="col-12 mb-2">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-0 text-muted"><Lock size={16} /></span>
                                        <input
                                            type="password" name="password"
                                            className="form-control form-control-lg bg-light border-0 fs-6 py-3 ps-1"
                                            placeholder="Security Password"
                                            value={formData.password} onChange={handleChange} required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="col-12 mt-3">
                            <h6 className="fw-bold text-secondary small text-uppercase mb-3 d-flex align-items-center">
                                <span className="bg-primary bg-opacity-10 p-1 rounded-2 me-2"><MapPin size={14} className="text-primary" /></span>
                                Additional Details
                            </h6>
                            <div className="row g-2">
                                <div className="col-md-6 mb-2">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-0 text-muted"><Calendar size={16} /></span>
                                        <input
                                            type="date" name="dob"
                                            className="form-control form-control-lg bg-light border-0 fs-6 py-3 ps-1"
                                            value={formData.dob} onChange={handleChange} required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <select
                                        name="gender"
                                        className="form-select form-select-lg bg-light border-0 fs-6 py-3 rounded-3"
                                        value={formData.gender} onChange={handleChange}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="col-12 mb-2">
                                    <textarea
                                        name="address"
                                        className="form-control bg-light border-0 fs-6 p-3 rounded-3"
                                        placeholder="Residential Address"
                                        rows="2" value={formData.address} onChange={handleChange} required
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 mt-4">
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg w-100 py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                                disabled={loading}
                            >
                                {loading ? <span className="spinner-border spinner-border-sm" /> : (
                                    <>
                                        Complete Enrollment
                                        <ChevronRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="text-center mt-4">
                        <p className="text-muted small">
                            Already part of our network? <Link to="/login" className="fw-bold text-primary text-decoration-none hover-underline">Sign In</Link>
                        </p>
                    </div>
                </div>

                {/* Footer Copyright */}
                <div className="position-absolute bottom-0 w-100 text-center p-4 d-none d-md-block">
                    <small className="text-muted opacity-50">© 2026 Medisphere Healthcare. Privacy Protected.</small>
                </div>
            </div>
        </div>
    );
};

export default Register;
