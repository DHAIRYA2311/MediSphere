import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import { UserPlus, LogOut, Search, Clock, Users, UserCheck, TrendingUp, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VisitorManagement = () => {
    const [visitors, setVisitors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        patient_id: '',
        visitor_name: '',
        relation: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [visRes, patRes] = await Promise.all([
                api.get('visitors/list.php'),
                api.get('patients/list.php')
            ]);

            if (visRes.status === 'success') setVisitors(visRes.data);
            if (patRes.status === 'success') setPatients(patRes.data);
        } catch (e) {
            console.error("Error fetching data", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async (visitorId) => {
        if (!window.confirm("Mark visitor as checked out?")) return;
        try {
            const res = await api.post('visitors/checkout.php', { visitor_id: visitorId });
            if (res.status === 'success') {
                fetchData();
            } else {
                alert(res.message);
            }
        } catch (e) {
            alert("Error checking out");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.post('visitors/add.php', formData);
            if (res.status === 'success') {
                setIsModalOpen(false);
                setFormData({ patient_id: '', visitor_name: '', relation: '' });
                fetchData();
            } else {
                alert(res.message);
            }
        } catch (e) {
            alert("Error adding visitor");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredPatients = patients.filter(p =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone?.includes(searchTerm)
    );

    // Stats
    const totalVisitors = visitors.length;
    const activeVisitors = visitors.filter(v => !v.exit_time || new Date(v.exit_time).getFullYear() > 2050).length;
    const checkedOut = totalVisitors - activeVisitors;
    const todayVisitors = visitors.filter(v => {
        const d = new Date(v.entry_time);
        const now = new Date();
        return d.toDateString() === now.toDateString();
    }).length;

    // Stat Card Component
    const StatCard = ({ icon: Icon, title, value, color, subtitle }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card border-0 shadow-sm h-100"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)', backdropFilter: 'blur(10px)' }}
        >
            <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <p className="text-muted small mb-1 text-uppercase fw-bold" style={{ letterSpacing: '0.5px' }}>{title}</p>
                        <h2 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>{value}</h2>
                        {subtitle && <small className="text-muted">{subtitle}</small>}
                    </div>
                    <div className={`rounded-3 p-3 bg-${color} bg-opacity-10`}>
                        <Icon size={24} className={`text-${color}`} />
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const columns = [
        {
            key: 'visitor_name',
            label: 'Visitor Details',
            sortable: true,
            render: (row) => (
                <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: 44, height: 44 }}>
                        {row.visitor_name?.charAt(0) || 'V'}
                    </div>
                    <div>
                        <div className="fw-bold text-dark">{row.visitor_name}</div>
                        <span className="badge bg-secondary bg-opacity-10 text-secondary border rounded-pill px-2">{row.relation}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'patient_first_name',
            label: 'Visiting Patient',
            sortable: true,
            render: (row) => (
                <div className="d-flex align-items-center gap-2">
                    <div className="rounded-circle bg-success bg-opacity-10 border d-flex align-items-center justify-content-center text-success" style={{ width: 32, height: 32 }}>
                        <Users size={14} />
                    </div>
                    <div className="fw-semibold text-dark">{row.patient_first_name} {row.patient_last_name}</div>
                </div>
            )
        },
        {
            key: 'entry_time',
            label: 'Time Log',
            sortable: true,
            render: (row) => {
                const isActive = !row.exit_time || new Date(row.exit_time).getFullYear() > 2050;
                return (
                    <div className="small">
                        <div className="d-flex align-items-center gap-2 text-success mb-1">
                            <Clock size={12} />
                            <span className="fw-bold">In:</span> {new Date(row.entry_time).toLocaleString()}
                        </div>
                        {!isActive ? (
                            <div className="d-flex align-items-center gap-2 text-danger">
                                <LogOut size={12} />
                                <span className="fw-bold">Out:</span> {new Date(row.exit_time).toLocaleString()}
                            </div>
                        ) : (
                            <span className="badge bg-success bg-opacity-10 text-success border border-success rounded-pill px-3">
                                <Activity size={10} className="me-1" /> Active Now
                            </span>
                        )}
                    </div>
                );
            }
        }
    ];

    const actions = [
        {
            label: 'Check Out',
            icon: LogOut,
            onClick: (row) => handleCheckOut(row.visitor_id),
            className: (row) => (!row.exit_time || new Date(row.exit_time).getFullYear() > 2050) ? 'text-danger' : 'd-none'
        }
    ];

    return (
        <div className="container-fluid py-4 fade-in">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--text-main)' }}>Visitor Management</h2>
                    <p className="text-muted mb-0">Track patient visitors and pass logs</p>
                </div>
                <button className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow-sm" onClick={() => setIsModalOpen(true)}>
                    <UserPlus size={18} /> New Check-In
                </button>
            </div>

            {/* Stats Row */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <StatCard icon={Users} title="Total Visitors" value={totalVisitors} color="primary" />
                </div>
                <div className="col-md-3">
                    <StatCard icon={UserCheck} title="Currently Active" value={activeVisitors} color="success" subtitle="In premises" />
                </div>
                <div className="col-md-3">
                    <StatCard icon={LogOut} title="Checked Out" value={checkedOut} color="secondary" />
                </div>
                <div className="col-md-3">
                    <StatCard icon={TrendingUp} title="Today" value={todayVisitors} color="info" subtitle="New visits" />
                </div>
            </div>

            {/* Data Table */}
            {loading ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted mt-3 mb-0">Loading visitor logs...</p>
                    </div>
                </div>
            ) : (
                <DataTable
                    title="Visitor Logs"
                    columns={columns}
                    data={visitors}
                    actions={actions}
                    keyField="visitor_id"
                />
            )}

            {/* Check-In Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.6)' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="modal-dialog modal-dialog-centered"
                        >
                            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                                <div className="modal-header border-0 p-4" style={{ background: 'linear-gradient(135deg, #5eaab5 0%, #7fc4ce 100%)' }}>
                                    <div>
                                        <h5 className="modal-title fw-bold text-white mb-1">Visitor Check-In</h5>
                                        <p className="text-white-50 mb-0 small">Register a new visitor entry</p>
                                    </div>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setIsModalOpen(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted">Search & Select Patient</label>
                                            <div className="input-group mb-2">
                                                <span className="input-group-text bg-light border-0"><Search size={16} className="text-muted" /></span>
                                                <input
                                                    type="text"
                                                    className="form-control bg-light border-0"
                                                    placeholder="Search patient name or phone..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                            <select
                                                className="form-select bg-light border-0"
                                                size="4"
                                                required
                                                value={formData.patient_id}
                                                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                                                style={{ height: 'auto', maxHeight: '140px' }}
                                            >
                                                <option value="" disabled>-- Select Patient --</option>
                                                {filteredPatients.map(p => (
                                                    <option key={p.patient_id} value={p.patient_id}>
                                                        {p.first_name} {p.last_name} ({p.phone})
                                                    </option>
                                                ))}
                                                {filteredPatients.length === 0 && <option disabled>No matches found</option>}
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted">Visitor Name</label>
                                            <input
                                                className="form-control bg-light border-0 py-2"
                                                value={formData.visitor_name}
                                                onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
                                                required
                                                placeholder="Enter visitor's full name"
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label small fw-bold text-muted">Relation to Patient</label>
                                            <select
                                                className="form-select bg-light border-0 py-2"
                                                value={formData.relation}
                                                onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                                                required
                                            >
                                                <option value="">-- Select Relation --</option>
                                                <option value="Spouse">Spouse</option>
                                                <option value="Parent">Parent</option>
                                                <option value="Child">Child</option>
                                                <option value="Sibling">Sibling</option>
                                                <option value="Friend">Friend</option>
                                                <option value="Relative">Relative</option>
                                                <option value="Colleague">Colleague</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        <div className="d-flex justify-content-end gap-3 pt-3 border-top">
                                            <button type="button" className="btn btn-light px-4 rounded-pill" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                            <button type="submit" className="btn btn-success px-5 rounded-pill shadow-sm" disabled={isSubmitting}>
                                                {isSubmitting ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Checking In...
                                                    </>
                                                ) : 'Check In Visitor'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VisitorManagement;
