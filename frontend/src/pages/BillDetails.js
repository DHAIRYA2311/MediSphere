import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    ArrowLeft, Download, ShieldCheck, CreditCard,
    Calendar, User, FileText, AlertCircle, CheckCircle2,
    Clock, Receipt, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BillDetails = () => {
    const { billId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submittingInsurance, setSubmittingInsurance] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    const [insuranceDetails, setInsuranceDetails] = useState({
        insurance_number: ''
    });

    const isStaff = ['admin', 'receptionist', 'staff'].includes(user?.role?.toLowerCase());

    useEffect(() => {
        fetchBillDetails();
    }, [billId]);

    const fetchBillDetails = async () => {
        setLoading(true);
        try {
            const res = await api.get(`billing/get_bill.php?bill_id=${billId}`);
            if (res.status === 'success') {
                setBill(res.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!window.confirm("Confirm payment of $" + outstanding.toFixed(2) + "?")) return;

        setIsPaying(true);
        try {
            const res = await api.post('billing/pay.php', { bill_id: bill.bill_id });
            if (res.status === 'success') {
                alert("Payment settled successfully!");
                fetchBillDetails();
            } else {
                alert(res.message);
            }
        } catch (error) {
            alert("Payment failed. Please try again.");
        } finally {
            setIsPaying(false);
        }
    };

    const handleSubmitToInsurance = async () => {
        if (!insuranceDetails.insurance_number) {
            alert("Please provide the Patient's Insurance Number.");
            return;
        }

        if (!window.confirm("Submit this bill to insurance for processing? This will lock the bill for further changes.")) return;

        setSubmittingInsurance(true);
        try {
            const res = await api.post('insurance/create.php', {
                patient_id: bill.patient_id,
                billing_id: bill.bill_id,
                insurance_number: insuranceDetails.insurance_number,
                claim_amount: bill.total_amount
            });

            if (res.status === 'success') {
                alert("Claim submitted successfully!");
                fetchBillDetails();
            } else {
                alert(res.message);
            }
        } catch (error) {
            alert("Error submitting claim");
        } finally {
            setSubmittingInsurance(false);
        }
    };

    if (loading) return (
        <div className="container py-5 text-center">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 text-muted">Loading secure billing data...</p>
        </div>
    );

    if (!bill) return (
        <div className="container py-5 text-center">
            <AlertCircle size={48} className="text-danger mb-3" />
            <h3>Bill Not Found</h3>
            <button className="btn btn-primary mt-3" onClick={() => navigate('/billing')}>Back to Billing</button>
        </div>
    );

    const outstanding = parseFloat(bill.total_amount) - parseFloat(bill.paid_amount);
    const isLocked = !!bill.claim_id;

    return (
        <div className="container-fluid py-4 fade-in">
            <button className="btn btn-link text-decoration-none text-muted mb-4 p-0 d-flex align-items-center gap-2" onClick={() => navigate('/billing')}>
                <ArrowLeft size={18} /> Back to Invoices
            </button>

            <div className="row g-4">
                {/* Main Bill Content */}
                <div className="col-lg-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-4 shadow-sm border p-4 p-md-5"
                    >
                        {/* Header Section */}
                        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-5 border-bottom pb-4">
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <Receipt size={32} className="text-primary" />
                                    <h2 className="fw-bold mb-0">INVOICE</h2>
                                </div>
                                <span className="text-secondary fw-mono">ID: #{bill.bill_id}</span>
                            </div>
                            <div className="text-md-end">
                                <span className={`badge rounded-pill px-3 py-2 mb-2 ${bill.payment_status === 'Paid' ? 'bg-success bg-opacity-10 text-success border border-success' :
                                    bill.payment_status === 'Partial' ? 'bg-info bg-opacity-10 text-info border border-info' :
                                        'bg-warning bg-opacity-10 text-warning border border-warning'
                                    }`}>
                                    {bill.payment_status}
                                </span>
                                <div className="small text-muted d-flex align-items-center justify-content-md-end gap-2">
                                    <Calendar size={14} /> Created: {bill.payment_date}
                                </div>
                            </div>
                        </div>

                        {/* Bill Info Grid */}
                        <div className="row g-4 mb-5">
                            <div className="col-md-6">
                                <h6 className="text-muted text-uppercase fw-bold small mb-3 ls-1">Patient Details</h6>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-light rounded-circle p-2 text-primary">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <div className="fw-bold fs-5">{bill.patient_fname} {bill.patient_lname}</div>
                                        <div className="text-muted small">{bill.patient_email}</div>
                                        <div className="text-muted small">{bill.patient_phone}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 text-md-end">
                                <h6 className="text-muted text-uppercase fw-bold small mb-3 ls-1">Medical Provider</h6>
                                <div className="fw-bold fs-5">Medisphere Hospital</div>
                                <div className="text-muted small">Treatment By: Dr. {bill.doctor_fname} {bill.doctor_lname}</div>
                                <div className="text-muted small">Specialization: {bill.specialization}</div>
                            </div>
                        </div>

                        {/* Summary Items Section (No DB items, showing breakdown) */}
                        <div className="table-responsive mb-5">
                            <table className="table table-borderless">
                                <thead className="border-bottom text-muted small text-uppercase fw-bold">
                                    <tr>
                                        <th className="py-3">Description</th>
                                        <th className="py-3 text-end">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="py-4">
                                            <div className="fw-bold text-dark">Consultation & Hospitalization Charges</div>
                                            <div className="small text-muted">Summary based on appointment records</div>
                                        </td>
                                        <td className="py-4 text-end fw-bold">${bill.total_amount}</td>
                                    </tr>
                                </tbody>
                                <tfoot className="border-top">
                                    <tr>
                                        <td className="pt-4 text-end text-muted">Subtotal:</td>
                                        <td className="pt-4 text-end">${bill.total_amount}</td>
                                    </tr>
                                    <tr>
                                        <td className="text-end text-muted">Grand Total:</td>
                                        <td className="text-end fw-bold fs-4 text-primary">${bill.total_amount}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Disclaimer */}
                        <div className="bg-light p-4 rounded-4 border border-dashed text-muted small">
                            <div className="d-flex gap-2">
                                <AlertCircle size={16} className="mt-1 flex-shrink-0" />
                                <div>
                                    This is a computer-generated invoice. For any discrepancies, please contact the hospital administration.
                                    If this bill is covered by insurance, further edits are disabled until the claim is processed.
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar Info & Actions */}
                <div className="col-lg-4">
                    {/* Financial Summary Box */}
                    <div className="bg-white rounded-4 shadow-sm border p-4 mb-4">
                        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                            <CreditCard size={20} className="text-primary" /> Payment Summary
                        </h5>

                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted">Total Bill</span>
                            <span className="fw-bold">${bill.total_amount}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-3">
                            <span className="text-muted">Amount Paid</span>
                            <span className="text-success fw-bold">-${bill.paid_amount}</span>
                        </div>

                        <div className="bg-light p-3 rounded-3 border-start border-4 border-primary mb-4">
                            <div className="small text-muted text-uppercase fw-bold mb-1">Outstanding Balance</div>
                            <h3 className={`fw-black mb-0 ${outstanding > 0 ? 'text-primary' : 'text-success'}`}>
                                ${outstanding.toFixed(2)}
                            </h3>
                        </div>

                        <button
                            className="btn btn-primary w-100 py-3 fw-bold rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2"
                            disabled={outstanding <= 0 || isLocked || isPaying}
                            onClick={handlePayment}
                        >
                            {isPaying ? (
                                <><span className="spinner-border spinner-border-sm" role="status"></span> Verifying Payment...</>
                            ) : outstanding <= 0 ? (
                                <><CheckCircle2 size={18} /> Fully Paid</>
                            ) : (
                                <><Receipt size={18} /> Proceed to Payment</>
                            )}
                        </button>
                    </div>

                    {/* Insurance Section */}
                    <div className="bg-white rounded-4 shadow-sm border p-4">
                        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                            <ShieldCheck size={20} className="text-info" /> Insurance Claim
                        </h5>

                        {bill.claim_id ? (
                            <div className="insurance-info">
                                <div className="bg-info bg-opacity-10 text-info p-3 rounded-4 border border-info border-opacity-25 mb-4">
                                    <div className="d-flex align-items-start gap-2 mb-2">
                                        <Clock size={18} className="mt-1" />
                                        <div>
                                            <div className="fw-bold">Claim #{bill.claim_id} Under Review</div>
                                            <div className="small">Submitted to provider on {bill.processed_date || 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div className="h4 mb-0 fw-black text-center py-2">{bill.claim_status}</div>
                                </div>
                                <div className="small text-muted mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span>Insurance ID:</span>
                                        <span className="fw-bold text-dark">{bill.insurance_number}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-1">
                                        <span>Claim Amount:</span>
                                        <span className="fw-bold text-dark">${bill.claim_amount}</span>
                                    </div>
                                </div>
                                <div className="alert alert-secondary small d-flex align-items-center gap-2 mb-0">
                                    <AlertCircle size={14} /> Bill is locked for insurance processing.
                                </div>
                            </div>
                        ) : (
                            <div className="insurance-submission">
                                <p className="text-muted small mb-4">
                                    Submit this bill directly to the patient's insurance provider for settlement.
                                    (Applicable for IPD patients only)
                                </p>
                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-muted">Policy / Insurance Number</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-0"><Building2 size={16} /></span>
                                        <input
                                            type="text"
                                            className="form-control bg-light border-0"
                                            placeholder="Enter ID..."
                                            value={insuranceDetails.insurance_number}
                                            onChange={(e) => setInsuranceDetails({ insurance_number: e.target.value })}
                                            disabled={!isStaff}
                                        />
                                    </div>
                                </div>
                                {isStaff ? (
                                    <button
                                        className="btn btn-outline-info w-100 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                                        onClick={handleSubmitToInsurance}
                                        disabled={submittingInsurance}
                                    >
                                        {submittingInsurance ? (
                                            <span className="spinner-border spinner-border-sm" role="status"></span>
                                        ) : (
                                            <><ShieldCheck size={18} /> Submit to Insurance</>
                                        )}
                                    </button>
                                ) : (
                                    <div className="text-center text-muted small italic">Only administrators can initiate claims.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillDetails;
