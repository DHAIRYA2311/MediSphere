import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import { ShieldCheck, Plus, CheckCircle, XCircle, Clock, DollarSign, TrendingUp, AlertCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InsuranceClaims = () => {
    const [claims, setClaims] = useState([]);
    const [patients, setPatients] = useState([]);
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        patient_id: '',
        billing_id: '',
        insurance_number: '',
        claim_amount: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [claimsRes, patientsRes, billsRes] = await Promise.all([
                api.get('insurance/list.php'),
                api.get('patients/list.php'),
                api.get('billing/list.php')
            ]);

            if (claimsRes.status === 'success') setClaims(claimsRes.data);
            if (patientsRes.status === 'success') setPatients(patientsRes.data);
            if (billsRes.status === 'success') setBills(billsRes.data);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Filter bills for the selected patient that are PENDING/PARTIAL
    const availableBills = bills.filter(b =>
        b.patient_id == formData.patient_id &&
        b.payment_status != 'Paid'
    );

    const handleStatusUpdate = async (claimId, newStatus) => {
        if (!window.confirm(`Are you sure you want to ${newStatus} this claim?`)) return;
        try {
            const res = await api.post('insurance/update.php', { claim_id: claimId, status: newStatus });
            if (res.status === 'success') {
                fetchData();
            } else {
                alert(res.message);
            }
        } catch (e) {
            alert('Error updating status');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.post('insurance/create.php', formData);
            if (res.status === 'success') {
                setIsModalOpen(false);
                setFormData({ patient_id: '', billing_id: '', insurance_number: '', claim_amount: '' });
                fetchData();
            } else {
                alert(res.message);
            }
        } catch (e) {
            alert('Error creating claim');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Stats
    const totalClaims = claims.length;
    const pendingClaims = claims.filter(c => c.claim_status === 'Pending').length;
    const approvedClaims = claims.filter(c => c.claim_status === 'Approved').length;
    const totalValue = claims.filter(c => c.claim_status === 'Approved').reduce((sum, c) => sum + Number(c.claim_amount || 0), 0);

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

    const columns = [
        {
            key: 'patient_first_name',
            label: 'Patient',
            sortable: true,
            render: (row) => (
                <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40 }}>
                        {row.patient_first_name?.charAt(0)}{row.patient_last_name?.charAt(0)}
                    </div>
                    <div>
                        <div className="fw-bold text-dark">{row.patient_first_name} {row.patient_last_name}</div>
                        <div className="small text-muted">ID: {row.patient_id}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'insurance_number',
            label: 'Policy Number',
            sortable: true,
            render: (row) => (
                <span className="font-monospace bg-light px-2 py-1 rounded text-dark">{row.insurance_number}</span>
            )
        },
        {
            key: 'claim_amount',
            label: 'Amount',
            sortable: true,
            render: (row) => <div className="fw-bold text-primary fs-5">₹{Number(row.claim_amount).toLocaleString()}</div>
        },
        {
            key: 'claim_status',
            label: 'Status',
            sortable: true,
            render: (row) => {
                let color = 'warning';
                let icon = <Clock size={14} className="me-1" />;
                let bgStyle = 'bg-opacity-10';
                if (row.claim_status === 'Approved') { color = 'success'; icon = <CheckCircle size={14} className="me-1" />; }
                if (row.claim_status === 'Rejected') { color = 'danger'; icon = <XCircle size={14} className="me-1" />; }

                return (
                    <span className={`badge bg-${color} ${bgStyle} text-${color} border border-${color} border-opacity-25 rounded-pill px-3 py-2 d-inline-flex align-items-center`}>
                        {icon} {row.claim_status}
                    </span>
                );
            }
        },
        {
            key: 'processed_date',
            label: 'Date',
            render: (row) => (
                <span className="text-muted small">
                    {row.processed_date ? new Date(row.processed_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                </span>
            )
        }
    ];

    const actions = [
        {
            label: 'Approve',
            icon: CheckCircle,
            className: (row) => row.claim_status === 'Pending' ? 'text-success' : 'd-none',
            onClick: (row) => handleStatusUpdate(row.claim_id, 'Approved')
        },
        {
            label: 'Reject',
            icon: XCircle,
            className: (row) => row.claim_status === 'Pending' ? 'text-danger' : 'd-none',
            onClick: (row) => handleStatusUpdate(row.claim_id, 'Rejected')
        }
    ];

    return (
        <div className="container-fluid py-4 fade-in">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: 'var(--text-main)' }}>
                        <ShieldCheck className="text-primary" /> Insurance Claims
                    </h2>
                    <p className="text-muted mb-0">Manage patient insurance claims and approvals</p>
                </div>
                <button className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow-sm" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> New Claim
                </button>
            </div>

            {/* Stats Row */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <StatCard icon={FileText} title="Total Claims" value={totalClaims} color="primary" />
                </div>
                <div className="col-md-3">
                    <StatCard icon={Clock} title="Pending Review" value={pendingClaims} color="warning" subtitle="Awaiting decision" />
                </div>
                <div className="col-md-3">
                    <StatCard icon={CheckCircle} title="Approved" value={approvedClaims} color="success" />
                </div>
                <div className="col-md-3">
                    <StatCard icon={DollarSign} title="Total Approved Value" value={totalValue.toLocaleString()} color="info" prefix="₹" />
                </div>
            </div>

            {/* Data Table */}
            {loading ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted mt-3 mb-0">Loading claims...</p>
                    </div>
                </div>
            ) : (
                <DataTable
                    title="All Claims"
                    columns={columns}
                    data={claims}
                    actions={actions}
                    keyField="claim_id"
                />
            )}

            {/* Add Claim Modal */}
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
                                        <h5 className="modal-title fw-bold text-white mb-1">Submit New Claim</h5>
                                        <p className="text-white-50 mb-0 small">Create an insurance claim for a patient bill</p>
                                    </div>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setIsModalOpen(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted">Patient</label>
                                            <select
                                                className="form-select bg-light border-0 py-2"
                                                value={formData.patient_id}
                                                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value, billing_id: '' })}
                                                required
                                            >
                                                <option value="">-- Select Patient --</option>
                                                {patients.map(p => (
                                                    <option key={p.patient_id} value={p.patient_id}>
                                                        {p.first_name} {p.last_name} ({p.insurance_number || 'No Policy'})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted">Bill / Invoice</label>
                                            <select
                                                className="form-select bg-light border-0 py-2"
                                                value={formData.billing_id}
                                                onChange={(e) => {
                                                    const selectedBill = bills.find(b => b.bill_id == e.target.value);
                                                    setFormData({
                                                        ...formData,
                                                        billing_id: e.target.value,
                                                        claim_amount: selectedBill ? (selectedBill.total_amount - (selectedBill.paid_amount || 0)) : ''
                                                    });
                                                }}
                                                required
                                                disabled={!formData.patient_id}
                                            >
                                                <option value="">-- {formData.patient_id ? 'Select Unpaid Bill' : 'Select Patient First'} --</option>
                                                {availableBills.map(b => (
                                                    <option key={b.bill_id} value={b.bill_id}>
                                                        Bill #{b.bill_id} - Total: ₹{b.total_amount} (Due: ₹{b.total_amount - (b.paid_amount || 0)})
                                                    </option>
                                                ))}
                                            </select>
                                            {formData.patient_id && availableBills.length === 0 && (
                                                <div className="form-text text-warning small">
                                                    <AlertCircle size={12} className="me-1" />
                                                    No unpaid bills found for this patient
                                                </div>
                                            )}
                                        </div>
                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Insurance / Policy Number</label>
                                                <input
                                                    className="form-control bg-light border-0 py-2"
                                                    value={formData.insurance_number}
                                                    onChange={(e) => setFormData({ ...formData, insurance_number: e.target.value })}
                                                    required
                                                    placeholder="e.g. POL-123456789"
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Claim Amount (₹)</label>
                                                <input
                                                    type="number"
                                                    className="form-control bg-light border-0 py-2"
                                                    value={formData.claim_amount}
                                                    onChange={(e) => setFormData({ ...formData, claim_amount: e.target.value })}
                                                    required
                                                    placeholder="0.00"
                                                    min="1"
                                                />
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-end gap-3 pt-3 border-top">
                                            <button type="button" className="btn btn-light px-4 rounded-pill" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                            <button type="submit" className="btn btn-primary px-5 rounded-pill shadow-sm" disabled={isSubmitting}>
                                                {isSubmitting ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Submitting...
                                                    </>
                                                ) : 'Submit Claim'}
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

export default InsuranceClaims;
