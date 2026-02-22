import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Calendar, Shield, Clock, Camera, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [selectedAppt, setSelectedAppt] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const res = await api.get('auth/me.php');
            if (res.status === 'success') {
                setProfile(res.data);
            } else {
                setErrorMsg(res.message || 'Failed to load profile');
            }
        } catch (error) {
            setErrorMsg('Network error occurred');
            console.error("Failed to fetch profile", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!profile) return (
        <div className="p-5 text-center">
            <h4 className="text-muted">{errorMsg || 'User not found'}</h4>
            <button className="btn btn-primary mt-3" onClick={fetchProfile}>Retry</button>
        </div>
    );

    const initials = (profile.first_name?.[0] || '') + (profile.last_name?.[0] || '');

    return (
        <div className="container-fluid py-4 fade-in">
            <div className="row justify-content-center">
                <div className="col-xl-9">
                    {/* Hero Section / Profile Header */}
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                        <div className="bg-primary bg-gradient p-5 position-relative" style={{ height: '200px' }}>
                            <div className="position-absolute top-100 start-0 translate-middle-y px-5 d-flex align-items-end gap-4 w-100">
                                <div className="position-relative">
                                    <div className="rounded-circle border border-4 border-white shadow-lg bg-white d-flex align-items-center justify-content-center fw-bold text-primary"
                                        style={{ width: '150px', height: '150px', fontSize: '3.5rem' }}>
                                        {initials}
                                    </div>
                                    <button className="btn btn-sm btn-light rounded-circle position-absolute bottom-0 end-0 shadow-sm p-2">
                                        <Camera size={18} />
                                    </button>
                                </div>
                                <div className="mb-4">
                                    <h2 className="fw-bold text-dark mb-1">{profile.first_name} {profile.last_name}</h2>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="badge bg-primary rounded-pill px-3 py-2 text-uppercase tracking-wider">
                                            {profile.role_name}
                                        </span>
                                        <span className={`badge ${profile.status === 'Active' ? 'bg-success' : 'bg-danger'} bg-opacity-10 ${profile.status === 'Active' ? 'text-success' : 'text-danger'} rounded-pill px-3`}>
                                            {profile.status}
                                        </span>
                                    </div>
                                </div>
                                <button className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-4 ms-auto mb-4 shadow-sm">
                                    <Edit2 size={18} /> Edit Profile
                                </button>
                            </div>
                        </div>
                        <div style={{ height: '100px' }}></div>
                    </div>

                    <div className="row g-4">
                        {/* Information Grid */}
                        <div className="col-lg-8">
                            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                                <h5 className="fw-bold text-dark mb-4">Personal Information</h5>
                                <div className="row g-4">
                                    <div className="col-md-6 text-section">
                                        <label className="text-muted small fw-bold text-uppercase mb-2 d-block">Full Name</label>
                                        <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                                            <User size={20} className="text-primary" />
                                            <span className="fw-medium text-dark">{profile.first_name} {profile.last_name}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="text-muted small fw-bold text-uppercase mb-2 d-block">Email Address</label>
                                        <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                                            <Mail size={20} className="text-primary" />
                                            <span className="fw-medium text-dark">{profile.email}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="text-muted small fw-bold text-uppercase mb-2 d-block">Phone Number</label>
                                        <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                                            <Phone size={20} className="text-primary" />
                                            <span className="fw-medium text-dark">{profile.phone || 'Not provided'}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="text-muted small fw-bold text-uppercase mb-2 d-block">Date of Birth</label>
                                        <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                                            <Calendar size={20} className="text-primary" />
                                            <span className="fw-medium text-dark">{profile.dob ? new Date(profile.dob).toLocaleDateString() : 'Not set'}</span>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <label className="text-muted small fw-bold text-uppercase mb-2 d-block">Residential Address</label>
                                        <div className="d-flex align-items-start gap-3 p-3 bg-light rounded-3">
                                            <MapPin size={20} className="text-primary mt-1" />
                                            <span className="fw-medium text-dark">{profile.address || 'No address registered'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {profile.designation && (
                                <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                                    <h5 className="fw-bold text-dark mb-4">Professional Details</h5>
                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <label className="text-muted small fw-bold text-uppercase mb-2 d-block">Designation</label>
                                            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                                                <Shield size={20} className="text-primary" />
                                                <span className="fw-medium text-dark">{profile.designation}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="text-muted small fw-bold text-uppercase mb-2 d-block">Assigned Shift</label>
                                            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                                                <Clock size={20} className="text-primary" />
                                                <span className="fw-medium text-dark">{profile.shift || 'General Shift'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="card border-0 shadow-sm rounded-4 p-4">
                                <h5 className="fw-bold text-dark mb-4">Security & Bio</h5>
                                <div className="d-flex flex-column gap-3">
                                    <div className="p-3 border rounded-3 d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-info bg-opacity-10 p-2 rounded text-info"><Shield size={20} /></div>
                                            <div>
                                                <div className="fw-bold text-dark">Password Security</div>
                                                <div className="small text-muted">Update your account password regularly</div>
                                            </div>
                                        </div>
                                        <button className="btn btn-sm btn-outline-primary rounded-pill px-3">Update</button>
                                    </div>
                                    <div className="p-3 border rounded-3 d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-warning bg-opacity-10 p-2 rounded text-warning"><Shield size={20} /></div>
                                            <div>
                                                <div className="fw-bold text-dark">Two-Factor Authentication</div>
                                                <div className="small text-muted">Add an extra layer of security to your account</div>
                                            </div>
                                        </div>
                                        <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3">Disabled</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Info */}
                        <div className="col-lg-4">
                            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 text-center">
                                <h6 className="fw-bold text-dark mb-3 text-uppercase small tracking-widest">Account Details</h6>
                                <div className="py-2 border-bottom d-flex justify-content-between align-items-center">
                                    <span className="text-muted small d-flex align-items-center gap-2"><Clock size={16} /> Joined On</span>
                                    <span className="fw-bold text-dark small">{new Date(profile.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="py-3">
                                    <div className="p-3 bg-primary bg-opacity-10 rounded-4">
                                        <div className="h4 fw-bold text-primary mb-1">Medisphere</div>
                                        <div className="text-primary small fw-bold">Verified Member</div>
                                    </div>
                                </div>
                            </div>

                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-dark text-white">
                                <h6 className="fw-bold mb-3 text-uppercase small tracking-widest opacity-75">Quick Tips</h6>
                                <p className="small opacity-75 mb-0">
                                    Keep your phone number and address up to date to ensure seamless communication with the Medisphere medical team.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .bg-gradient { background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%) !important; }
                .text-section label { letter-spacing: 0.1em; }
            `}</style>
        </div>
    );
};

export default Profile;
