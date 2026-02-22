import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import PremiumSelect from '../components/PremiumSelect';

const BookAppointment = () => {
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        department: '',
        doctor_id: '',
        date: '',
        time: '',
        method: 'Online',
        notes: ''
    });
    const [message, setMessage] = useState('');
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

    const departments = [...new Set(doctors.map(d => d.department))];
    const filteredDoctors = doctors.filter(d => d.department === formData.department);

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
                alert('Appointment booked successfully!');
                navigate('/dashboard');
            } else {
                setMessage(res.message);
            }
        } catch (err) {
            setMessage('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5 fade-in">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card-enterprise border-0 shadow-lg p-5">
                        <h2 className="mb-4 fw-bold text-dark"><i className="bi bi-calendar-plus me-2 text-primary"></i>Book Appointment</h2>
                        {message && <div className="alert alert-danger">{message}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-6 mb-4 d-flex flex-column">
                                    <PremiumSelect
                                        label="Select Department"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        options={departments.map(dept => ({ value: dept, label: dept }))}
                                        placeholder="-- Choose Department --"
                                    />
                                </div>
                                <div className="col-md-6 mb-4 d-flex flex-column">
                                    <PremiumSelect
                                        label="Select Specialist"
                                        name="doctor_id"
                                        value={formData.doctor_id}
                                        onChange={handleChange}
                                        options={filteredDoctors.map(doc => ({
                                            value: doc.doctor_id,
                                            label: `Dr. ${doc.first_name} ${doc.last_name} (${doc.specialization})`
                                        }))}
                                        placeholder={formData.department ? "-- Choose Specialist --" : "-- Choose Dept First --"}
                                        disabled={!formData.department}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-4">
                                    <label className="form-label small fw-bold text-muted">Date</label>
                                    <input type="date" name="date" className="form-control bg-light border-0" onChange={handleChange} required />
                                </div>
                                <div className="col-md-6 mb-4">
                                    <label className="form-label small fw-bold text-muted">Time</label>
                                    <input type="time" name="time" className="form-control bg-light border-0" onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="form-label d-block small fw-bold text-muted">Appointment Type</label>
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
                                        <label className="btn btn-outline-primary w-100 p-3 h-100 d-flex flex-column align-items-center justify-content-center gap-2 border-2" htmlFor="method-online">
                                            <i className="bi bi-camera-video fs-3"></i>
                                            <span className="fw-bold">Online Video</span>
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
                                        <label className="btn btn-outline-success w-100 p-3 h-100 d-flex flex-column align-items-center justify-content-center gap-2 border-2" htmlFor="method-walkin">
                                            <i className="bi bi-hospital fs-3"></i>
                                            <span className="fw-bold">Offline / In-Person</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="form-label small fw-bold text-muted">Notes (Symptoms, etc.)</label>
                                <textarea name="notes" className="form-control bg-light border-0" rows="3" onChange={handleChange} placeholder="Describe your symptoms briefly..."></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg fw-bold w-100 py-3" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Confirming...
                                    </>
                                ) : 'Confirm Appointment'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookAppointment;
