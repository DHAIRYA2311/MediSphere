import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import { useAuth } from '../context/AuthContext';
import { Gift, Plus, Coins, Package, HeartHandshake, Calendar, TrendingUp, Heart, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DonationManagement = () => {
    const { user } = useAuth();
    const [donations, setDonations] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        patient_id: '',
        donation_type: 'CSH',
        donation_amount: '',
        donation_date: new Date().toISOString().split('T')[0]
    });

    const isStaff = ['admin', 'receptionist', 'doctor'].includes(user?.role?.toLowerCase());
    const canAdd = ['admin', 'receptionist'].includes(user?.role?.toLowerCase());

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [donRes, patRes] = await Promise.all([
                api.get('donations/list.php'),
                isStaff ? api.get('patients/list.php') : Promise.resolve({ status: 'success', data: [] })
            ]);

            if (donRes.status === 'success') setDonations(donRes.data);
            if (patRes.status === 'success') setPatients(patRes.data);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.post('donations/add.php', formData);
            if (res.status === 'success') {
                setIsModalOpen(false);
                setFormData({
                    patient_id: '',
                    donation_type: 'CSH',
                    donation_amount: '',
                    donation_date: new Date().toISOString().split('T')[0]
                });
                fetchData();
            } else {
                alert(res.message);
            }
        } catch (e) {
            alert('Error adding donation');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTypeBadge = (type) => {
        switch (type) {
            case 'CSH': return <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-2 d-flex align-items-center gap-1"><Coins size={12} /> Cash</span>;
            case 'ITM': return <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-2 d-flex align-items-center gap-1"><Package size={12} /> Item</span>;
            case 'SRV': return <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 rounded-pill px-3 py-2 d-flex align-items-center gap-1"><HeartHandshake size={12} /> Service</span>;
            default: return <span className="badge bg-secondary">{type}</span>;
        }
    };

    const columns = [
        {
            key: 'patient_first_name',
            label: 'Beneficiary / Patient',
            sortable: true,
            render: (row) => (
                <div className="d-flex align-items-center gap-3">
                    <div className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${row.patient_first_name ? 'bg-primary bg-opacity-10 text-primary' : 'bg-secondary bg-opacity-10 text-secondary'}`} style={{ width: 40, height: 40 }}>
                        {row.patient_first_name ? row.patient_first_name.charAt(0) : <Heart size={16} />}
                    </div>
                    <div>
                        {row.patient_first_name ? (
                            <span className="fw-semibold">{row.patient_first_name} {row.patient_last_name}</span>
                        ) : (
                            <span className="text-muted fst-italic">General Hospital Fund</span>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: 'donation_type',
            label: 'Type',
            sortable: true,
            render: (row) => getTypeBadge(row.donation_type)
        },
        {
            key: 'donation_amount',
            label: 'Amount / Value',
            sortable: true,
            render: (row) => <span className="fw-bold text-dark fs-5">₹{Number(row.donation_amount).toLocaleString()}</span>
        },
        {
            key: 'donation_date',
            label: 'Date',
            sortable: true,
            render: (row) => (
                <span className="text-muted small d-flex align-items-center gap-1">
                    <Calendar size={14} />
                    {new Date(row.donation_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
            )
        },
        {
            key: 'received_by',
            label: 'Received By',
            render: (row) => <span className="small text-secondary">{row.received_by || '-'}</span>
        }
    ];

    // Calculate Stats
    const totalDonations = donations.length;
    const totalCash = donations.filter(d => d.donation_type === 'CSH').reduce((sum, d) => sum + Number(d.donation_amount), 0);
    const itemDonations = donations.filter(d => d.donation_type === 'ITM').length;
    const thisMonth = donations.filter(d => {
        const now = new Date();
        const date = new Date(d.donation_date);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;

    // Stat Card Component
    const StatCard = ({ icon: Icon, title, value, color, subtitle, prefix = '' }) => (
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
                        <h2 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>{prefix}{value}</h2>
                        {subtitle && <small className="text-muted">{subtitle}</small>}
                    </div>
                    <div className={`rounded-3 p-3 bg-${color} bg-opacity-10`}>
                        <Icon size={24} className={`text-${color}`} />
                    </div>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="container-fluid py-4 fade-in">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: 'var(--text-main)' }}>
                        <Gift className="text-primary" /> Donation Management
                    </h2>
                    <p className="text-muted mb-0">Track and manage hospital donations and contributions</p>
                </div>
                {canAdd && (
                    <button className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow-sm" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> Record Donation
                    </button>
                )}
            </div>

            {/* Stats Row */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <StatCard icon={Coins} title="Total Cash Raised" value={totalCash.toLocaleString()} color="success" prefix="₹" />
                </div>
                <div className="col-md-3">
                    <StatCard icon={Gift} title="Total Contributions" value={totalDonations} color="primary" />
                </div>
                <div className="col-md-3">
                    <StatCard icon={Package} title="Item Donations" value={itemDonations} color="info" subtitle="Physical items" />
                </div>
                <div className="col-md-3">
                    <StatCard icon={TrendingUp} title="This Month" value={thisMonth} color="warning" subtitle="New donations" />
                </div>
            </div>

            {/* Data Table */}
            {loading ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted mt-3 mb-0">Loading donations...</p>
                    </div>
                </div>
            ) : (
                <DataTable
                    title="Donation History"
                    columns={columns}
                    data={donations}
                    keyField="donation_id"
                />
            )}

            {/* Add Modal */}
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
                                <div className="modal-header border-0 p-4" style={{ background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)' }}>
                                    <div>
                                        <h5 className="modal-title fw-bold text-white mb-1">Record New Donation</h5>
                                        <p className="text-white-50 mb-0 small">Log a new contribution to the hospital</p>
                                    </div>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setIsModalOpen(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted">Beneficiary Patient (Optional)</label>
                                            <select
                                                className="form-select bg-light border-0 py-2"
                                                value={formData.patient_id}
                                                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                                            >
                                                <option value="">-- General Hospital Fund --</option>
                                                {patients.map(p => (
                                                    <option key={p.patient_id} value={p.patient_id}>
                                                        {p.first_name} {p.last_name} (ID: {p.patient_id})
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="form-text small">Leave empty for general hospital donations.</div>
                                        </div>

                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Donation Type</label>
                                                <select
                                                    className="form-select bg-light border-0 py-2"
                                                    value={formData.donation_type}
                                                    onChange={(e) => setFormData({ ...formData, donation_type: e.target.value })}
                                                    required
                                                >
                                                    <option value="CSH">💵 Cash / Monetary</option>
                                                    <option value="ITM">📦 Item / Supply</option>
                                                    <option value="SRV">🤝 Service / Volunteering</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Value / Amount (₹)</label>
                                                <input
                                                    type="number"
                                                    className="form-control bg-light border-0 py-2"
                                                    value={formData.donation_amount}
                                                    onChange={(e) => setFormData({ ...formData, donation_amount: e.target.value })}
                                                    required
                                                    min="1"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label small fw-bold text-muted">Date Received</label>
                                            <input
                                                type="date"
                                                className="form-control bg-light border-0 py-2"
                                                value={formData.donation_date}
                                                onChange={(e) => setFormData({ ...formData, donation_date: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="d-flex justify-content-end gap-3 pt-3 border-top">
                                            <button type="button" className="btn btn-light px-4 rounded-pill" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                            <button type="submit" className="btn btn-primary px-5 rounded-pill shadow-sm" disabled={isSubmitting}>
                                                {isSubmitting ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Recording...
                                                    </>
                                                ) : 'Save Donation'}
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

export default DonationManagement;
