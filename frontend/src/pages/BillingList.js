import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, Plus, FileText, DollarSign, Calendar, CheckCircle, CreditCard, ShieldCheck } from 'lucide-react';
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
        doc.setTextColor(37, 99, 235); // Primary Blue
        doc.text("Medisphere SHMS", 105, 20, null, null, "center");

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
                ['Total Amount', `$${bill.total_amount}`],
                ['Paid Amount', `$${bill.paid_amount}`],
                ['Due Amount', `$${bill.total_amount - bill.paid_amount}`],
            ],
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235] }
        });

        doc.text("Thank you for choosing Medisphere!", 105, doc.lastAutoTable.finalY + 20, null, null, "center");
        doc.save(`Bill_${bill.bill_id}.pdf`);
    };

    const columns = [
        {
            key: 'bill_id',
            label: 'ID',
            render: (row) => <span className="text-secondary fw-mono">#{row.bill_id}</span>
        },
        {
            key: 'first_name',
            label: 'Patient',
            sortable: true,
            render: (row) => (
                <div className="fw-semibold text-dark">{row.first_name} {row.last_name}</div>
            )
        },
        {
            key: 'payment_date',
            label: 'Date',
            sortable: true,
            render: (row) => (
                <div className="d-flex align-items-center gap-2 text-muted small">
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
                    <div className="fw-bold text-dark">${row.total_amount}</div>
                    <div className="small text-success">Paid: ${row.paid_amount}</div>
                </div>
            )
        },
        {
            key: 'payment_status',
            label: 'Status',
            sortable: true,
            render: (row) => (
                <span className={`badge ${row.payment_status === 'Paid' ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' :
                    row.payment_status === 'Pending' ? 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25' :
                        'bg-secondary bg-opacity-10 text-secondary'
                    } rounded-pill px-3 py-1`}>
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
                ) : <span className="text-muted small">None</span>
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
        <div className="container-fluid py-4 fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark">Billing & Invoices</h2>
                    <p className="text-muted">Track payments and generate invoices</p>
                </div>
                {isStaff && (
                    <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> Create Bill
                    </button>
                )}
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
                    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="modal-dialog modal-dialog-centered"
                        >
                            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                                <div className="modal-header border-bottom-0 bg-light p-4">
                                    <h5 className="modal-title fw-bold">New Invoice</h5>
                                    <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted">Patient</label>
                                            <select name="patient_id" className="form-select bg-light border-0" onChange={handleChange} required>
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
                                                <label className="form-label small fw-bold text-muted">Total Amount ($)</label>
                                                <input type="number" name="total_amount" className="form-control bg-light border-0" onChange={handleChange} required />
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label small fw-bold text-muted">Paid Amount ($)</label>
                                                <input type="number" name="paid_amount" className="form-control bg-light border-0" onChange={handleChange} required />
                                            </div>
                                        </div>
                                        <div className="row g-3 mb-4">
                                            <div className="col-6">
                                                <label className="form-label small fw-bold text-muted">Status</label>
                                                <select name="payment_status" className="form-select bg-light border-0" onChange={handleChange}>
                                                    <option value="Pending">Pending</option>
                                                    <option value="Paid">Paid</option>
                                                    <option value="Partial">Partial</option>
                                                </select>
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label small fw-bold text-muted">Date</label>
                                                <input type="date" name="payment_date" className="form-control bg-light border-0" value={formData.payment_date} onChange={handleChange} required />
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-end gap-2">
                                            <button type="button" className="btn btn-light" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                            <button type="submit" className="btn btn-primary px-4" disabled={isSubmitting}>
                                                {isSubmitting ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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
