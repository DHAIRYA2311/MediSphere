import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    Users, Calendar, Activity, TrendingUp, ArrowUpRight,
    Clock, FileText, Plus, Maximize2, BedDouble, DollarSign,
    UserCheck, Stethoscope, AlertCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const isPatient = user?.role === 'patient';
    const isDoctor = user?.role === 'doctor';
    const isStaff = ['admin', 'staff', 'receptionist'].includes(user?.role);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const res = await api.get('dashboard/stats.php');
                if (res.status === 'success') {
                    setStats(res.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Get current date info
    const today = new Date();
    const currentMonth = today.toLocaleString('default', { month: 'short' });
    const currentYear = today.getFullYear().toString().slice(-2);

    if (loading) {
        return (
            <div className="fade-in p-4">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                    <div className="spinner-border" style={{ color: 'var(--accent)' }} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate weekly totals
    const weeklyTotal = stats?.weekly_visits?.reduce((sum, day) => sum + day.value, 0) || 0;

    return (
        <div className="fade-in">
            {/* Header */}
            <div className="mb-4">
                <h3 className="fw-bold mb-1" style={{ color: 'var(--text-main)' }}>Statistical Summary</h3>
            </div>

            {/* Main Stats Grid */}
            <div className="row g-4 mb-4">
                {/* Number of Patients Card */}
                <div className="col-lg-4">
                    <motion.div
                        className="stat-card h-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h6 className="stat-card-title">Number of patients</h6>
                                <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill"
                                    style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-dark)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Week <TrendingUp size={12} />
                                </div>
                            </div>
                            <div className="stat-card-icon">
                                <ArrowUpRight size={18} />
                            </div>
                        </div>

                        <div className="row g-3 mt-2">
                            <div className="col-12">
                                <div className="inner-stat-card d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>Total Patients</p>
                                        <div className="d-flex align-items-center gap-2 mt-1">
                                            <Users size={16} style={{ color: 'var(--text-secondary)' }} />
                                            <span className="fw-bold fs-4" style={{ color: 'var(--text-main)' }}>
                                                {stats?.total_patients || 0}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="btn-icon" style={{ width: 32, height: 32 }}>
                                        <Maximize2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="inner-stat-card d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>Total Doctors</p>
                                        <div className="d-flex align-items-center gap-2 mt-1">
                                            <Stethoscope size={16} style={{ color: 'var(--text-secondary)' }} />
                                            <span className="fw-bold fs-4" style={{ color: 'var(--text-main)' }}>
                                                {stats?.total_doctors || 0}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="btn-icon" style={{ width: 32, height: 32 }}>
                                        <Maximize2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Daily Visit Card */}
                <div className="col-lg-4">
                    <motion.div
                        className="stat-card h-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h6 className="stat-card-title">Appointments</h6>
                                <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill"
                                    style={{ background: 'rgba(94, 170, 181, 0.15)', border: '1px solid rgba(94, 170, 181, 0.2)', fontSize: '0.75rem', color: 'var(--accent)' }}>
                                    Week <TrendingUp size={12} />
                                </div>
                            </div>
                            <div className="stat-card-icon" style={{ background: 'var(--accent)' }}>
                                <ArrowUpRight size={18} />
                            </div>
                        </div>

                        <div className="row g-3 mt-2">
                            <div className="col-12">
                                <div className="inner-stat-card d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>Today's Appointments</p>
                                        <div className="d-flex align-items-center gap-2 mt-1">
                                            <Activity size={16} style={{ color: 'var(--text-secondary)' }} />
                                            <span className="fw-bold fs-4" style={{ color: 'var(--text-main)' }}>
                                                {stats?.today_appointments || 0}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="btn-icon" style={{ width: 32, height: 32 }}>
                                        <Maximize2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="inner-stat-card d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>Weekly Total</p>
                                        <div className="d-flex align-items-center gap-2 mt-1">
                                            <Calendar size={16} style={{ color: 'var(--text-secondary)' }} />
                                            <span className="fw-bold fs-4" style={{ color: 'var(--text-main)' }}>
                                                {weeklyTotal}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="btn-icon" style={{ width: 32, height: 32 }}>
                                        <Maximize2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Room Capacity Card */}
                <div className="col-lg-4">
                    <motion.div
                        className="stat-card h-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h6 className="stat-card-title">Room Capacity</h6>
                                <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill"
                                    style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.75rem', color: 'var(--success)' }}>
                                    Status <TrendingUp size={12} />
                                </div>
                            </div>
                            <div className="stat-card-icon" style={{ background: 'rgba(94, 170, 181, 0.6)' }}>
                                <ArrowUpRight size={18} />
                            </div>
                        </div>

                        <div className="row g-3 mt-2">
                            <div className="col-12">
                                <div className="inner-stat-card d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>Beds Available</p>
                                        <div className="d-flex align-items-center gap-2 mt-1">
                                            <BedDouble size={16} style={{ color: 'var(--success)' }} />
                                            <span className="fw-bold fs-4" style={{ color: 'var(--text-main)' }}>
                                                {stats?.available_beds || 0}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="btn-icon" style={{ width: 32, height: 32 }}>
                                        <Maximize2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="inner-stat-card d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>Occupied Beds</p>
                                        <div className="d-flex align-items-center gap-2 mt-1">
                                            <BedDouble size={16} style={{ color: 'var(--warning)' }} />
                                            <span className="fw-bold fs-4" style={{ color: 'var(--text-main)' }}>
                                                {stats?.occupied_beds || 0}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="btn-icon" style={{ width: 32, height: 32 }}>
                                        <Maximize2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Second Row - Chart and Schedule */}
            <div className="row g-4">
                {/* Weekly Visits Chart */}
                <div className="col-lg-6">
                    <motion.div
                        className="stat-card h-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h6 className="stat-card-title mb-0">Weekly Appointments</h6>
                            <div className="d-flex align-items-center gap-2">
                                <div className="px-3 py-1 rounded-pill"
                                    style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-dark)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {currentMonth} '{currentYear}
                                </div>
                            </div>
                        </div>

                        {/* Chart */}
                        <div style={{ height: '200px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats?.weekly_visits || []}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#5eaab5" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#5eaab5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                                    <XAxis dataKey="name" stroke="#999" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#999" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(255,255,255,0.95)',
                                            border: '1px solid #eee',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#5eaab5"
                                        strokeWidth={2}
                                        fill="url(#colorValue)"
                                        name="Appointments"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Today's Schedule */}
                <div className="col-lg-6">
                    <motion.div
                        className="stat-card h-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h6 className="stat-card-title mb-0">Today's Schedule</h6>
                            <div className="d-flex align-items-center gap-2">
                                <Link to="/appointments" className="btn btn-sm btn-primary d-flex align-items-center gap-1">
                                    <Plus size={14} /> Book
                                </Link>
                            </div>
                        </div>

                        {/* Schedule Items */}
                        <div className="d-flex flex-column gap-3">
                            {stats?.today_schedule && stats.today_schedule.length > 0 ? (
                                stats.today_schedule.slice(0, 4).map((item, index) => (
                                    <div key={index} className="inner-stat-card">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <span className="fw-semibold small" style={{ color: 'var(--accent)' }}>{item.time}</span>
                                                <p className="mb-0 fw-medium" style={{ color: 'var(--text-main)' }}>
                                                    {item.patient_name}
                                                </p>
                                                {item.doctor_name && (
                                                    <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>
                                                        {item.doctor_name}
                                                    </p>
                                                )}
                                            </div>
                                            <span className={`badge ${item.status === 'Completed' ? 'badge-success' : item.status === 'Pending' ? 'badge-warning' : 'badge-info'}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4">
                                    <AlertCircle size={32} style={{ color: 'var(--text-muted)' }} className="mb-2" />
                                    <p className="mb-0" style={{ color: 'var(--text-muted)' }}>No appointments scheduled for today</p>
                                </div>
                            )}
                        </div>

                        {stats?.today_schedule && stats.today_schedule.length > 4 && (
                            <div className="text-center mt-3">
                                <Link to="/appointments" className="btn btn-light btn-sm">
                                    View All ({stats.today_schedule.length})
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Third Row - Quick Stats for Admin */}
            {isStaff && (
                <div className="row g-4 mt-2">
                    <div className="col-md-3">
                        <motion.div
                            className="stat-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <div className="d-flex align-items-center gap-3">
                                <div className="stat-card-icon" style={{ background: 'var(--primary)' }}>
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>Total Appointments</p>
                                    <h4 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>
                                        {stats?.total_appointments || 0}
                                    </h4>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="col-md-3">
                        <motion.div
                            className="stat-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.65 }}
                        >
                            <div className="d-flex align-items-center gap-3">
                                <div className="stat-card-icon" style={{ background: 'var(--warning)' }}>
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>Pending</p>
                                    <h4 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>
                                        {stats?.pending_appointments || 0}
                                    </h4>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="col-md-3">
                        <motion.div
                            className="stat-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <div className="d-flex align-items-center gap-3">
                                <div className="stat-card-icon" style={{ background: 'var(--success)' }}>
                                    <DollarSign size={20} />
                                </div>
                                <div>
                                    <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>Revenue</p>
                                    <h4 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>
                                        ${(stats?.total_revenue || 0).toLocaleString()}
                                    </h4>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="col-md-3">
                        <motion.div
                            className="stat-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.75 }}
                        >
                            <div className="d-flex align-items-center gap-3">
                                <div className="stat-card-icon" style={{ background: 'var(--info)' }}>
                                    <UserCheck size={20} />
                                </div>
                                <div>
                                    <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>Active Staff</p>
                                    <h4 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>
                                        {stats?.active_staff || stats?.total_staff || 0}
                                    </h4>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}

            {/* Recent Appointments */}
            {stats?.recent_appointments && stats.recent_appointments.length > 0 && (
                <motion.div
                    className="stat-card mt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h6 className="stat-card-title mb-0">Recent Appointments</h6>
                        <Link to="/appointments" className="btn btn-light btn-sm">View All</Link>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-borderless mb-0">
                            <thead>
                                <tr style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                    <th className="fw-semibold">Patient</th>
                                    <th className="fw-semibold">Doctor</th>
                                    <th className="fw-semibold">Date</th>
                                    <th className="fw-semibold">Time</th>
                                    <th className="fw-semibold text-end">Status</th>
                                </tr>
                            </thead>
                            <tbody style={{ fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                                {stats.recent_appointments.map((apt, index) => (
                                    <tr key={index}>
                                        <td className="fw-medium">{apt.patient_name}</td>
                                        <td>{apt.doctor_name}</td>
                                        <td>{new Date(apt.appointment_date).toLocaleDateString()}</td>
                                        <td>{apt.appointment_time}</td>
                                        <td className="text-end">
                                            <span className={`badge ${apt.status === 'Completed' ? 'badge-success' : apt.status === 'Pending' ? 'badge-warning' : apt.status === 'Cancelled' ? 'badge-danger' : 'badge-info'}`}>
                                                {apt.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Dashboard;
