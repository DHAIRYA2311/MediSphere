import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Edit2, Trash2, Save, X, User, Briefcase, Phone, MapPin, Activity, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const DoctorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [doctor, setDoctor] = useState(null);
    const [formData, setFormData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const res = await api.get(`doctors/get.php?id=${id}`);
                if (res.status === 'success') {
                    setDoctor(res.data);
                    setFormData(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch doctor", error);
            }
        };
        fetchDoctor();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.post('doctors/update.php', formData);
            if (res.status === 'success') {
                setDoctor(formData);
                setIsEditing(false);
            } else {
                alert(res.message);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async () => {
        if (window.confirm('Are you sure you want to deactivate this doctor? They will not be able to login.')) {
            const res = await api.post('doctors/delete.php', { doctor_id: id });
            if (res.status === 'success') {
                navigate('/doctors');
            } else {
                alert(res.message);
            }
        }
    };

    if (!doctor) return <div className="text-center py-5">Loading...</div>;

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
                        <div className="p-5 border-bottom" style={{ background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)' }}>
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
                                <div className="d-flex align-items-center gap-4">
                                    <div className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center fw-bold shadow-lg" style={{ width: 100, height: 100, fontSize: '2.5rem' }}>
                                        {doctor.first_name.charAt(0)}{doctor.last_name.charAt(0)}
                                    </div>
                                    <div className="text-white text-center text-md-start">
                                        <h2 className="fw-bold mb-1">Dr. {doctor.first_name} {doctor.last_name}</h2>
                                        <p className="mb-0 opacity-75 d-flex align-items-center gap-2 justify-content-center justify-content-md-start">
                                            <Briefcase size={18} /> {doctor.specialization} • {doctor.department}
                                        </p>
                                    </div>
                                </div>
                                {isAdmin && (
                                    <div className="d-flex gap-2">
                                        {!isEditing ? (
                                            <>
                                                <button className="btn btn-light text-danger shadow-sm d-flex align-items-center gap-2 px-3 rounded-pill" onClick={handleDeactivate}>
                                                    <Trash2 size={18} /> <span className="d-none d-md-inline">Deactivate</span>
                                                </button>
                                                <button className="btn btn-light text-primary shadow-sm d-flex align-items-center gap-2 px-4 rounded-pill fw-bold" onClick={() => setIsEditing(true)}>
                                                    <Edit2 size={18} /> Edit Profile
                                                </button>
                                            </>
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
                                )}
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="row g-5">
                                {/* Professional Section */}
                                <div className="col-md-6">
                                    <h5 className="d-flex align-items-center gap-2 text-primary fw-bold mb-4 border-bottom pb-2">
                                        <Activity size={20} /> Professional Details
                                    </h5>

                                    <div className="group mb-4">
                                        <label className="form-label text-muted small fw-bold text-uppercase">Specialization</label>
                                        {isEditing ?
                                            <input name="specialization" className="form-control bg-light border-0 py-2 rounded-3" value={formData.specialization} onChange={handleChange} /> :
                                            <p className="fw-bold text-dark fs-5 mb-0">{doctor.specialization}</p>
                                        }
                                    </div>

                                    <div className="group mb-4">
                                        <label className="form-label text-muted small fw-bold text-uppercase">Department</label>
                                        {isEditing ?
                                            <input name="department" className="form-control bg-light border-0 py-2 rounded-3" value={formData.department} onChange={handleChange} /> :
                                            <p className="fw-medium text-dark mb-0">{doctor.department}</p>
                                        }
                                    </div>

                                    <div className="group mb-4">
                                        <label className="form-label text-muted small fw-bold text-uppercase">Qualification</label>
                                        {isEditing ?
                                            <input name="qualification" className="form-control bg-light border-0 py-2 rounded-3" value={formData.qualification} onChange={handleChange} /> :
                                            <p className="fw-medium text-dark mb-0">{doctor.qualification}</p>
                                        }
                                    </div>

                                    <div className="group">
                                        <label className="form-label text-muted small fw-bold text-uppercase">Experience</label>
                                        {isEditing ?
                                            <input type="number" name="years_of_experience" className="form-control bg-light border-0 py-2 rounded-3" value={formData.years_of_experience} onChange={handleChange} /> :
                                            <p className="fw-medium text-dark mb-0">{doctor.years_of_experience} Years</p>
                                        }
                                    </div>
                                </div>

                                {/* Contact Section */}
                                <div className="col-md-6">
                                    <h5 className="d-flex align-items-center gap-2 text-primary fw-bold mb-4 border-bottom pb-2">
                                        <Phone size={20} /> Contact & Status
                                    </h5>

                                    <div className="group mb-4">
                                        <label className="form-label text-muted small fw-bold text-uppercase">Email Address</label>
                                        <div className="d-flex align-items-center gap-2">
                                            <Mail size={16} className="text-secondary" />
                                            <p className="fw-medium text-dark mb-0">{doctor.email}</p>
                                        </div>
                                    </div>

                                    <div className="group mb-4">
                                        <label className="form-label text-muted small fw-bold text-uppercase">Phone Number</label>
                                        {isEditing ?
                                            <input name="phone" className="form-control bg-light border-0 py-2 rounded-3" value={formData.phone} onChange={handleChange} /> :
                                            <p className="fw-medium text-dark mb-0">{doctor.phone}</p>
                                        }
                                    </div>

                                    <div className="group mb-4">
                                        <label className="form-label text-muted small fw-bold text-uppercase">Address</label>
                                        {isEditing ?
                                            <input name="address" className="form-control bg-light border-0 py-2 rounded-3" value={formData.address} onChange={handleChange} /> :
                                            <p className="fw-medium text-dark mb-0">{doctor.address}</p>
                                        }
                                    </div>

                                    {isAdmin && (
                                        <div className="group pt-3">
                                            <label className="form-label text-muted small fw-bold text-uppercase d-block mb-2">Account Status</label>
                                            {isEditing ? (
                                                <select name="user_status" className="form-select bg-light border-0 py-2 rounded-3" value={formData.user_status} onChange={handleChange}>
                                                    <option value="Active">Active</option>
                                                    <option value="Inactive">Inactive</option>
                                                </select>
                                            ) : (
                                                <span className={`badge ${doctor.user_status === 'Active' ? 'bg-success' : 'bg-danger'} bg-opacity-10 text-${doctor.user_status === 'Active' ? 'success' : 'danger'} border border-${doctor.user_status === 'Active' ? 'success' : 'danger'} border-opacity-25 px-4 py-2 rounded-pill`}>
                                                    {doctor.user_status}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;
