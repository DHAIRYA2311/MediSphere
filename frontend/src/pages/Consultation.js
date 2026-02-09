import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    ClipboardList, Calendar, Clock,
    ArrowRight, Search, CheckCircle,
    AlertCircle, Stethoscope
} from 'lucide-react';
import { motion } from 'framer-motion';

const Consultation = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('today');
    const [search, setSearch] = useState('');

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`appointments/list.php?doctor_id=${user?.user_id}&filter=${filter}`);
            if (res.status === 'success') {
                setAppointments(res.data || []);
            }
        } catch (err) {
            console.error('Error fetching appointments:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.user_id, filter]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const filteredAppointments = appointments.filter(apt =>
        apt.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
        apt.reason?.toLowerCase().includes(search.toLowerCase())
    );

    const pendingAppointments = filteredAppointments.filter(apt =>
        apt.status === 'Scheduled' || apt.status === 'Checked-In'
    );

    const completedAppointments = filteredAppointments.filter(apt =>
        apt.status === 'Completed'
    );

    const startConsultation = (appointmentId) => {
        navigate(`/walk-in-consultation/${appointmentId}`);
    };

    return (
        <div className="container-fluid py-4 fade-in">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="d-flex justify-content-between align-items-center mb-4"
            >
                <div className="d-flex align-items-center gap-3">
                    <div className="rounded-3 p-3" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)' }}>
                        <Stethoscope size={28} className="text-white" />
                    </div>
                    <div>
                        <h2 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>Consultation</h2>
                        <p className="text-muted mb-0">View and start patient consultations</p>
                    </div>
                </div>
            </motion.div>

            {/* Filters & Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card border-0 shadow-sm rounded-4 mb-4"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)', backdropFilter: 'blur(20px)' }}
            >
                <div className="card-body p-4">
                    <div className="row g-3 align-items-center">
                        <div className="col-md-6">
                            <div className="position-relative">
                                <Search size={18} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                                <input
                                    type="text"
                                    className="form-control ps-5 border-0 bg-light rounded-pill"
                                    placeholder="Search patient or reason..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="d-flex gap-2 justify-content-md-end">
                                {['today', 'week', 'all'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`btn rounded-pill px-4 ${filter === f
                                            ? 'text-white'
                                            : 'btn-outline-secondary border-0 bg-light'
                                            }`}
                                        style={filter === f ? { background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)' } : {}}
                                    >
                                        {f === 'today' ? 'Today' : f === 'week' ? 'This Week' : 'All'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card border-0 shadow-sm h-100"
                        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)', backdropFilter: 'blur(10px)' }}
                    >
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="text-muted small mb-1 text-uppercase fw-bold" style={{ letterSpacing: '0.5px' }}>Pending</p>
                                    <h2 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>{pendingAppointments.length}</h2>
                                </div>
                                <div className="rounded-3 p-3 bg-warning bg-opacity-10">
                                    <Clock size={24} className="text-warning" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
                <div className="col-md-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card border-0 shadow-sm h-100"
                        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)', backdropFilter: 'blur(10px)' }}
                    >
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="text-muted small mb-1 text-uppercase fw-bold" style={{ letterSpacing: '0.5px' }}>Completed</p>
                                    <h2 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>{completedAppointments.length}</h2>
                                </div>
                                <div className="rounded-3 p-3 bg-success bg-opacity-10">
                                    <CheckCircle size={24} className="text-success" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
                <div className="col-md-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card border-0 shadow-sm h-100"
                        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)', backdropFilter: 'blur(10px)' }}
                    >
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="text-muted small mb-1 text-uppercase fw-bold" style={{ letterSpacing: '0.5px' }}>Total Today</p>
                                    <h2 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>{filteredAppointments.length}</h2>
                                </div>
                                <div className="rounded-3 p-3 bg-primary bg-opacity-10">
                                    <Calendar size={24} className="text-primary" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Appointments List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card border-0 shadow-sm rounded-4 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)', backdropFilter: 'blur(20px)' }}
            >
                <div className="p-4" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)' }}>
                    <h5 className="mb-0 fw-bold text-white d-flex align-items-center gap-2">
                        <ClipboardList size={20} />
                        Patient Queue
                    </h5>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary"></div>
                        </div>
                    ) : pendingAppointments.length === 0 ? (
                        <div className="text-center py-5">
                            <AlertCircle size={48} className="text-muted mb-3" />
                            <p className="text-muted mb-0">No pending consultations</p>
                        </div>
                    ) : (
                        <div className="list-group list-group-flush">
                            {pendingAppointments.map((apt, index) => (
                                <motion.div
                                    key={apt.appointment_id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="list-group-item border-0 p-4 d-flex align-items-center justify-content-between"
                                    style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                                            style={{
                                                width: 50,
                                                height: 50,
                                                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)'
                                            }}
                                        >
                                            {apt.patient_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'P'}
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-1" style={{ color: 'var(--text-main)' }}>
                                                {apt.patient_name || 'Patient'}
                                            </h6>
                                            <div className="d-flex align-items-center gap-3 small text-muted">
                                                <span className="d-flex align-items-center gap-1">
                                                    <Clock size={12} />
                                                    {apt.time_slot || apt.appointment_time}
                                                </span>
                                                <span className="d-flex align-items-center gap-1">
                                                    <Calendar size={12} />
                                                    {apt.appointment_date}
                                                </span>
                                            </div>
                                            {apt.reason && (
                                                <small className="text-muted d-block mt-1">
                                                    Reason: {apt.reason}
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <span className={`badge rounded-pill px-3 py-2 ${apt.status === 'Checked-In'
                                            ? 'bg-success bg-opacity-10 text-success'
                                            : 'bg-warning bg-opacity-10 text-warning'
                                            }`}>
                                            {apt.status}
                                        </span>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => startConsultation(apt.appointment_id)}
                                            className="btn rounded-pill px-4 py-2 text-white d-flex align-items-center gap-2"
                                            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)' }}
                                        >
                                            Start
                                            <ArrowRight size={16} />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Consultation;
