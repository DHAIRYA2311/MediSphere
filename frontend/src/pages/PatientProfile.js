import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Edit2, Save, X, User, Activity, HeartPulse, Shield, FileText, Mail, Phone, MapPin } from 'lucide-react';
import Skeleton from '../components/Skeleton';
import { motion } from 'framer-motion';

const PatientProfile = () => {
    const { id } = useParams();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const fetchPatient = async () => {
            setLoading(true);
            const query = id ? `?id=${id}` : '';
            try {
                const res = await api.get(`patients/get.php${query}`);
                if (res.status === 'success') {
                    setPatient(res.data);
                    setFormData(res.data);
                }
            } catch (error) {
                console.error("Fetch failed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPatient();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.post('patients/update.php', formData);
            if (res.status === 'success') {
                setPatient(formData);
                setIsEditing(false);
            } else {
                alert(res.message);
            }
        } catch (error) {
            console.error("Update failed", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="container py-5 fade-in">
            <div className="card border-0 shadow-lg p-5 rounded-4 bg-white bg-opacity-75">
                <div className="d-flex gap-4 align-items-center mb-5">
                    <Skeleton className="skeleton-circle" style={{ width: 80, height: 80 }} />
                    <div className="flex-grow-1">
                        <Skeleton className="skeleton-title" style={{ width: '40%' }} />
                        <Skeleton className="skeleton-text" style={{ width: '20%' }} />
                    </div>
                </div>
                <div className="row g-5">
                    <div className="col-md-6">
                        <Skeleton className="skeleton-title" style={{ width: '30%' }} />
                        <Skeleton className="skeleton-text" />
                        <Skeleton className="skeleton-text" />
                        <Skeleton className="skeleton-text" />
                    </div>
                    <div className="col-md-6">
                        <Skeleton className="skeleton-title" style={{ width: '30%' }} />
                        <Skeleton className="skeleton-rect" style={{ height: '150px' }} />
                    </div>
                </div>
            </div>
        </div>
    );

    if (!patient) return <div className="text-center py-5 text-muted">Patient not found.</div>;

    return (
        <div className="container py-5 fade-in">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card border-0 shadow-lg overflow-hidden rounded-4"
                        style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)' }}
                    >
                        {/* Header Banner */}
                        <div className="p-5 border-bottom" style={{ background: 'linear-gradient(135deg, #5eaab5 0%, #7fc4ce 100%)' }}>
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
                                <div className="d-flex align-items-center gap-4">
                                    <div className="rounded-circle bg-white text-info d-flex align-items-center justify-content-center fw-bold shadow-lg" style={{ width: 100, height: 100, fontSize: '2.5rem' }}>
                                        {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
                                    </div>
                                    <div className="text-white text-center text-md-start">
                                        <h2 className="fw-bold mb-1">{patient.first_name} {patient.last_name}</h2>
                                        <p className="mb-0 opacity-90 d-flex align-items-center gap-2 justify-content-center justify-content-md-start fw-medium">
                                            <Shield size={18} /> Patient ID: #{patient.patient_id}
                                        </p>
                                        <small className="opacity-75">Member since {new Date(patient.created_at || Date.now()).getFullYear()}</small>
                                    </div>
                                </div>
                                <div className="d-flex gap-2">
                                    {!isEditing ? (
                                        <button className="btn btn-white text-primary shadow-sm d-flex align-items-center gap-2 px-4 rounded-pill fw-bold" onClick={() => setIsEditing(true)}>
                                            <Edit2 size={18} /> Edit Profile
                                        </button>
                                    ) : (
                                        <>
                                            <button className="btn btn-light px-4 rounded-pill shadow-sm" onClick={() => setIsEditing(false)}>
                                                <X size={18} /> Cancel
                                            </button>
                                            <button className="btn btn-success px-4 rounded-pill shadow-sm d-flex align-items-center gap-2" onClick={handleSave} disabled={saving}>
                                                {saving ? <span className="spinner-border spinner-border-sm"></span> : <Save size={18} />} Save Changes
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="row g-5">
                                {/* Personal Section */}
                                <div className="col-md-6">
                                    <h5 className="d-flex align-items-center gap-2 text-info fw-bold mb-4 border-bottom pb-2">
                                        <User size={20} /> Personal Info
                                    </h5>

                                    <div className="group mb-4">
                                        <label className="form-label text-muted small fw-bold text-uppercase">Email Address</label>
                                        <div className="d-flex align-items-center gap-2">
                                            <Mail size={16} className="text-secondary" />
                                            <p className="fw-medium text-dark mb-0">{patient.email}</p>
                                        </div>
                                    </div>

                                    <div className="group mb-4">
                                        <label className="form-label text-muted small fw-bold text-uppercase">Phone Number</label>
                                        <div className="d-flex align-items-center gap-2">
                                            {isEditing ?
                                                <input name="phone" className="form-control bg-light border-0 py-2 rounded-3 w-100" value={formData.phone} onChange={handleChange} /> :
                                                <>
                                                    <Phone size={16} className="text-secondary" />
                                                    <p className="fw-medium text-dark mb-0">{patient.phone}</p>
                                                </>
                                            }
                                        </div>
                                    </div>

                                    <div className="group mb-4">
                                        <label className="form-label text-muted small fw-bold text-uppercase">Home Address</label>
                                        <div className="d-flex align-items-center gap-2">
                                            {isEditing ?
                                                <input name="address" className="form-control bg-light border-0 py-2 rounded-3 w-100" value={formData.address} onChange={handleChange} /> :
                                                <>
                                                    <MapPin size={16} className="text-secondary" />
                                                    <p className="fw-medium text-dark mb-0">{patient.address}</p>
                                                </>
                                            }
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="form-label text-muted small fw-bold text-uppercase">Emergency Contact</label>
                                        {isEditing ?
                                            <input name="emergency_contact" className="form-control bg-light border-0 py-2 rounded-3" value={formData.emergency_contact} onChange={handleChange} /> :
                                            <div className="bg-danger bg-opacity-10 p-3 rounded-3 border border-danger border-opacity-10">
                                                <p className="fw-bold text-danger mb-0 d-flex align-items-center gap-2">
                                                    <Activity size={16} /> {patient.emergency_contact || 'No Contact Provided'}
                                                </p>
                                            </div>
                                        }
                                    </div>
                                </div>

                                {/* Medical Section */}
                                <div className="col-md-6">
                                    <h5 className="d-flex align-items-center gap-2 text-danger fw-bold mb-4 border-bottom pb-2">
                                        <HeartPulse size={20} /> Medical Details
                                    </h5>

                                    <div className="row mb-4">
                                        <div className="col-6">
                                            <label className="form-label text-muted small fw-bold text-uppercase">Blood Group</label>
                                            {isEditing ?
                                                <input name="blood_group" className="form-control bg-light border-0 py-2 rounded-3" value={formData.blood_group} onChange={handleChange} /> :
                                                <div><span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill px-3 py-2 fs-6">{patient.blood_group}</span></div>
                                            }
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label text-muted small fw-bold text-uppercase">Insurance No.</label>
                                            {isEditing ?
                                                <input name="insurance_number" className="form-control bg-light border-0 py-2 rounded-3" value={formData.insurance_number} onChange={handleChange} /> :
                                                <div className="d-flex align-items-center gap-2">
                                                    <Shield size={16} className="text-success" />
                                                    <p className="fw-medium text-dark mb-0">{patient.insurance_number || 'N/A'}</p>
                                                </div>
                                            }
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="form-label text-muted small fw-bold text-uppercase d-flex align-items-center gap-2">
                                            <FileText size={16} /> Medical History
                                        </label>
                                        {isEditing ?
                                            <textarea name="medical_history" className="form-control bg-light border-0 rounded-3 p-3" rows="6" value={formData.medical_history} onChange={handleChange}></textarea> :
                                            <div className="p-3 bg-light rounded-3 border-0 text-dark small" style={{ minHeight: '150px', lineHeight: '1.6' }}>
                                                {patient.medical_history || <span className="text-muted fst-italic">No significant medical history recorded.</span>}
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default PatientProfile;
