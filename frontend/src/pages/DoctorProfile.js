import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Edit2, Trash2, Save, X, User, Briefcase, Phone, MapPin, Activity } from 'lucide-react';

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
                    <div className="card-enterprise border-0 shadow-lg overflow-hidden">
                        {/* Header Banner */}
                        <div className="bg-primary bg-opacity-10 p-4 border-bottom border-primary border-opacity-10">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-4">
                                    <div className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: 80, height: 80, fontSize: '2rem' }}>
                                        {doctor.first_name.charAt(0)}{doctor.last_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="fw-bold text-dark mb-1">Dr. {doctor.first_name} {doctor.last_name}</h2>
                                        <p className="text-muted mb-0 d-flex align-items-center gap-2">
                                            <Briefcase size={16} /> {doctor.specialization} • {doctor.department}
                                        </p>
                                    </div>
                                </div>
                                {isAdmin && (
                                    <div className="d-flex gap-2">
                                        {!isEditing ? (
                                            <>
                                                <button className="btn btn-white text-danger border shadow-sm" onClick={handleDeactivate}>
                                                    <Trash2 size={18} />
                                                </button>
                                                <button className="btn btn-primary shadow-sm d-flex align-items-center gap-2" onClick={() => setIsEditing(true)}>
                                                    <Edit2 size={18} /> Edit Profile
                                                </button>
                                            </>
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
                                )}
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="row g-5">
                                {/* Professional Section */}
                                <div className="col-md-6">
                                    <h5 className="d-flex align-items-center gap-2 text-primary fw-bold mb-4">
                                        <Activity size={20} /> Professional Details
                                    </h5>

                                    <div className="group mb-4">
                                        <label className="form-label text-muted small fw-bold">Specialization</label>
                                        {isEditing ?
                                            <input name="specialization" className="form-control bg-light border-0" value={formData.specialization} onChange={handleChange} /> :
                                            <p className="fw-medium text-dark">{doctor.specialization}</p>
                                        }
                                    </div>

                                    <div className="group mb-4">
                                        <label className="form-label text-muted small fw-bold">Department</label>
                                        {isEditing ?
                                            <input name="department" className="form-control bg-light border-0" value={formData.department} onChange={handleChange} /> :
                                            <p className="fw-medium text-dark">{doctor.department}</p>
                                        }
                                    </div>

                                    <div className="group mb-4">
                                        <label className="form-label text-muted small fw-bold">Qualification</label>
                                        {isEditing ?
                                            <input name="qualification" className="form-control bg-light border-0" value={formData.qualification} onChange={handleChange} /> :
                                            <p className="fw-medium text-dark">{doctor.qualification}</p>
                                        }
                                    </div>

                                    <div className="group">
                                        <label className="form-label text-muted small fw-bold">Experience (Years)</label>
                                        {isEditing ?
                                            <input type="number" name="years_of_experience" className="form-control bg-light border-0" value={formData.years_of_experience} onChange={handleChange} /> :
                                            <p className="fw-medium text-dark">{doctor.years_of_experience} Years</p>
                                        }
                                    </div>
                                </div>

                                {/* Contact Section */}
                                <div className="col-md-6">
                                    <h5 className="d-flex align-items-center gap-2 text-primary fw-bold mb-4">
                                        <Phone size={20} /> Contact & Status
                                    </h5>

                                    <div className="group mb-4">
                                        <label className="form-label text-muted small fw-bold">Email</label>
                                        <p className="fw-medium text-dark">{doctor.email}</p>
                                    </div>

                                    <div className="group mb-4">
                                        <label className="form-label text-muted small fw-bold">Phone</label>
                                        {isEditing ?
                                            <input name="phone" className="form-control bg-light border-0" value={formData.phone} onChange={handleChange} /> :
                                            <p className="fw-medium text-dark">{doctor.phone}</p>
                                        }
                                    </div>

                                    <div className="group mb-4">
                                        <label className="form-label text-muted small fw-bold">Address</label>
                                        {isEditing ?
                                            <input name="address" className="form-control bg-light border-0" value={formData.address} onChange={handleChange} /> :
                                            <p className="fw-medium text-dark">{doctor.address}</p>
                                        }
                                    </div>

                                    {isAdmin && (
                                        <div className="group">
                                            <label className="form-label text-muted small fw-bold">Status</label>
                                            {isEditing ? (
                                                <select name="user_status" className="form-select bg-light border-0" value={formData.user_status} onChange={handleChange}>
                                                    <option value="Active">Active</option>
                                                    <option value="Inactive">Inactive</option>
                                                </select>
                                            ) : (
                                                <div>
                                                    <span className={`badge ${doctor.user_status === 'Active' ? 'bg-success' : 'bg-danger'} bg-opacity-25 text-${doctor.user_status === 'Active' ? 'success' : 'danger'} border border-${doctor.user_status === 'Active' ? 'success' : 'danger'} px-3 py-2 rounded-pill`}>
                                                        {doctor.user_status}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;
