import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Stethoscope, FileText, Video, Building, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const BookAppointment = () => {
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        doctor_id: '',
        date: '',
        time: '',
        method: 'Online',
        notes: ''
    });
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDoctors = async () => {
            const res = await api.get('doctors/list.php');
            if (res.status === 'success') {
                setDoctors(res.data);
            }
        };
        fetchDoctors();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);
        try {
            const res = await api.post('appointments/book.php', formData);
            if (res.status === 'success') {
                setSuccess(true);
                setTimeout(() => navigate('/appointments'), 2000);
            } else {
                setMessage(res.message);
            }
        } catch (err) {
            setMessage('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Get today's date for min date
    const today = new Date().toISOString().split('T')[0];

    // Find selected doctor
    const selectedDoctor = doctors.find(d => d.doctor_id === parseInt(formData.doctor_id));

    if (success) {
        return (
            <div className="fade-in d-flex align-items-center justify-content-center min-vh-100 p-4">
                <motion.div
                    className="stat-card text-center p-5"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{ maxWidth: '420px' }}
                >
                    <div
                        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                        style={{ width: 80, height: 80, background: 'rgba(16, 185, 129, 0.15)' }}
                    >
                        <Check size={40} style={{ color: 'var(--success)' }} />
                    </div>
                    <h3 className="fw-bold mb-2" style={{ color: 'var(--text-main)' }}>Appointment Booked!</h3>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Your appointment has been successfully scheduled. Redirecting to your appointments...
                    </p>
                    <div className="spinner-border spinner-border-sm text-primary mt-3" role="status" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="row g-4">
                {/* Main Form */}
                <div className="col-lg-8">
                    <motion.div
                        className="stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <div className="stat-card-icon" style={{ background: 'var(--primary)' }}>
                                <Calendar size={20} />
                            </div>
                            <h4 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>Book Appointment</h4>
                        </div>

                        {message && (
                            <div
                                className="d-flex align-items-center gap-2 py-3 px-4 mb-4"
                                style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    color: '#dc2626'
                                }}
                            >
                                <AlertCircle size={18} />
                                <span>{message}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Select Doctor */}
                            <div className="mb-4">
                                <label className="form-label small fw-semibold" style={{ color: 'var(--text-muted)' }}>
                                    SELECT DOCTOR
                                </label>
                                <div className="position-relative">
                                    <User size={18} className="position-absolute" style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <select
                                        name="doctor_id"
                                        className="form-select"
                                        onChange={handleChange}
                                        required
                                        value={formData.doctor_id}
                                        style={{
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border-dark)',
                                            borderRadius: '12px',
                                            padding: '14px 16px 14px 44px',
                                            color: 'var(--text-main)'
                                        }}
                                    >
                                        <option value="">-- Choose a Specialist --</option>
                                        {doctors.map(doc => (
                                            <option key={doc.doctor_id} value={doc.doctor_id}>
                                                Dr. {doc.first_name} {doc.last_name} - {doc.specialization}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Date and Time */}
                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <label className="form-label small fw-semibold" style={{ color: 'var(--text-muted)' }}>
                                        DATE
                                    </label>
                                    <div className="position-relative">
                                        <Calendar size={18} className="position-absolute" style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type="date"
                                            name="date"
                                            className="form-control"
                                            onChange={handleChange}
                                            required
                                            min={today}
                                            value={formData.date}
                                            style={{
                                                background: 'var(--bg-card)',
                                                border: '1px solid var(--border-dark)',
                                                borderRadius: '12px',
                                                padding: '14px 16px 14px 44px',
                                                color: 'var(--text-main)'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-semibold" style={{ color: 'var(--text-muted)' }}>
                                        TIME
                                    </label>
                                    <div className="position-relative">
                                        <Clock size={18} className="position-absolute" style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type="time"
                                            name="time"
                                            className="form-control"
                                            onChange={handleChange}
                                            required
                                            value={formData.time}
                                            style={{
                                                background: 'var(--bg-card)',
                                                border: '1px solid var(--border-dark)',
                                                borderRadius: '12px',
                                                padding: '14px 16px 14px 44px',
                                                color: 'var(--text-main)'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Appointment Type */}
                            <div className="mb-4">
                                <label className="form-label small fw-semibold" style={{ color: 'var(--text-muted)' }}>
                                    APPOINTMENT TYPE
                                </label>
                                <div className="row g-3">
                                    <div className="col-6">
                                        <input
                                            type="radio"
                                            className="btn-check"
                                            name="method"
                                            id="method-online"
                                            value="Online"
                                            checked={formData.method === 'Online'}
                                            onChange={handleChange}
                                        />
                                        <label
                                            className="btn w-100 p-4 d-flex flex-column align-items-center justify-content-center gap-2"
                                            htmlFor="method-online"
                                            style={{
                                                borderRadius: '16px',
                                                border: formData.method === 'Online'
                                                    ? '2px solid var(--primary)'
                                                    : '1px solid var(--border-dark)',
                                                background: formData.method === 'Online'
                                                    ? 'rgba(94, 170, 181, 0.1)'
                                                    : 'var(--bg-card)',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <div
                                                className="d-flex align-items-center justify-content-center rounded-circle"
                                                style={{
                                                    width: 48,
                                                    height: 48,
                                                    background: formData.method === 'Online' ? 'var(--primary)' : 'var(--bg-dark)'
                                                }}
                                            >
                                                <Video size={22} color={formData.method === 'Online' ? '#fff' : 'var(--text-muted)'} />
                                            </div>
                                            <span className="fw-semibold" style={{ color: 'var(--text-main)' }}>Online Video</span>
                                            <span className="small" style={{ color: 'var(--text-muted)' }}>Virtual consultation</span>
                                        </label>
                                    </div>
                                    <div className="col-6">
                                        <input
                                            type="radio"
                                            className="btn-check"
                                            name="method"
                                            id="method-walkin"
                                            value="Walk-in"
                                            checked={formData.method === 'Walk-in'}
                                            onChange={handleChange}
                                        />
                                        <label
                                            className="btn w-100 p-4 d-flex flex-column align-items-center justify-content-center gap-2"
                                            htmlFor="method-walkin"
                                            style={{
                                                borderRadius: '16px',
                                                border: formData.method === 'Walk-in'
                                                    ? '2px solid var(--success)'
                                                    : '1px solid var(--border-dark)',
                                                background: formData.method === 'Walk-in'
                                                    ? 'rgba(16, 185, 129, 0.1)'
                                                    : 'var(--bg-card)',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <div
                                                className="d-flex align-items-center justify-content-center rounded-circle"
                                                style={{
                                                    width: 48,
                                                    height: 48,
                                                    background: formData.method === 'Walk-in' ? 'var(--success)' : 'var(--bg-dark)'
                                                }}
                                            >
                                                <Building size={22} color={formData.method === 'Walk-in' ? '#fff' : 'var(--text-muted)'} />
                                            </div>
                                            <span className="fw-semibold" style={{ color: 'var(--text-main)' }}>In-Person</span>
                                            <span className="small" style={{ color: 'var(--text-muted)' }}>Visit clinic</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="mb-4">
                                <label className="form-label small fw-semibold" style={{ color: 'var(--text-muted)' }}>
                                    SYMPTOMS / NOTES
                                </label>
                                <div className="position-relative">
                                    <FileText size={18} className="position-absolute" style={{ left: '14px', top: '16px', color: 'var(--text-muted)' }} />
                                    <textarea
                                        name="notes"
                                        className="form-control"
                                        rows="4"
                                        onChange={handleChange}
                                        value={formData.notes}
                                        placeholder="Describe your symptoms briefly..."
                                        style={{
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border-dark)',
                                            borderRadius: '12px',
                                            padding: '14px 16px 14px 44px',
                                            color: 'var(--text-main)',
                                            resize: 'none'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg fw-semibold w-100 py-3"
                                disabled={loading}
                                style={{ borderRadius: '12px' }}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Confirming...
                                    </>
                                ) : 'Confirm Appointment'}
                            </button>
                        </form>
                    </motion.div>
                </div>

                {/* Sidebar - Selected Doctor Info */}
                <div className="col-lg-4">
                    <motion.div
                        className="stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h6 className="fw-bold mb-3" style={{ color: 'var(--text-main)' }}>Selected Doctor</h6>

                        {selectedDoctor ? (
                            <div>
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div
                                        className="avatar avatar-primary"
                                        style={{ width: 56, height: 56, fontSize: '1.25rem' }}
                                    >
                                        {selectedDoctor.first_name.charAt(0)}{selectedDoctor.last_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>
                                            Dr. {selectedDoctor.first_name} {selectedDoctor.last_name}
                                        </h6>
                                        <span className="badge badge-info">{selectedDoctor.specialization}</span>
                                    </div>
                                </div>
                                <div className="pt-3" style={{ borderTop: '1px solid var(--border-dark)' }}>
                                    <div className="d-flex justify-content-between small mb-2">
                                        <span style={{ color: 'var(--text-muted)' }}>Department</span>
                                        <span style={{ color: 'var(--text-main)' }}>{selectedDoctor.department}</span>
                                    </div>
                                    <div className="d-flex justify-content-between small mb-2">
                                        <span style={{ color: 'var(--text-muted)' }}>Experience</span>
                                        <span style={{ color: 'var(--text-main)' }}>{selectedDoctor.years_of_experience} years</span>
                                    </div>
                                    <div className="d-flex justify-content-between small">
                                        <span style={{ color: 'var(--text-muted)' }}>Qualification</span>
                                        <span style={{ color: 'var(--text-main)' }}>{selectedDoctor.qualification}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
                                <Stethoscope size={32} className="mb-2 opacity-50" />
                                <p className="small mb-0">Select a doctor to see details</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Appointment Summary */}
                    {formData.date && formData.time && (
                        <motion.div
                            className="stat-card mt-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h6 className="fw-bold mb-3" style={{ color: 'var(--text-main)' }}>Appointment Summary</h6>
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <Calendar size={16} style={{ color: 'var(--primary)' }} />
                                <span style={{ color: 'var(--text-main)' }}>{new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <Clock size={16} style={{ color: 'var(--primary)' }} />
                                <span style={{ color: 'var(--text-main)' }}>{formData.time}</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                {formData.method === 'Online' ? <Video size={16} style={{ color: 'var(--primary)' }} /> : <Building size={16} style={{ color: 'var(--success)' }} />}
                                <span style={{ color: 'var(--text-main)' }}>{formData.method === 'Online' ? 'Video Consultation' : 'In-Person Visit'}</span>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookAppointment;
