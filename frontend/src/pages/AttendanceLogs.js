import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import { Calendar, Clock, User, Fingerprint, Search, Filter, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { TableSkeleton } from '../components/Skeleton';

const AttendanceLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get('attendance/list.php');
            if (res.status === 'success') {
                setLogs(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch attendance logs", error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            key: 'date',
            label: 'Date',
            sortable: true,
            render: (row) => (
                <div className="d-flex align-items-center gap-2">
                    <Calendar size={16} className="text-primary" />
                    <span className="fw-semibold">{new Date(row.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
            )
        },
        {
            key: 'first_name',
            label: 'Staff Member',
            sortable: true,
            render: (row) => (
                <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: 35, height: 35 }}>
                        {row.first_name.charAt(0)}
                    </div>
                    <div>
                        <div className="fw-bold text-dark">{row.first_name} {row.last_name}</div>
                        <div className="small text-muted">{row.designation || 'Staff'}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'check_in_time',
            label: 'Check-In',
            render: (row) => (
                <div className="d-flex align-items-center gap-2">
                    <div className="bg-success bg-opacity-10 p-1 px-2 rounded text-success small fw-bold">
                        <Clock size={12} className="me-1" />
                        {row.check_in_time}
                    </div>
                </div>
            )
        },
        {
            key: 'check_out_time',
            label: 'Check-Out',
            render: (row) => (
                <div className="d-flex align-items-center gap-2">
                    {row.check_out_time === '00:00:00' ? (
                        <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 rounded-pill px-3">Working...</span>
                    ) : (
                        <div className="bg-danger bg-opacity-10 p-1 px-2 rounded text-danger small fw-bold">
                            <Clock size={12} className="me-1" />
                            {row.check_out_time}
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'method',
            label: 'Method',
            sortable: true,
            render: (row) => (
                <span className={`badge ${row.method === 'Biometric' ? 'bg-primary' : 'bg-info'} bg-opacity-10 ${row.method === 'Biometric' ? 'text-primary' : 'text-info'} border border-opacity-10 rounded-pill px-3`}>
                    {row.method === 'Biometric' ? <Fingerprint size={12} className="me-1" /> : <User size={12} className="me-1" />}
                    {row.method}
                </span>
            )
        }
    ];

    const filteredLogs = logs.filter(log =>
        (log.first_name + " " + log.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.designation?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid py-4 fade-in">
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Attendance Master Ledger</h2>
                    <p className="text-muted mb-0">Monitor staff check-ins, check-outs, and biometric logs</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary d-flex align-items-center gap-2 rounded-pill px-4 shadow-sm h-fit">
                        <Download size={18} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card border-0 shadow-sm h-100"
                        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)', backdropFilter: 'blur(10px)' }}
                    >
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="text-muted small mb-1 text-uppercase fw-bold" style={{ letterSpacing: '0.5px' }}>Total Logs Today</p>
                                    <h2 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>
                                        {logs.filter(l => new Date(l.date).toDateString() === new Date().toDateString()).length}
                                    </h2>
                                </div>
                                <div className="rounded-3 p-3 bg-primary bg-opacity-10">
                                    <Calendar size={24} className="text-primary" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
                <div className="col-md-3">
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
                                    <p className="text-muted small mb-1 text-uppercase fw-bold" style={{ letterSpacing: '0.5px' }}>Biometric Scans</p>
                                    <h2 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>
                                        {logs.filter(l => l.method === 'Biometric').length}
                                    </h2>
                                </div>
                                <div className="rounded-3 p-3 bg-success bg-opacity-10">
                                    <Fingerprint size={24} className="text-success" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
                <div className="col-md-3">
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
                                    <p className="text-muted small mb-1 text-uppercase fw-bold" style={{ letterSpacing: '0.5px' }}>Currently Working</p>
                                    <h2 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>
                                        {logs.filter(l => l.check_out_time === '00:00:00' && new Date(l.date).toDateString() === new Date().toDateString()).length}
                                    </h2>
                                </div>
                                <div className="rounded-3 p-3 bg-warning bg-opacity-10">
                                    <User size={24} className="text-warning" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
                <div className="col-md-3">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="card border-0 shadow-sm h-100"
                        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)', backdropFilter: 'blur(10px)' }}
                    >
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="text-muted small mb-1 text-uppercase fw-bold" style={{ letterSpacing: '0.5px' }}>Avg. Check-In</p>
                                    <h2 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>09:15 AM</h2>
                                </div>
                                <div className="rounded-3 p-3 bg-info bg-opacity-10">
                                    <Clock size={24} className="text-info" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white bg-opacity-75 backdrop-blur-md p-3 rounded-4 border shadow-sm mb-4">
                <div className="row g-2 align-items-center">
                    <div className="col-md-6">
                        <div className="input-group">
                            <span className="input-group-text bg-light border-0"><Search size={18} className="text-muted" /></span>
                            <input
                                type="text"
                                className="form-control bg-light border-0"
                                placeholder="Search by staff name or designation..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-3 ms-auto">
                        <select className="form-select bg-light border-0">
                            <option value="">All Methods</option>
                            <option value="Biometric">Biometric</option>
                            <option value="Manual">Manual</option>
                        </select>
                    </div>
                </div>
            </div>

            {
                loading ? (
                    <TableSkeleton rows={10} cols={5} />
                ) : (
                    <DataTable
                        title="Attendance Records"
                        columns={columns}
                        data={filteredLogs}
                        keyField="attendance_id"
                    />
                )
            }
        </div >
    );
};

export default AttendanceLogs;
