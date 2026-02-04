import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Edit2, Save, X, User, Activity, HeartPulse, Shield, FileText } from 'lucide-react';
import Skeleton from '../components/Skeleton';

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
        <div className="container py-5">
            <div className="card-enterprise p-5 border-0 shadow-sm">
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
                    <div className="card-enterprise border-0 shadow-lg overflow-hidden">
                        {/* Header Banner */}
                        <div className="bg-success bg-opacity-10 p-4 border-bottom border-success border-opacity-10">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-4">
                                    <div className="rounded-circle bg-white text-success d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: 80, height: 80, fontSize: '2rem' }}>
                                        {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="fw-bold text-dark mb-1">{patient.first_name} {patient.last_name}</h2>
                                        <p className="text-muted mb-0 d-flex align-items-center gap-2">
                                            <Shield size={16} /> ID: #{patient.patient_id} • Insurance: {patient.insurance_number || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="d-flex gap-2">
                                    {!isEditing ? (
                                        <button className="btn btn-primary shadow-sm d-flex align-items-center gap-2" onClick={() => setIsEditing(true)}>
                                            <Edit2 size={18} /> Edit Profile
                                        </button>
                                    ) : (
                                        <>
                                            <button className="btn btn-light" onClick={() => setIsEditing(false)}>
                                                <X size={18} /> Cancel
                                            </button>
                                            <button className="btn btn-success d-flex align-items-center gap-2" onClick={handleSave} disabled={saving}>
                                                {saving ? <span className="spinner-border spinner-border-sm"></span> : <Save size={18} />} Save
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
                                    <h5 className="d-flex align-items-center gap-2 text-success fw-bold mb-4">
                                        <User size={20} /> Personal Info
                                    </h5>

                                    <div className="group mb-4">
                                        <label className="form-label text-muted small fw-bold">Email</label>
                                        <p className="fw-medium text-dark">{patient.email}</p>
                                    </div>

                                    <div className="group mb-4">
                                        <label className="form-label text-muted small fw-bold">Phone</label>
                                        {isEditing ?
                                            <input name="phone" className="form-control bg-light border-0" value={formData.phone} onChange={handleChange} /> :
                                            <p className="fw-medium text-dark">{patient.phone}</p>
                                        }
                                    </div>

                                    <div className="group mb-4">
                                        <label className="form-label text-muted small fw-bold">Address</label>
                                        {isEditing ?
                                            <input name="address" className="form-control bg-light border-0" value={formData.address} onChange={handleChange} /> :
                                            <p className="fw-medium text-dark">{patient.address}</p>
                                        }
                                    </div>

                                    <div className="group">
                                        <label className="form-label text-muted small fw-bold">Emergency Contact</label>
                                        {isEditing ?
                                            <input name="emergency_contact" className="form-control bg-light border-0" value={formData.emergency_contact} onChange={handleChange} /> :
                                            <p className="fw-medium text-danger">{patient.emergency_contact || 'N/A'}</p>
                                        }
                                    </div>
                                </div>

                                {/* Medical Section */}
                                <div className="col-md-6">
                                    <h5 className="d-flex align-items-center gap-2 text-danger fw-bold mb-4">
                                        <HeartPulse size={20} /> Medical Details
                                    </h5>

                                    <div className="row mb-4">
                                        <div className="col-6">
                                            <label className="form-label text-muted small fw-bold">Blood Group</label>
                                            {isEditing ?
                                                <input name="blood_group" className="form-control bg-light border-0" value={formData.blood_group} onChange={handleChange} /> :
                                                <div><span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill px-3 py-2">{patient.blood_group}</span></div>
                                            }
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label text-muted small fw-bold">Insurance #</label>
                                            {isEditing ?
                                                <input name="insurance_number" className="form-control bg-light border-0" value={formData.insurance_number} onChange={handleChange} /> :
                                                <p className="fw-medium text-dark">{patient.insurance_number}</p>
                                            }
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="form-label text-muted small fw-bold d-flex align-items-center gap-2">
                                            <FileText size={16} /> Medical History / Notes
                                        </label>
                                        {isEditing ?
                                            <textarea name="medical_history" className="form-control bg-light border-0" rows="5" value={formData.medical_history} onChange={handleChange}></textarea> :
                                            <div className="p-3 bg-light rounded border-0 text-dark small" style={{ minHeight: '120px' }}>
                                                {patient.medical_history || 'No significant medical history recorded.'}
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientProfile;
