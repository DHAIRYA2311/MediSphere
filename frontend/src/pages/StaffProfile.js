import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    User, Mail, Phone, Calendar, Clock, Shield, Camera,
    CheckCircle, XCircle, Briefcase, Activity, FileText,
    Users, Layout, Clipboard, Star, AlertTriangle, ShieldCheck,
    ChevronRight, MapPin, Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StaffProfile = () => {
    const { user: authUser } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('Overview');

    useEffect(() => {
        fetchStaffProfile();
    }, []);

    const fetchStaffProfile = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(window.location.search);
            const targetId = params.get('id');
            const url = targetId ? `staff/profile.php?id=${targetId}` : 'staff/profile.php';

            const res = await api.get(url);
            if (res.status === 'success') {
                setData(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch staff profile", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="container py-5 text-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Synchronizing staff dashboard...</p>
        </div>
    );

    if (!data) return <div className="p-5 text-center">Staff profile not found</div>;

    const { profile, attendance, responsibilities, permissions } = data;
    const initials = (profile.first_name?.[0] || '') + (profile.last_name?.[0] || '');

    const sections = [
        { id: 'Overview', icon: Layout },
        { id: 'Attendance', icon: Clock },
        { id: 'Tasks', icon: Clipboard },
        { id: 'Evaluation', icon: Star },
        { id: 'Security', icon: ShieldCheck },
    ];

    return (
        <div className="container-fluid py-4 fade-in">
            <div className="row g-4">
                {/* Left Sidebar: Identity Card */}
                <div className="col-xl-3">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                        <div className="bg-primary p-5 text-center position-relative">
                            <div className="position-absolute top-100 start-50 translate-middle">
                                <div className="rounded-circle border border-4 border-white shadow-lg bg-white d-flex align-items-center justify-content-center fw-bold text-primary"
                                    style={{ width: '120px', height: '120px', fontSize: '2.5rem' }}>
                                    {initials}
                                </div>
                                <button className="btn btn-sm btn-light rounded-circle position-absolute bottom-0 end-0 shadow-sm p-2 border">
                                    <Camera size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="card-body pt-5 mt-4 text-center">
                            <h4 className="fw-bold text-dark mb-1">{profile.first_name} {profile.last_name}</h4>
                            <p className="text-muted small mb-3">{profile.designation || 'Staff Member'} • {profile.department || 'General'}</p>
                            <div className="d-flex justify-content-center gap-2 mb-4">
                                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3">
                                    ID: #{profile.staff_id || 'TEMP'}
                                </span>
                                <span className={`badge ${profile.status === 'Active' ? 'bg-success' : 'bg-danger'} bg-opacity-10 ${profile.status === 'Active' ? 'text-success' : 'text-danger'} rounded-pill px-3`}>
                                    {profile.status}
                                </span>
                            </div>

                            <div className="text-start border-top pt-4">
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div className="bg-light p-2 rounded-circle text-primary"><Mail size={16} /></div>
                                    <div>
                                        <div className="small text-muted">Email</div>
                                        <div className="small fw-bold">{profile.email}</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div className="bg-light p-2 rounded-circle text-primary"><Phone size={16} /></div>
                                    <div>
                                        <div className="small text-muted">Phone</div>
                                        <div className="small fw-bold">{profile.phone || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div className="bg-light p-2 rounded-circle text-primary"><Clock size={16} /></div>
                                    <div>
                                        <div className="small text-muted">Shift</div>
                                        <div className="small fw-bold">{profile.shift || 'Not Assigned'}</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-light p-2 rounded-circle text-primary"><Calendar size={16} /></div>
                                    <div>
                                        <div className="small text-muted">Joined Date</div>
                                        <div className="small fw-bold">{new Date(profile.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm rounded-4 p-2">
                        {sections.map(s => (
                            <button
                                key={s.id}
                                className={`btn border-0 w-100 text-start d-flex align-items-center gap-3 p-3 rounded-3 mb-1 transition-all ${activeSection === s.id ? 'bg-primary text-white shadow-sm' : 'hover-bg-light text-muted'}`}
                                onClick={() => setActiveSection(s.id)}
                            >
                                <s.icon size={18} />
                                <span className="fw-medium">{s.id}</span>
                                {activeSection === s.id && <ChevronRight size={16} className="ms-auto" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="col-xl-9">
                    <AnimatePresence mode="wait">
                        {activeSection === 'Overview' && (
                            <motion.div key="overview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div className="row g-4">
                                    {/* Stats Cards */}
                                    <div className="col-md-4">
                                        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div className="bg-success bg-opacity-10 p-3 rounded-4 text-success"><Activity size={24} /></div>
                                                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 small">Live Status</span>
                                            </div>
                                            <h2 className="fw-bold text-dark mb-1">{attendance.today ? 'Checked In' : 'Not Present'}</h2>
                                            <p className="text-muted small mb-0">Today's Attendance Status</p>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div className="bg-primary bg-opacity-10 p-3 rounded-4 text-primary"><Clipboard size={24} /></div>
                                                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 small">Tasks</span>
                                            </div>
                                            <h2 className="fw-bold text-dark mb-1">{responsibilities.length}</h2>
                                            <p className="text-muted small mb-0">Active Responsibilities</p>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div className="bg-info bg-opacity-10 p-3 rounded-4 text-info"><Star size={24} /></div>
                                                <span className="badge bg-info bg-opacity-10 text-info rounded-pill px-2 small">Performance</span>
                                            </div>
                                            <h2 className="fw-bold text-dark mb-1">4.8/5</h2>
                                            <p className="text-muted small mb-0">Patient Feedback Score</p>
                                        </div>
                                    </div>

                                    {/* Detailed Sections */}
                                    <div className="col-lg-8">
                                        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                                            <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                                                <Briefcase size={20} className="text-primary" /> Current Responsibilities
                                            </h5>
                                            {responsibilities.length > 0 ? (
                                                <div className="table-responsive">
                                                    <table className="table table-hover align-middle custom-table">
                                                        <thead className="bg-light">
                                                            <tr>
                                                                <th>Details</th>
                                                                <th>Assigned Date</th>
                                                                <th>Status</th>
                                                                <th className="text-end">Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {responsibilities.map((task, i) => (
                                                                <tr key={i}>
                                                                    <td>
                                                                        <div className="fw-bold text-dark">
                                                                            {task.first_name ? `${task.first_name} ${task.last_name}` : 'General Duty'}
                                                                        </div>
                                                                        <div className="small text-muted">
                                                                            {task.ward_name ? `${task.ward_name} - Bed ${task.bed_number}` : (task.appointment_time || 'Daily Tasks')}
                                                                        </div>
                                                                    </td>
                                                                    <td className="small text-muted">{task.appointment_date || task.allocation_date || 'Today'}</td>
                                                                    <td>
                                                                        <span className="badge bg-info bg-opacity-10 text-info rounded-pill px-3 py-1">In Progress</span>
                                                                    </td>
                                                                    <td className="text-end">
                                                                        <button className="btn btn-sm btn-light rounded-pill px-3">View</button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="text-center py-5">
                                                    <div className="bg-light p-4 rounded-circle d-inline-block mb-3"><Clipboard size={32} className="text-muted" /></div>
                                                    <p className="text-muted">No pending responsibilities for today.</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="card border-0 shadow-sm rounded-4 p-4">
                                            <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                                                <Users size={20} className="text-primary" /> Performance History
                                            </h5>
                                            <div className="row g-3">
                                                <div className="col-md-6 border rounded-4 p-3 d-flex align-items-center gap-3">
                                                    <div className="bg-success bg-opacity-10 p-2 rounded text-success"><CheckCircle size={20} /></div>
                                                    <div>
                                                        <div className="fw-bold text-dark">98% Success Rate</div>
                                                        <div className="small text-muted">Task Completion</div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6 border rounded-4 p-3 d-flex align-items-center gap-3">
                                                    <div className="bg-warning bg-opacity-10 p-2 rounded text-warning"><AlertTriangle size={20} /></div>
                                                    <div>
                                                        <div className="fw-bold text-dark">0 Warnings</div>
                                                        <div className="small text-muted">Professional Conduct</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sidebar Area */}
                                    <div className="col-lg-4">
                                        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                                            <h6 className="fw-bold text-muted text-uppercase small tracking-widest mb-4">Active Shift Details</h6>
                                            <div className="d-flex flex-column gap-3">
                                                <div className="d-flex justify-content-between">
                                                    <span className="text-muted small">Assigned Shift</span>
                                                    <span className="fw-bold text-primary small">{profile.shift || 'N/A'}</span>
                                                </div>
                                                <div className="d-flex justify-content-between">
                                                    <span className="text-muted small">Check-in Time</span>
                                                    <span className="fw-bold text-dark small">{attendance.today ? attendance.today.check_in_time : '--:--'}</span>
                                                </div>
                                                <div className="d-flex justify-content-between">
                                                    <span className="text-muted small">Check-out Time</span>
                                                    <span className="fw-bold text-dark small">{attendance.today?.check_out_time || '--:--'}</span>
                                                </div>
                                                <div className="d-flex justify-content-between">
                                                    <span className="text-muted small">Attendance Method</span>
                                                    <span className="badge bg-light text-dark small">{attendance.today?.method || 'Automatic'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="card border-0 shadow-sm rounded-4 p-4 bg-dark text-white overflow-hidden position-relative">
                                            <div className="position-relative z-1">
                                                <h6 className="fw-bold mb-3 opacity-75 text-uppercase small tracking-widest">Enterprise Access</h6>
                                                <div className="d-flex flex-column gap-2 mb-4">
                                                    {Object.entries(permissions).map(([key, val]) => (
                                                        <div key={key} className="d-flex align-items-center gap-2 small opacity-75">
                                                            {val ? <CheckCircle size={14} className="text-success" /> : <XCircle size={14} className="text-danger" />}
                                                            <span className="text-capitalize">{key.replace('_', ' ')}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button className="btn btn-outline-light btn-sm w-100 rounded-pill">Request Permission</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeSection === 'Attendance' && (
                            <motion.div key="attendance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div className="card border-0 shadow-sm rounded-4 p-4">
                                    <h5 className="fw-bold text-dark mb-4">Monthly Attendance Log</h5>
                                    <div className="row g-4 mb-4">
                                        <div className="col-md-3">
                                            <div className="p-4 bg-light rounded-4 text-center">
                                                <div className="h2 fw-bold text-primary">{attendance.monthly_count}</div>
                                                <div className="text-muted small">Days Present</div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="p-4 bg-light rounded-4 text-center">
                                                <div className="h2 fw-bold text-warning">0</div>
                                                <div className="text-muted small">Late Marks</div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="p-4 bg-light rounded-4 text-center">
                                                <div className="h2 fw-bold text-success">12h</div>
                                                <div className="text-muted small">Overtime Hours</div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="p-4 bg-light rounded-4 text-center">
                                                <div className="h2 fw-bold text-info">2</div>
                                                <div className="text-muted small">Leave Balance</div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-muted text-center pt-4">Complete attendance history is available in the HR portal.</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Additional sections follow the same pattern... */}
                        {activeSection === 'Evaluation' && (
                            <motion.div key="eval" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
                                    <div className="bg-primary bg-opacity-10 p-4 rounded-circle d-inline-block mb-4">
                                        <Star size={48} className="text-primary" />
                                    </div>
                                    <h3 className="fw-bold text-dark">Performance Evaluation</h3>
                                    <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '500px' }}>
                                        Our enterprise-grade evaluation system tracks your response times, patient feedback, and task accuracy.
                                    </p>
                                    <div className="row justify-content-center text-start g-3">
                                        <div className="col-md-5 p-4 border rounded-4 d-flex align-items-center gap-4">
                                            <div className="h1 fw-bold text-primary mb-0">9.2</div>
                                            <div>
                                                <div className="fw-bold text-dark">Supervisor Rating</div>
                                                <div className="small text-muted">Excellent work ethics</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <style>{`
                .hover-bg-light:hover { background-color: #f8f9fa; }
                .tracking-widest { letter-spacing: 0.15em; }
                .custom-table th { font-weight: 800; text-transform: uppercase; font-size: 0.75rem; color: #6c757d; border: none; }
                .custom-table td { border-color: #f8f9fa; }
                .transition-all { transition: all 0.3s ease; }
            `}</style>
        </div>
    );
};

export default StaffProfile;
