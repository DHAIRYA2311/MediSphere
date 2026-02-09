import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { CreditCard, Shield, CheckCircle, AlertCircle, Smartphone, Lock, ArrowRight } from 'lucide-react';
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

    const fetchBillDetails = React.useCallback(async () => {
        try {
            const res = await api.get(`billing/get_details.php?bill_id=${billId}`);
            if (res.status === 'success') {
                setBill(res.data);
                if (res.data.payment_status === 'Paid') {
                    navigate('/dashboard');
                }
            } else {
                setError(res.message);
            }
        } catch (e) {
            setError("Failed to load bill details");
        } finally {
            setLoading(false);
        }
    }, [billId, navigate]);

    useEffect(() => {
        fetchBillDetails();
    }, [fetchBillDetails]);

    const handlePay = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        setError('');

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
                    }, 2500);
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

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 fade-in">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    if (success) {
        return (
            <div className="container d-flex justify-content-center align-items-center vh-100 fade-in">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center p-5 rounded-5 shadow-lg"
                    style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)' }}
                >
                    <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        className="bg-success text-white rounded-circle d-inline-flex p-4 mb-4 shadow-lg"
                    >
                        <CheckCircle size={64} />
                    </motion.div>
                    <h2 className="fw-bold text-success mb-2">Payment Successful!</h2>
                    <p className="text-muted mb-4">Transaction ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    <div className="spinner-border spinner-border-sm text-success me-2"></div>
                    <span className="small text-muted">Redirecting to Dashboard...</span>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="container py-5 fade-in">
            <div className="row justify-content-center align-items-center">
                <div className="col-lg-5 mb-4 mb-lg-0">
                    {/* Bill Summary Card */}
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="card border-0 shadow-lg overflow-hidden rounded-4 text-white"
                        style={{ background: 'linear-gradient(135deg, #5eaab5 0%, #7fc4ce 100%)' }}
                    >
                        <div className="p-5 text-center position-relative">
                            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'url(/assets/pattern.png)', opacity: 0.1 }}></div>
                            <h6 className="mb-2 fw-medium opacity-75 text-uppercase ls-1">Total Payable Amount</h6>
                            <h1 className="fw-bold display-3 mb-0">${Number(bill?.total_amount).toLocaleString()}</h1>
                            <div className="position-absolute top-0 end-0 p-4 opacity-25">
                                <Shield size={64} />
                            </div>
                        </div>
                        <div className="p-4 bg-white bg-opacity-10 backdrop-blur border-top border-white border-opacity-10">
                            <div className="d-flex justify-content-between mb-3 border-bottom border-white border-opacity-10 pb-3">
                                <span className="opacity-75 small fw-bold">BILL ID</span>
                                <span className="fw-bold">#{bill?.bill_id}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3 border-bottom border-white border-opacity-10 pb-3">
                                <span className="opacity-75 small fw-bold">DOCTOR</span>
                                <span className="fw-bold">Dr. {bill?.doctor_fname} {bill?.doctor_lname}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-0">
                                <span className="opacity-75 small fw-bold">DATE</span>
                                <span className="fw-bold">{new Date(bill?.appointment_date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="col-lg-6 offset-lg-1">
                    {/* Payment Form */}
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="card border-0 shadow-lg p-4 p-md-5 rounded-4"
                        style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)' }}
                    >
                        <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
                            <Lock size={24} className="text-primary" /> Secure Payment
                        </h4>

                        {error && (
                            <div className="alert alert-danger d-flex align-items-center gap-2 border-0 bg-danger bg-opacity-10 text-danger rounded-3 mb-4">
                                <AlertCircle size={18} /> {error}
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="form-label small fw-bold text-muted text-uppercase mb-3">Select Payment Method</label>
                            <div className="d-flex gap-3">
                                <button
                                    className={`btn flex-grow-1 py-3 border-0 rounded-4 d-flex flex-column align-items-center gap-2 shadow-sm transition-all ${paymentMethod === 'card' ? 'bg-primary text-white scale-105' : 'bg-light text-muted hover-lift'}`}
                                    onClick={() => setPaymentMethod('card')}
                                >
                                    <CreditCard size={24} />
                                    <span className="small fw-bold">Credit/Debit Card</span>
                                </button>
                                <button
                                    className={`btn flex-grow-1 py-3 border-0 rounded-4 d-flex flex-column align-items-center gap-2 shadow-sm transition-all ${paymentMethod === 'upi' ? 'bg-primary text-white scale-105' : 'bg-light text-muted hover-lift'}`}
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
                                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                        className="mb-4 overflow-hidden"
                                    >
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted">Card Number</label>
                                            <div className="input-group">
                                                <span className="input-group-text border-0 bg-light rounded-start-3 ps-3"><CreditCard size={18} className="text-muted" /></span>
                                                <input type="text" className="form-control bg-light border-0 py-2 fs-6" placeholder="0000 0000 0000 0000" required />
                                            </div>
                                        </div>
                                        <div className="row g-3">
                                            <div className="col-6">
                                                <label className="form-label small fw-bold text-muted">Expiry Date</label>
                                                <input type="text" className="form-control bg-light border-0 py-2 rounded-3" placeholder="MM/YY" required />
                                            </div>
                                            <div className="col-6">
                                                <label className="form-label small fw-bold text-muted">CVV / CVC</label>
                                                <input type="password" className="form-control bg-light border-0 py-2 rounded-3" placeholder="123" required />
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="upi"
                                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                        className="mb-4 text-center py-4 bg-light rounded-4 overflow-hidden"
                                    >
                                        <div className="bg-white p-3 d-inline-block rounded-4 shadow-sm mb-3">
                                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MedispherePayment-${bill?.bill_id}`} alt="QR Code" style={{ width: 150, height: 150 }} className="img-fluid" />
                                        </div>
                                        <p className="small text-muted mb-3 fw-bold">Scan with any UPI App</p>
                                        <div className="d-flex align-items-center justify-content-center gap-2 divider-text text-muted small my-3">OR</div>
                                        <div className="px-4">
                                            <input className="form-control text-center border-0 shadow-sm py-2 rounded-3" placeholder="Enter UPI ID (e.g. user@bank)" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-lg d-flex align-items-center justify-content-center gap-2 hover-scale"
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>Processing <span className="spinner-border spinner-border-sm ms-2"></span></>
                                ) : (
                                    <>Pay Now <ArrowRight size={18} /></>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
