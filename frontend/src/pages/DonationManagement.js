import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import { useAuth } from '../context/AuthContext';
import { Gift, Plus, Coins, Package, HeartHandshake, Calendar } from 'lucide-react';
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

    const isStaff = ['admin', 'receptionist', 'doctor'].includes(user.role.toLowerCase());
    const canAdd = ['admin', 'receptionist'].includes(user.role.toLowerCase());

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
            case 'CSH': return <span className="badge bg-success bg-opacity-10 text-success border border-success rounded-pill d-flex align-items-center gap-1"><Coins size={12} /> Cash</span>;
            case 'ITM': return <span className="badge bg-primary bg-opacity-10 text-primary border border-primary rounded-pill d-flex align-items-center gap-1"><Package size={12} /> Item</span>;
            case 'SRV': return <span className="badge bg-info bg-opacity-10 text-info border border-info rounded-pill d-flex align-items-center gap-1"><HeartHandshake size={12} /> Service</span>;
            default: return <span className="badge bg-secondary">{type}</span>;
        }
    };

    const columns = [
        {
            key: 'patient_first_name',
            label: 'Beneficiary / Patient',
            sortable: true,
            render: (row) => row.patient_first_name
                ? <span className="fw-semibold">{row.patient_first_name} {row.patient_last_name}</span>
                : <span className="text-muted fst-italic">General Fund</span>
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
            render: (row) => <span className="fw-bold text-dark">{Number(row.donation_amount).toLocaleString()}</span>
        },
        {
            key: 'donation_date',
            label: 'Date',
            sortable: true,
            render: (row) => <span className="text-muted small"><Calendar size={14} className="me-1 mb-1" />{row.donation_date}</span>
        },
        {
            key: 'received_by',
            label: 'Received By',
            render: (row) => <span className="small text-secondary">{row.received_by}</span>
        }
    ];

    // Calculate Totals for Stats
    const totalDonations = donations.length;
    const totalAmount = donations.filter(d => d.donation_type === 'CSH').reduce((sum, d) => sum + Number(d.donation_amount), 0);

    return (
        <div className="container-fluid py-4 fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark d-flex align-items-center gap-2">
                        <Gift className="text-primary" /> Donation Management
                    </h2>
                    <p className="text-muted">Track and manage hospital donations and contributions</p>
                </div>
                {canAdd && (
                    <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> Record Donation
                    </button>
                )}
            </div>

            {/* Stats Row */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success">
                                <Coins size={24} />
                            </div>
                            <div>
                                <h6 className="text-muted mb-0">Total Cash Raised</h6>
                                <h3 className="fw-bold mb-0">${totalAmount.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm p-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                                <Gift size={24} />
                            </div>
                            <div>
                                <h6 className="text-muted mb-0">Total Contributions</h6>
                                <h3 className="fw-bold mb-0">{totalDonations}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DataTable
                title="Donation History"
                columns={columns}
                data={donations}
                keyField="donation_id"
            />

            {/* Add Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="modal-dialog modal-dialog-centered"
                        >
                            <div className="modal-content border-0 shadow-lg rounded-4">
                                <div className="modal-header border-bottom-0 p-4">
                                    <h5 className="modal-title fw-bold">Record New Donation</h5>
                                    <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
                                </div>
                                <div className="modal-body p-4 pt-0">
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
                                            <div className="form-text">Leave empty if the donation is for the hospital in general.</div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label small fw-bold text-muted">Type</label>
                                                <select
                                                    className="form-select bg-light border-0 py-2"
                                                    value={formData.donation_type}
                                                    onChange={(e) => setFormData({ ...formData, donation_type: e.target.value })}
                                                    required
                                                >
                                                    <option value="CSH">Cash / Monetary</option>
                                                    <option value="ITM">Item / Supply</option>
                                                    <option value="SRV">Service / Volunteering</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label small fw-bold text-muted">Value / Amount</label>
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

                                        <div className="d-flex justify-content-end gap-2">
                                            <button type="button" className="btn btn-light" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                            <button type="submit" className="btn btn-primary px-4" disabled={isSubmitting}>
                                                {isSubmitting ? 'Recording...' : 'Save Record'}
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
