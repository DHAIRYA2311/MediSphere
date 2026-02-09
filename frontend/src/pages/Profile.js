import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Calendar, Shield, Clock, Camera, Edit2, Heart, Activity, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await api.get('auth/me.php');
            if (res.status === 'success') {
                setProfile(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center min-vh-100">
                <div className="spinner-border" style={{ color: 'var(--primary)' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!profile) return <div className="p-5 text-center" style={{ color: 'var(--text-muted)' }}>User not found</div>;

    const initials = (profile.first_name?.[0] || '') + (profile.last_name?.[0] || '');

    return (
        <div className="fade-in">
            <div className="row justify-content-center">
                <div className="col-xl-10">
                    {/* Profile Header Card */}
                    <motion.div
                        className="stat-card mb-4 p-0 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Header Banner */}
                        <div
                            className="p-5 position-relative"
                            style={{
                                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                                height: '180px'
                            }}
                        >
                            {/* Decorative pattern */}
                            <div
                                className="position-absolute w-100 h-100"
                                style={{
                                    top: 0,
                                    left: 0,
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0z' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='1'/%3E%3C/svg%3E")`,
                                    backgroundSize: '60px 60px'
                                }}
                            />
                        </div>

                        {/* Profile Info Section */}
                        <div className="px-4 px-lg-5 pb-4" style={{ marginTop: '-70px' }}>
                            <div className="d-flex flex-column flex-md-row align-items-start gap-3 gap-md-4">
                                {/* Avatar */}
                                <div className="position-relative">
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                                        style={{
                                            width: '140px',
                                            height: '140px',
                                            fontSize: '3rem',
                                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                                            color: '#fff',
                                            border: '4px solid var(--bg-card)',
                                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
                                        }}
                                    >
                                        {initials}
                                    </div>
                                    <button
                                        className="btn position-absolute d-flex align-items-center justify-content-center"
                                        style={{
                                            bottom: '8px',
                                            right: '8px',
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border-dark)',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                        }}
                                    >
                                        <Camera size={16} style={{ color: 'var(--text-main)' }} />
                                    </button>
                                </div>

                                {/* Name and Badges */}
                                <div className="flex-grow-1 mt-2 mt-md-4">
                                    <h2 className="fw-bold mb-2" style={{ color: 'var(--text-main)' }}>
                                        {profile.first_name} {profile.last_name}
                                    </h2>
                                    <div className="d-flex flex-wrap align-items-center gap-2">
                                        <span className="badge badge-primary text-uppercase small" style={{ letterSpacing: '0.05em' }}>
                                            {profile.role_name}
                                        </span>
                                        <span className={`badge ${profile.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                                            {profile.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Edit Button */}
                                <button className="btn btn-primary d-flex align-items-center gap-2 mt-3 mt-md-4">
                                    <Edit2 size={16} /> Edit Profile
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    <div className="row g-4">
                        {/* Left Column - Personal Information */}
                        <div className="col-lg-8">
                            <motion.div
                                className="stat-card mb-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h5 className="fw-bold mb-4" style={{ color: 'var(--text-main)' }}>Personal Information</h5>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold text-uppercase mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Full Name</label>
                                        <div className="d-flex align-items-center gap-3 p-3" style={{ background: 'var(--bg-dark)', borderRadius: '12px' }}>
                                            <User size={20} style={{ color: 'var(--primary)' }} />
                                            <span className="fw-medium" style={{ color: 'var(--text-main)' }}>{profile.first_name} {profile.last_name}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold text-uppercase mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Email Address</label>
                                        <div className="d-flex align-items-center gap-3 p-3" style={{ background: 'var(--bg-dark)', borderRadius: '12px' }}>
                                            <Mail size={20} style={{ color: 'var(--primary)' }} />
                                            <span className="fw-medium" style={{ color: 'var(--text-main)' }}>{profile.email}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold text-uppercase mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Phone Number</label>
                                        <div className="d-flex align-items-center gap-3 p-3" style={{ background: 'var(--bg-dark)', borderRadius: '12px' }}>
                                            <Phone size={20} style={{ color: 'var(--primary)' }} />
                                            <span className="fw-medium" style={{ color: 'var(--text-main)' }}>{profile.phone || 'Not provided'}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold text-uppercase mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Date of Birth</label>
                                        <div className="d-flex align-items-center gap-3 p-3" style={{ background: 'var(--bg-dark)', borderRadius: '12px' }}>
                                            <Calendar size={20} style={{ color: 'var(--primary)' }} />
                                            <span className="fw-medium" style={{ color: 'var(--text-main)' }}>{profile.dob ? new Date(profile.dob).toLocaleDateString() : 'Not set'}</span>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-semibold text-uppercase mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Address</label>
                                        <div className="d-flex align-items-start gap-3 p-3" style={{ background: 'var(--bg-dark)', borderRadius: '12px' }}>
                                            <MapPin size={20} className="mt-1" style={{ color: 'var(--primary)' }} />
                                            <span className="fw-medium" style={{ color: 'var(--text-main)' }}>{profile.address || 'No address registered'}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Security Section */}
                            <motion.div
                                className="stat-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h5 className="fw-bold mb-4" style={{ color: 'var(--text-main)' }}>Security & Privacy</h5>
                                <div className="d-flex flex-column gap-3">
                                    <div className="d-flex align-items-center justify-content-between p-3" style={{ background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--border-dark)' }}>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="stat-card-icon" style={{ background: 'var(--primary)', width: 40, height: 40 }}>
                                                <Shield size={18} />
                                            </div>
                                            <div>
                                                <div className="fw-semibold" style={{ color: 'var(--text-main)' }}>Password Security</div>
                                                <div className="small" style={{ color: 'var(--text-muted)' }}>Update your account password</div>
                                            </div>
                                        </div>
                                        <button className="btn btn-primary btn-sm">Update</button>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between p-3" style={{ background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--border-dark)' }}>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="stat-card-icon" style={{ background: 'var(--warning)', width: 40, height: 40 }}>
                                                <Activity size={18} />
                                            </div>
                                            <div>
                                                <div className="fw-semibold" style={{ color: 'var(--text-main)' }}>Two-Factor Auth</div>
                                                <div className="small" style={{ color: 'var(--text-muted)' }}>Extra security layer</div>
                                            </div>
                                        </div>
                                        <span className="badge badge-secondary">Disabled</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Column - Account Details */}
                        <div className="col-lg-4">
                            <motion.div
                                className="stat-card text-center mb-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                            >
                                <h6 className="fw-bold mb-4 text-uppercase small" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>Account Details</h6>

                                <div className="py-3" style={{ borderTop: '1px solid var(--border-dark)' }}>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="d-flex align-items-center gap-2 small" style={{ color: 'var(--text-muted)' }}>
                                            <Clock size={14} /> Joined On
                                        </span>
                                        <span className="fw-semibold small" style={{ color: 'var(--text-main)' }}>
                                            {new Date(profile.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 text-center" style={{ background: 'linear-gradient(135deg, rgba(94, 170, 181, 0.1) 0%, rgba(26, 58, 74, 0.1) 100%)', borderRadius: '16px' }}>
                                    <Award size={40} style={{ color: 'var(--primary)' }} className="mb-3" />
                                    <div className="h5 fw-bold mb-1" style={{ color: 'var(--primary)' }}>MediSphere</div>
                                    <div className="small fw-medium" style={{ color: 'var(--accent)' }}>Verified Member</div>
                                </div>
                            </motion.div>

                            <motion.div
                                className="stat-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #0f2a38 100%)' }}
                            >
                                <h6 className="fw-bold mb-3 text-uppercase small" style={{ color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em' }}>Quick Tips</h6>
                                <p className="small mb-0" style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                                    Keep your phone number and address up to date to ensure seamless communication with the MediSphere medical team.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
