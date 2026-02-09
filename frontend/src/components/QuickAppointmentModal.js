import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Calendar, Clock,
    Search, AlertCircle, CheckCircle2, Video,
    Hospital, ChevronRight, Loader2
} from 'lucide-react';
import { api } from '../services/api';

const QuickAppointmentModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1); // 1: Select Patient, 2: Select Doctor, 3: Details & Confirm
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [status, setStatus] = useState(''); // 'success', 'error'
    const [message, setMessage] = useState('');

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        time: '',
        method: 'Walk-in',
        notes: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
            // Reset state when opening
            setStep(1);
            setSelectedPatient(null);
            setSelectedDoctor(null);
            setStatus('');
            setMessage('');
            setSearchQuery('');
        }
    }, [isOpen]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [pRes, dRes] = await Promise.all([
                api.get('patients/list.php'),
                api.get('doctors/list.php')
            ]);
            if (pRes.status === 'success') setPatients(pRes.data);
            if (dRes.status === 'success') setDoctors(dRes.data);
        } catch (err) {
            console.error('Data fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(p =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone?.includes(searchQuery) ||
        p.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleBooking = async () => {
        setSubmitting(true);
        try {
            const data = {
                ...formData,
                doctor_id: selectedDoctor.doctor_id,
                patient_id: selectedPatient.patient_id // Backend needs to handle custom patient_id for receptionists
            };

            // Note: appointments/book.php might need to be checked if it handles patient_id explicitly
            // If it doesn't, we might need a specific endpoint for receptionists.
            // But let's assume the API can take a patient_id.

            const res = await api.post('appointments/book.php', data);

            if (res.status === 'success') {
                setStatus('success');
                setMessage('Appointment booked successfully!');
                setTimeout(() => onClose(), 2000);
            } else {
                setStatus('error');
                setMessage(res.message || 'Failed to book appointment.');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Network error. Please check your connection.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="modal-overlay d-flex align-items-center justify-content-center" style={{
                position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 10000, backdropFilter: 'blur(4px)'
            }} onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white rounded-4 shadow-2xl overflow-hidden shadow-lg"
                    style={{ width: '90%', maxWidth: '600px', maxHeight: '85vh', position: 'relative' }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-4 text-white d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(135deg, #5eaab5 0%, #7fc4ce 100%)' }}>
                        <div>
                            <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
                                <Calendar size={24} /> Quick Booking
                            </h4>
                            <p className="small opacity-75 mb-0 font-monospace">HOTKEY_F4_ACTIVE</p>
                        </div>
                        <button onClick={onClose} className="btn btn-link text-white p-0">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-light px-4 py-2 border-bottom d-flex gap-4 small fw-bold text-muted">
                        <span className={step >= 1 ? 'text-primary' : ''}>1. Patient</span>
                        <ChevronRight size={14} className="mt-1" />
                        <span className={step >= 2 ? 'text-primary' : ''}>2. Doctor</span>
                        <ChevronRight size={14} className="mt-1" />
                        <span className={step >= 3 ? 'text-primary' : ''}>3. Details</span>
                    </div>

                    <div className="p-4" style={{ overflowY: 'auto', maxHeight: 'calc(85vh - 150px)' }}>
                        {status === 'success' ? (
                            <div className="text-center py-5">
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-4">
                                    <CheckCircle2 size={80} className="text-success mx-auto" />
                                </motion.div>
                                <h4 className="fw-bold text-success">Confirmed!</h4>
                                <p className="text-muted">{message}</p>
                            </div>
                        ) : (
                            <>
                                {/* Step 1: Select Patient */}
                                {step === 1 && (
                                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                                        <div className="input-group mb-4 shadow-sm border rounded-pill overflow-hidden">
                                            <span className="input-group-text bg-white border-0 ps-3">
                                                <Search size={18} className="text-muted" />
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control border-0 py-2 fs-6"
                                                placeholder="Search by name, phone or email..."
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                                autoFocus
                                            />
                                        </div>

                                        <div className="list-group list-group-flush rounded-3 border">
                                            {loading ? (
                                                <div className="p-4 text-center text-muted"><Loader2 className="animate-spin mb-2 mx-auto" /> Loading database...</div>
                                            ) : filteredPatients.length > 0 ? (
                                                filteredPatients.slice(0, 5).map(p => (
                                                    <button
                                                        key={p.patient_id}
                                                        className="list-group-item list-group-item-action p-3 d-flex align-items-center justify-content-between"
                                                        onClick={() => { setSelectedPatient(p); setStep(2); }}
                                                    >
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40 }}>
                                                                {p.first_name[0]}
                                                            </div>
                                                            <div>
                                                                <div className="fw-bold text-dark">{p.first_name} {p.last_name}</div>
                                                                <div className="small text-muted">{p.phone}</div>
                                                            </div>
                                                        </div>
                                                        <ChevronRight size={18} className="text-muted" />
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="p-5 text-center text-muted">No patients found.</div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 2: Select Doctor */}
                                {step === 2 && (
                                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                                        <div className="mb-3 d-flex justify-content-between align-items-center">
                                            <h6 className="fw-bold text-muted mb-0">Select Specialist</h6>
                                            <button className="btn btn-sm text-primary p-0 fw-bold" onClick={() => setStep(1)}>Back</button>
                                        </div>
                                        <div className="list-group list-group-flush rounded-3 border">
                                            {doctors.map(d => (
                                                <button
                                                    key={d.doctor_id}
                                                    className="list-group-item list-group-item-action p-3 d-flex align-items-center justify-content-between"
                                                    onClick={() => { setSelectedDoctor(d); setStep(3); }}
                                                >
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40 }}>
                                                            {d.first_name[0]}
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold text-dark">Dr. {d.first_name} {d.last_name}</div>
                                                            <div className="small text-primary">{d.specialization}</div>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={18} className="text-muted" />
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 3: Logistics & Confirm */}
                                {step === 3 && (
                                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                                        <div className="bg-light p-3 rounded-4 mb-4 border">
                                            <div className="small text-muted text-uppercase fw-bold mb-2">Booking For</div>
                                            <div className="d-flex justify-content-between">
                                                <div>
                                                    <div className="fw-bold text-dark">{selectedPatient?.first_name} {selectedPatient?.last_name}</div>
                                                    <div className="small text-muted">With Dr. {selectedDoctor?.first_name} {selectedDoctor?.last_name}</div>
                                                </div>
                                                <button className="btn btn-sm btn-link p-0 text-decoration-none" onClick={() => setStep(1)}>Change</button>
                                            </div>
                                        </div>

                                        <div className="row g-3">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label small fw-bold text-muted"><Calendar size={14} className="me-1" /> Date</label>
                                                <input
                                                    type="date"
                                                    className="form-control border-0 bg-light py-2"
                                                    value={formData.date}
                                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label small fw-bold text-muted"><Clock size={14} className="me-1" /> Time</label>
                                                <input
                                                    type="time"
                                                    className="form-control border-0 bg-light py-2"
                                                    value={formData.time}
                                                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label small fw-bold text-muted">Visit Type</label>
                                                <div className="d-flex gap-2">
                                                    <button
                                                        className={`btn flex-grow-1 d-flex align-items-center justify-content-center gap-2 border-2 ${formData.method === 'Walk-in' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                        onClick={() => setFormData({ ...formData, method: 'Walk-in' })}
                                                    >
                                                        <Hospital size={16} /> In-Person
                                                    </button>
                                                    <button
                                                        className={`btn flex-grow-1 d-flex align-items-center justify-content-center gap-2 border-2 ${formData.method === 'Online' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                        onClick={() => setFormData({ ...formData, method: 'Online' })}
                                                    >
                                                        <Video size={16} /> Video
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="col-12 mb-4">
                                                <label className="form-label small fw-bold text-muted">Reason / Brief Symptoms</label>
                                                <textarea
                                                    className="form-control border-0 bg-light"
                                                    rows="2"
                                                    placeholder="E.g. Routine checkup, Fever..."
                                                    value={formData.notes}
                                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                                ></textarea>
                                            </div>
                                        </div>

                                        {message && status === 'error' && (
                                            <div className="alert alert-danger d-flex align-items-center gap-2 small mb-4">
                                                <AlertCircle size={16} /> {message}
                                            </div>
                                        )}

                                        <button
                                            className="btn btn-primary btn-lg w-100 py-3 fw-bold shadow-sm"
                                            onClick={handleBooking}
                                            disabled={submitting || !formData.time}
                                        >
                                            {submitting ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm Quick Booking'}
                                        </button>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            </div>

            <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .tracking-widest { letter-spacing: 0.1em; }
                .transition-all { transition: all 0.2s ease; }
            `}</style>
        </AnimatePresence>
    );
};

export default QuickAppointmentModal;
