import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, Plus, FileText, DollarSign, Calendar, CheckCircle, CreditCard, ShieldCheck, TrendingUp, Clock, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TableSkeleton } from '../components/Skeleton';

const BillingList = () => {
    const { user } = useAuth();
    const [bills, setBills] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        patient_id: '',
        total_amount: '',
        paid_amount: '',
        payment_status: 'Pending',
        payment_date: new Date().toISOString().slice(0, 10)
    });

    const isStaff = ['admin', 'receptionist', 'staff'].includes(user?.role);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchBills();
            if (isStaff) await fetchPatients();
            setLoading(false);
        };
        loadData();
    }, [user, isStaff]);

    const fetchBills = async () => {
        const res = await api.get('billing/list.php');
        if (res.status === 'success') {
            setBills(res.data);
        }
    };

    const fetchPatients = async () => {
        const res = await api.get('patients/list.php');
        if (res.status === 'success') {
            setPatients(res.data);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleStatusUpdate = async (billId, newStatus) => {
        if (!window.confirm(`Mark this bill as ${newStatus}?`)) return;
        try {
            const res = await api.post('billing/update_status.php', { bill_id: billId, status: newStatus });
            if (res.status === 'success') {
                fetchBills();
            } else {
                alert(res.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.post('billing/create.php', formData);
            if (res.status === 'success') {
                setIsModalOpen(false);
                fetchBills();
            } else {
                alert(res.message);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const generatePDF = (bill) => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.setTextColor(26, 58, 74);
        doc.text("MediSphere Healthcare", 105, 20, null, null, "center");

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("Invoice / Receipt", 105, 30, null, null, "center");

        doc.setFontSize(12);
        doc.text(`Bill ID: #${bill.bill_id}`, 20, 50);
        doc.text(`Date: ${bill.payment_date}`, 150, 50);

        doc.text(`Patient: ${bill.first_name} ${bill.last_name}`, 20, 60);
        doc.text(`Email: ${bill.email}`, 20, 66);

        autoTable(doc, {
            startY: 80,
            head: [['Description', 'Amount']],
            body: [
                ['Status', bill.payment_status],
                ['Total Amount', `₹${bill.total_amount}`],
                ['Paid Amount', `₹${bill.paid_amount}`],
                ['Due Amount', `₹${bill.total_amount - bill.paid_amount}`],
            ],
            theme: 'grid',
            headStyles: { fillColor: [26, 58, 74] }
        });

        doc.text("Thank you for choosing MediSphere!", 105, doc.lastAutoTable.finalY + 20, null, null, "center");
        doc.save(`Bill_${bill.bill_id}.pdf`);
    };

    // Calculate stats
    const totalRevenue = bills.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);
    const collectedAmount = bills.reduce((sum, b) => sum + parseFloat(b.paid_amount || 0), 0);
    const pendingBills = bills.filter(b => b.payment_status === 'Pending').length;
    const paidBills = bills.filter(b => b.payment_status === 'Paid').length;

    const columns = [
        {
            key: 'bill_id',
            label: 'ID',
            render: (row) => <span className="small fw-mono" style={{ color: 'var(--text-muted)' }}>#{row.bill_id}</span>
        },
        {
            key: 'first_name',
            label: 'Patient',
            sortable: true,
            render: (row) => (
                <div className="d-flex align-items-center gap-2">
                    <div className="avatar avatar-primary" style={{ width: 36, height: 36, fontSize: '0.75rem' }}>
                        {row.first_name?.charAt(0)}{row.last_name?.charAt(0)}
                    </div>
                    <div>
                        <div className="fw-semibold" style={{ color: 'var(--text-main)' }}>{row.first_name} {row.last_name}</div>
                        <div className="small" style={{ color: 'var(--text-muted)' }}>{row.email}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'payment_date',
            label: 'Date',
            sortable: true,
            render: (row) => (
                <div className="d-flex align-items-center gap-2 small" style={{ color: 'var(--text-muted)' }}>
                    <Calendar size={14} /> {row.payment_date}
                </div>
            )
        },
        {
            key: 'total_amount',
            label: 'Amount',
            sortable: true,
            render: (row) => (
                <div>
                    <div className="fw-bold" style={{ color: 'var(--text-main)' }}>₹{row.total_amount}</div>
                    <div className="small" style={{ color: 'var(--success)' }}>Paid: ₹{row.paid_amount}</div>
                </div>
            )
        },
        {
            key: 'payment_status',
            label: 'Status',
            sortable: true,
            render: (row) => (
                <span className={`badge ${row.payment_status === 'Paid' ? 'badge-success' :
                    row.payment_status === 'Pending' ? 'badge-warning' : 'badge-info'
                    }`}>
                    {row.payment_status}
                </span>
            )
        },
        {
            key: 'claim_status',
            label: 'Insurance',
            render: (row) => (
                row.claim_id ? (
                    <span className={`small d-flex align-items-center gap-1 ${row.claim_status === 'Approved' ? 'text-success' : 'text-warning'}`}>
                        <ShieldCheck size={14} /> {row.claim_status}
                    </span>
                ) : <span style={{ color: 'var(--text-muted)' }} className="small">None</span>
            )
        }
    ];

    const actions = [
        {
            label: 'Mark as Paid',
            icon: CheckCircle,
            className: 'text-success',
            onClick: (row) => handleStatusUpdate(row.bill_id, 'Paid'),
            show: (row) => row.payment_status !== 'Paid' && isStaff
        },
        { label: 'Download PDF', icon: Download, onClick: generatePDF }
    ];

    return (
        <div className="fade-in">
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--text-main)' }}>Billing & Invoices</h2>
                    <p className="mb-0" style={{ color: 'var(--text-muted)' }}>
                        Track payments and generate invoices
                    </p>
                </div>
                {isStaff && (
                    <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> Create Bill
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
                <div className="col-6 col-lg-3">
                    <motion.div
                        className="stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="d-flex align-items-center gap-3">
                            <div className="stat-card-icon" style={{ background: 'var(--primary)' }}>
                                <DollarSign size={20} />
                            </div>
                            <div>
                                <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>Total Revenue</p>
                                <h4 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>₹{totalRevenue.toFixed(2)}</h4>
                            </div>
                        </div>
                    </motion.div>
                </div>
                <div className="col-6 col-lg-3">
                    <motion.div
                        className="stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        <div className="d-flex align-items-center gap-3">
                            <div className="stat-card-icon" style={{ background: 'var(--success)' }}>
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>Collected</p>
                                <h4 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>₹{collectedAmount.toFixed(2)}</h4>
                            </div>
                        </div>
                    </motion.div>
                </div>
                <div className="col-6 col-lg-3">
                    <motion.div
                        className="stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="d-flex align-items-center gap-3">
                            <div className="stat-card-icon" style={{ background: 'var(--warning)' }}>
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>Pending</p>
                                <h4 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>{pendingBills}</h4>
                            </div>
                        </div>
                    </motion.div>
                </div>
                <div className="col-6 col-lg-3">
                    <motion.div
                        className="stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                    >
                        <div className="d-flex align-items-center gap-3">
                            <div className="stat-card-icon" style={{ background: 'var(--accent)' }}>
                                <CheckCircle size={20} />
                            </div>
                            <div>
                                <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>Paid Bills</p>
                                <h4 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>{paidBills}</h4>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {loading ? (
                <TableSkeleton rows={8} cols={5} />
            ) : (
                <DataTable
                    title="Invoices"
                    columns={columns}
                    data={bills}
                    actions={actions}
                    keyField="bill_id"
                />
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="modal-dialog modal-dialog-centered"
                        >
                            <div className="modal-content border-0 shadow-lg" style={{ background: 'var(--bg-card)', borderRadius: '20px', overflow: 'hidden' }}>
                                <div className="modal-header border-bottom-0 p-4" style={{ background: 'var(--bg-dark)' }}>
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="stat-card-icon" style={{ background: 'var(--primary)', width: 40, height: 40 }}>
                                            <FileText size={20} />
                                        </div>
                                        <h5 className="modal-title fw-bold mb-0" style={{ color: 'var(--text-main)' }}>New Invoice</h5>
                                    </div>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setIsModalOpen(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label small fw-semibold" style={{ color: 'var(--text-muted)' }}>PATIENT</label>
                                            <select
                                                name="patient_id"
                                                className="form-select"
                                                onChange={handleChange}
                                                required
                                                style={{
                                                    background: 'var(--bg-dark)',
                                                    border: '1px solid var(--border-dark)',
                                                    borderRadius: '12px',
                                                    padding: '12px 16px',
                                                    color: 'var(--text-main)'
                                                }}
                                            >
                                                <option value="">Select Patient</option>
                                                {patients.map(p => (
                                                    <option key={p.patient_id} value={p.patient_id}>
                                                        {p.first_name} {p.last_name} ({p.email})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="row g-3 mb-3">
                                            <div className="col-6">
                                                <label className="form-label small fw-semibold" style={{ color: 'var(--text-muted)' }}>TOTAL AMOUNT (₹)</label>
                                                <input
                                                    type="number"
                                                    name="total_amount"
                                                    className="form-control"
                                                    onChange={handleChange}
                                                    required
                                                    style={{
                                                        background: 'var(--bg-dark)',
                                                        border: '1px solid var(--border-dark)',
                                                        borderRadius: '12px',
                                                        padding: '12px 16px',
                                                        color: 'var(--text-main)'
                                                    }}
                                                />
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label small fw-semibold" style={{ color: 'var(--text-muted)' }}>PAID AMOUNT (₹)</label>
                                                <input
                                                    type="number"
                                                    name="paid_amount"
                                                    className="form-control"
                                                    onChange={handleChange}
                                                    required
                                                    style={{
                                                        background: 'var(--bg-dark)',
                                                        border: '1px solid var(--border-dark)',
                                                        borderRadius: '12px',
                                                        padding: '12px 16px',
                                                        color: 'var(--text-main)'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="row g-3 mb-4">
                                            <div className="col-6">
                                                <label className="form-label small fw-semibold" style={{ color: 'var(--text-muted)' }}>STATUS</label>
                                                <select
                                                    name="payment_status"
                                                    className="form-select"
                                                    onChange={handleChange}
                                                    style={{
                                                        background: 'var(--bg-dark)',
                                                        border: '1px solid var(--border-dark)',
                                                        borderRadius: '12px',
                                                        padding: '12px 16px',
                                                        color: 'var(--text-main)'
                                                    }}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Paid">Paid</option>
                                                    <option value="Partial">Partial</option>
                                                </select>
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label small fw-semibold" style={{ color: 'var(--text-muted)' }}>DATE</label>
                                                <input
                                                    type="date"
                                                    name="payment_date"
                                                    className="form-control"
                                                    value={formData.payment_date}
                                                    onChange={handleChange}
                                                    required
                                                    style={{
                                                        background: 'var(--bg-dark)',
                                                        border: '1px solid var(--border-dark)',
                                                        borderRadius: '12px',
                                                        padding: '12px 16px',
                                                        color: 'var(--text-main)'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-end gap-2">
                                            <button
                                                type="button"
                                                className="btn px-4"
                                                onClick={() => setIsModalOpen(false)}
                                                style={{
                                                    background: 'var(--bg-dark)',
                                                    color: 'var(--text-main)',
                                                    borderRadius: '10px',
                                                    border: '1px solid var(--border-dark)'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button type="submit" className="btn btn-primary px-4" disabled={isSubmitting} style={{ borderRadius: '10px' }}>
                                                {isSubmitting ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" />
                                                        Generating...
                                                    </>
                                                ) : 'Generate Bill'}
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

export default BillingList;
