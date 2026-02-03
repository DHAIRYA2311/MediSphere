import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { CreditCard, Shield, CheckCircle, AlertCircle, Smartphone, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentPage = () => {
    const { billId } = useParams();
    const navigate = useNavigate();
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card'); // card, upi
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchBillDetails();
    }, [billId]);

    const fetchBillDetails = async () => {
        try {
            const res = await api.get(`billing/get_details.php?bill_id=${billId}`);
            if (res.status === 'success') {
                setBill(res.data);
                // If already paid, redirect
                if (res.data.payment_status === 'Paid') {
                    navigate('/dashboard'); // Or show receipt
                }
            } else {
                setError(res.message);
            }
        } catch (e) {
            setError("Failed to load bill details");
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        setError('');

        // Simulate network delay
        setTimeout(async () => {
            try {
                const res = await api.post('billing/pay.php', {
                    bill_id: billId,
                    method: paymentMethod === 'card' ? 'Credit Card' : 'UPI'
                });

                if (res.status === 'success') {
                    setSuccess(true);
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 2000);
                } else {
                    setError(res.message);
                    setIsProcessing(false);
                }
            } catch (err) {
                setError("Payment failed. Please try again.");
                setIsProcessing(false);
            }
        }, 1500);
    };

    if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary"></div></div>;

    if (success) {
        return (
            <div className="container d-flex justify-content-center align-items-center vh-100 fade-in">
                <div className="text-center">
                    <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="bg-success text-white rounded-circle d-inline-flex p-4 mb-4 shadow-lg"
                    >
                        <CheckCircle size={64} />
                    </motion.div>
                    <h2 className="fw-bold text-success mb-2">Payment Successful!</h2>
                    <p className="text-muted">Transaction ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    <p className="small text-muted mt-4">Redirecting to Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5 fade-in">
            <div className="row justify-content-center">
                <div className="col-lg-5">
                    {/* Bill Summary Card */}
                    <div className="card-enterprise border-0 shadow-lg overflow-hidden mb-4">
                        <div className="bg-primary p-4 text-white text-center position-relative">
                            <h5 className="mb-0 fw-light opacity-75">Total Payable</h5>
                            <h1 className="fw-bold display-4 mb-0">${bill?.total_amount}</h1>
                            <div className="position-absolute top-0 end-0 p-3 opacity-25"><Shield size={48} /></div>
                        </div>
                        <div className="p-4 bg-white">
                            <div className="d-flex justify-content-between mb-3 border-bottom pb-3">
                                <span className="text-muted small">BILL ID</span>
                                <span className="fw-bold text-dark">#{bill?.bill_id}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3 border-bottom pb-3">
                                <span className="text-muted small">DOCTOR</span>
                                <span className="fw-bold text-dark">Dr. {bill?.doctor_fname} {bill?.doctor_lname}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-0">
                                <span className="text-muted small">DATE</span>
                                <span className="fw-bold text-dark">{new Date(bill?.appointment_date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6">
                    {/* Payment Form */}
                    <div className="card-enterprise border-0 shadow-sm p-4 h-100">
                        <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
                            <Lock size={20} className="text-primary" /> Secure Payment
                        </h4>

                        {error && <div className="alert alert-danger d-flex align-items-center gap-2"><AlertCircle size={16} /> {error}</div>}

                        <div className="mb-4">
                            <label className="form-label small fw-bold text-muted">Select Payment Method</label>
                            <div className="d-flex gap-3">
                                <button
                                    className={`btn flex-grow-1 py-3 border-2 rounded-3 d-flex flex-column align-items-center gap-2 ${paymentMethod === 'card' ? 'btn-outline-primary bg-primary bg-opacity-10' : 'btn-outline-light text-muted border'}`}
                                    onClick={() => setPaymentMethod('card')}
                                >
                                    <CreditCard size={24} />
                                    <span className="small fw-bold">Card</span>
                                </button>
                                <button
                                    className={`btn flex-grow-1 py-3 border-2 rounded-3 d-flex flex-column align-items-center gap-2 ${paymentMethod === 'upi' ? 'btn-outline-primary bg-primary bg-opacity-10' : 'btn-outline-light text-muted border'}`}
                                    onClick={() => setPaymentMethod('upi')}
                                >
                                    <Smartphone size={24} />
                                    <span className="small fw-bold">UPI / App</span>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handlePay}>
                            <AnimatePresence mode="wait">
                                {paymentMethod === 'card' ? (
                                    <motion.div
                                        key="card"
                                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                        className="mb-4"
                                    >
                                        <div className="mb-3">
                                            <label className="form-label small text-muted">Card Number</label>
                                            <input type="text" className="form-control bg-light border-0" placeholder="0000 0000 0000 0000" required />
                                        </div>
                                        <div className="row g-3">
                                            <div className="col-6">
                                                <label className="form-label small text-muted">Expiry</label>
                                                <input type="text" className="form-control bg-light border-0" placeholder="MM/YY" required />
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label small text-muted">CVV</label>
                                                <input type="password" className="form-control bg-light border-0" placeholder="123" required />
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="upi"
                                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                        className="mb-4 text-center py-4 bg-light rounded-3"
                                    >
                                        <div className="bg-white p-3 d-inline-block rounded-3 shadow-sm mb-3">
                                            {/* Mock QR */}
                                            <div style={{ width: 150, height: 150, background: 'url(https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MedispherePayment) center/cover' }}></div>
                                        </div>
                                        <p className="small text-muted mb-3">Scan with any UPI App</p>
                                        <div className="d-flex align-items-center justify-content-center gap-2 divider-text text-muted small">OR</div>
                                        <div className="mt-3 px-4">
                                            <input className="form-control text-center border-0 shadow-sm" placeholder="Enter UPI ID (e.g. user@bank)" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-lg"
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <span>Processing <span className="spinner-border spinner-border-sm ms-2"></span></span>
                                ) : (
                                    `Pay $${bill?.total_amount}`
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
