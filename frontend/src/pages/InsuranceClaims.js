import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import { ShieldCheck, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InsuranceClaims = () => {
    const [claims, setClaims] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        patient_id: '',
        insurance_number: '',
        claim_amount: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [claimsRes, patientsRes] = await Promise.all([
                api.get('insurance/list.php'),
                api.get('patients/list.php') // Re-using patients list API
            ]);

            if (claimsRes.status === 'success') setClaims(claimsRes.data);
            if (patientsRes.status === 'success') setPatients(patientsRes.data);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

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
                setFormData({ patient_id: '', insurance_number: '', claim_amount: '' });
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

    const columns = [
        {
            key: 'patient_first_name',
            label: 'Patient',
            sortable: true,
            render: (row) => (
                <div>
                    <div className="fw-bold text-dark">{row.patient_first_name} {row.patient_last_name}</div>
                    <div className="small text-muted">ID: {row.patient_id}</div>
                </div>
            )
        },
        {
            key: 'insurance_number',
            label: 'Policy Number',
            sortable: true,
            render: (row) => <span className="font-monospace text-dark">{row.insurance_number}</span>
        },
        {
            key: 'claim_amount',
            label: 'Amount ($)',
            sortable: true,
            render: (row) => <div className="fw-bold text-primary">${row.claim_amount}</div>
        },
        {
            key: 'claim_status',
            label: 'Status',
            sortable: true,
            render: (row) => {
                let color = 'secondary';
                let icon = <Clock size={14} className="me-1" />;
                if (row.claim_status === 'Approved') { color = 'success'; icon = <CheckCircle size={14} className="me-1" />; }
                if (row.claim_status === 'Rejected') { color = 'danger'; icon = <XCircle size={14} className="me-1" />; }

                return (
                    <span className={`badge bg-${color} bg-opacity-10 text-${color} border border-${color} rounded-pill d-flex align-items-center w-auto`} style={{ width: 'fit-content' }}>
                        {icon} {row.claim_status}
                    </span>
                );
            }
        },
        {
            key: 'processed_date',
            label: 'Date',
            render: (row) => <span className="text-muted small">{row.processed_date}</span>
        }
    ];

    const actions = [
        {
            label: 'Approve',
            icon: CheckCircle,
            className: 'text-success',
            onClick: (row) => handleStatusUpdate(row.claim_id, 'Approved')
            // Don't hide, allow re-approval if needed or hide based on logic
        },
        {
            label: 'Reject',
            icon: XCircle,
            className: 'text-danger',
            onClick: (row) => handleStatusUpdate(row.claim_id, 'Rejected')
        }
    ];

    return (
        <div className="container-fluid py-4 fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark">Insurance Claims</h2>
                    <p className="text-muted">Manage patient insurance claims and approvals</p>
                </div>
                <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> New Claim
                </button>
            </div>

            {loading ? (
                <div className="text-center py-5 text-muted">Loading claims...</div>
            ) : (
                <DataTable
                    title="All Claims"
                    columns={columns}
                    data={claims}
                    actions={actions}
                    keyField="claim_id"
                />
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="modal-dialog modal-dialog-centered"
                        >
                            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                                <div className="modal-header border-bottom-0 bg-light p-4">
                                    <h5 className="modal-title fw-bold">Submit New Claim</h5>
                                    <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted">Patient</label>
                                            <select
                                                className="form-select bg-light border-0"
                                                value={formData.patient_id}
                                                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
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
                                            <label className="form-label small fw-bold text-muted">Insurance / Policy Number</label>
                                            <input
                                                className="form-control bg-light border-0"
                                                value={formData.insurance_number}
                                                onChange={(e) => setFormData({ ...formData, insurance_number: e.target.value })}
                                                required
                                                placeholder="e.g. POL-123456789"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted">Claim Amount ($)</label>
                                            <input
                                                type="number"
                                                className="form-control bg-light border-0"
                                                value={formData.claim_amount}
                                                onChange={(e) => setFormData({ ...formData, claim_amount: e.target.value })}
                                                required
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div className="d-flex justify-content-end gap-2 mt-4">
                                            <button type="button" className="btn btn-light" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                            <button type="submit" className="btn btn-primary px-4" disabled={isSubmitting}>
                                                {isSubmitting ? 'Submitting...' : 'Submit Claim'}
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
