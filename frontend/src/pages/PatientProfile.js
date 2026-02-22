import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import {
    Edit2, Save, X, User, Activity, HeartPulse, Shield, FileText,
    Calendar, Clipboard, CreditCard, Brain, Folder, AlertCircle,
    ChevronRight, MapPin, Phone, Mail
} from 'lucide-react';
import { TableSkeleton } from '../components/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import QuickAppointmentModal from '../components/QuickAppointmentModal';

const PatientProfile = () => {
    const { id } = useParams();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({});
    const [activeTab, setActiveTab] = useState('Overview');
    const [isBookingOpen, setIsBookingOpen] = useState(false);

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

    const calculateAge = (dob) => {
        if (!dob) return 'N/A';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

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

    const tabs = [
        { id: 'Overview', icon: User },
        { id: 'Medical History', icon: Activity },
        { id: 'Appointments', icon: Calendar },
        { id: 'Reports', icon: Clipboard },
        { id: 'Billing', icon: CreditCard },
        { id: 'Insurance', icon: Shield },
        { id: 'AI Insights', icon: Brain },
        { id: 'Documents', icon: Folder },
    ];

    if (loading) return (
        <div className="container py-5">
            <div className="card border-0 shadow-sm p-4">
                <TableSkeleton rows={8} cols={4} />
            </div>
        </div>
    );

    if (!patient) return <div className="text-center py-5 text-muted">Patient not found.</div>;

    const age = calculateAge(patient.dob);
    const riskLevel = patient.medical_history?.length > 50 ? 'Moderate' : 'Low';

    return (
        <div className="container-fluid py-4 fade-in px-3 px-md-4">
            {/* Profile Header */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white mx-auto" style={{ maxWidth: '1400px' }}>
                <div className="p-4 p-lg-5 position-relative">
                    {/* Background Accent */}
                    <div className="position-absolute top-0 start-0 w-100 h-25 bg-primary bg-opacity-10"></div>

                    <div className="d-flex flex-column flex-lg-row align-items-center gap-4 position-relative z-1">
                        {/* Photo */}
                        <div className="position-relative">
                            <div className="rounded-circle bg-white shadow-sm border border-5 border-white d-flex align-items-center justify-content-center fw-bold text-primary overflow-hidden"
                                style={{ width: 120, height: 120, fontSize: '3rem' }}>
                                {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
                            </div>
                            <div className="position-absolute bottom-0 end-0 bg-success border border-3 border-white rounded-circle p-2 shadow-sm" style={{ width: 24, height: 24 }}></div>
                        </div>

                        {/* Name & Basic Info */}
                        <div className="text-center text-lg-start flex-grow-1">
                            <div className="d-flex flex-column flex-lg-row align-items-center gap-2 mb-2">
                                <h1 className="fw-bold text-dark mb-0">{patient.first_name} {patient.last_name}</h1>
                                <span className="badge bg-light text-muted border px-3 py-2 rounded-pill small">Patient ID: #{patient.patient_id}</span>
                            </div>

                            <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-2 mt-3">
                                <div className="d-flex align-items-center gap-2 text-muted px-2 py-1 bg-light rounded-pill small">
                                    <Activity size={14} className="text-primary" />
                                    <span>Age: <strong>{age}</strong></span>
                                </div>
                                <div className="d-flex align-items-center gap-2 text-muted px-2 py-1 bg-light rounded-pill small">
                                    <HeartPulse size={14} className="text-danger" />
                                    <span>Blood: <strong className="text-danger">{patient.blood_group || 'N/A'}</strong></span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <span className={`badge ${riskLevel === 'Low' ? 'bg-success' : 'bg-warning'} bg-opacity-10 ${riskLevel === 'Low' ? 'text-success' : 'text-warning'} border px-2 py-1 rounded-pill d-flex align-items-center gap-1 small`}>
                                        <AlertCircle size={12} /> {riskLevel} Risk
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="d-flex gap-2">
                            {!isEditing ? (
                                <button className="btn btn-primary px-3 py-2 rounded-pill shadow-sm d-flex align-items-center gap-2 small" onClick={() => setIsEditing(true)}>
                                    <Edit2 size={16} /> Edit Profile
                                </button>
                            ) : (
                                <div className="d-flex gap-1">
                                    <button className="btn btn-light px-3 py-2 rounded-pill small" onClick={() => setIsEditing(false)}>
                                        <X size={16} />
                                    </button>
                                    <button className="btn btn-success px-3 py-2 rounded-pill shadow-sm d-flex align-items-center gap-2 small" onClick={handleSave} disabled={saving}>
                                        {saving ? <span className="spinner-border spinner-border-sm"></span> : <Save size={16} />} Save
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-top bg-light bg-opacity-50 overflow-hidden">
                    <div className="d-flex overflow-auto no-scrollbar gap-0 position-relative">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`btn border-0 py-3 px-2 px-md-3 position-relative rounded-0 fw-semibold transition-all d-flex align-items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'text-primary' : 'text-muted'
                                    }`}
                                style={{ fontSize: '0.8rem' }}
                            >
                                <tab.icon size={16} />
                                <span>{tab.id === 'Medical History' ? 'History' : tab.id}</span>
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="tab-underline"
                                        className="position-absolute bottom-0 start-0 w-100 bg-primary"
                                        style={{ height: 3 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="row">
                <div className="col-lg-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-4 shadow-sm p-4 p-lg-5"
                        >
                            {activeTab === 'Overview' && (
                                <div className="row g-4">
                                    <div className="col-md-4 lg-border-end">
                                        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                            <User size={20} className="text-primary" /> Basic Identity
                                        </h5>
                                        <div className="d-flex flex-column gap-3">
                                            <div>
                                                <label className="small fw-bold text-muted text-uppercase mb-1 d-block">Full Name</label>
                                                <div className="bg-light p-2 rounded-3 small">{patient.first_name} {patient.last_name}</div>
                                            </div>
                                            <div className="row g-2">
                                                <div className="col-6">
                                                    <label className="small fw-bold text-muted text-uppercase mb-1 d-block">Gender</label>
                                                    <div className="bg-light p-2 rounded-3 small">{patient.gender}</div>
                                                </div>
                                                <div className="col-6">
                                                    <label className="small fw-bold text-muted text-uppercase mb-1 d-block">Status</label>
                                                    <div className={`badge ${patient.status === 'Active' ? 'bg-success' : 'bg-secondary'} bg-opacity-10 ${patient.status === 'Active' ? 'text-success' : 'text-secondary'} p-2 rounded-3 small w-100`}>{patient.status}</div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="small fw-bold text-muted text-uppercase mb-1 d-block">Email Address</label>
                                                <div className="d-flex align-items-center gap-2 bg-light p-2 rounded-3 small overflow-hidden">
                                                    <Mail size={14} className="text-muted flex-shrink-0" /> {patient.email}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="small fw-bold text-muted text-uppercase mb-1 d-block">Phone Number</label>
                                                {isEditing ? (
                                                    <input name="phone" className="form-control bg-light border-0 p-2 rounded-3 small" value={formData.phone || ''} onChange={handleChange} />
                                                ) : (
                                                    <div className="d-flex align-items-center gap-2 bg-light p-2 rounded-3 small">
                                                        <Phone size={14} className="text-muted" /> {patient.phone}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="small fw-bold text-muted text-uppercase mb-1 d-block">Registered On</label>
                                                <div className="bg-light p-2 rounded-3 small">{new Date(patient.created_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4 lg-border-end">
                                        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                            <Activity size={20} className="text-primary" /> Medical Basics
                                        </h5>
                                        <div className="d-flex flex-column gap-3">
                                            <div>
                                                <label className="small fw-bold text-muted text-uppercase mb-1 d-block">Blood Group</label>
                                                {isEditing ? (
                                                    <input name="blood_group" className="form-control bg-light border-0 p-2 rounded-3 small text-danger fw-bold" value={formData.blood_group || ''} onChange={handleChange} />
                                                ) : (
                                                    <div className="bg-light p-2 rounded-3 small text-danger fw-bold">{patient.blood_group}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="small fw-bold text-muted text-uppercase mb-1 d-block">Residential Address</label>
                                                {isEditing ? (
                                                    <textarea name="address" className="form-control bg-light border-0 p-2 rounded-3 small" value={formData.address || ''} onChange={handleChange} rows="2" />
                                                ) : (
                                                    <div className="bg-light p-2 rounded-3 small" style={{ minHeight: '60px' }}>{patient.address || 'No address provided'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="small fw-bold text-muted text-uppercase mb-1 d-block">Emergency Contact</label>
                                                {isEditing ? (
                                                    <input name="emergency_contact" className="form-control bg-light border-0 p-2 rounded-3 small" value={formData.emergency_contact || ''} onChange={handleChange} />
                                                ) : (
                                                    <div className="bg-light p-2 rounded-3 small d-flex align-items-center justify-content-between">
                                                        <span>{patient.emergency_contact || 'N/A'}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="small fw-bold text-muted text-uppercase mb-1 d-block">Insurance Number</label>
                                                {isEditing ? (
                                                    <input name="insurance_number" className="form-control bg-light border-0 p-2 rounded-3 small font-monospace" value={formData.insurance_number || ''} onChange={handleChange} />
                                                ) : (
                                                    <div className="bg-light p-2 rounded-3 small font-monospace">{patient.insurance_number || 'N/A'}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                            <HeartPulse size={20} className="text-primary" /> Admission Info
                                        </h5>
                                        {patient.admission ? (
                                            <div className="d-flex flex-column gap-3">
                                                <div className="p-3 rounded-4 border border-primary border-opacity-10 bg-primary bg-opacity-5">
                                                    <div className="small fw-bold text-primary text-uppercase mb-2">Current Stay</div>
                                                    <div className="h4 fw-black mb-1">{patient.admission.ward_name}</div>
                                                    <div className="small text-muted mb-3">Bed No: <strong className="text-dark">{patient.admission.bed_number}</strong></div>

                                                    <div className="d-flex justify-content-between border-top pt-2 mt-2">
                                                        <div>
                                                            <div className="smaller text-muted text-uppercase">Allocated</div>
                                                            <div className="small fw-bold">{patient.admission.allocation_date}</div>
                                                        </div>
                                                        <div className="text-end">
                                                            <div className="smaller text-muted text-uppercase">Release</div>
                                                            <div className="small fw-bold">{patient.admission.release_date || 'Ongoing'}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`badge ${patient.admission.bed_status === 'Occupied' ? 'bg-primary' : 'bg-success'} p-2 rounded-pill`}>
                                                    Bed Status: {patient.admission.bed_status}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-100 d-flex flex-column align-items-center justify-content-center py-4 bg-light rounded-4 opacity-75">
                                                <Shield size={32} className="text-muted mb-2" />
                                                <div className="small text-muted fw-bold">Not Admitted</div>
                                                <div className="smaller text-muted">No active bed allocation.</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Medical History' && (
                                <div>
                                    <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                        <FileText size={20} className="text-primary" /> Past Conditions & Notes
                                    </h5>
                                    {isEditing ? (
                                        <textarea name="medical_history" className="form-control bg-light border-0 p-3 rounded-3 shadow-inner"
                                            value={formData.medical_history} onChange={handleChange} rows="10"
                                            placeholder="Enter detailed medical history, allergies, chronic conditions..."
                                        />
                                    ) : (
                                        <div className="bg-light p-4 rounded-4 border-start border-4 border-primary" style={{ whiteSpace: 'pre-wrap' }}>
                                            {patient.medical_history || 'No medical history records found for this patient.'}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                                        <Calendar size={20} className="text-primary" /> Appointment History
                                    </h5>
                                    <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => setIsBookingOpen(true)}>New Appointment</button>
                                </div>
                                {patient.appointments?.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th className="border-0 px-4 py-3 small text-uppercase fw-bold text-muted">Date & Time</th>
                                                    <th className="border-0 px-4 py-3 small text-uppercase fw-bold text-muted">Doctor ID</th>
                                                    <th className="border-0 px-4 py-3 small text-uppercase fw-bold text-muted">Notes</th>
                                                    <th className="border-0 px-4 py-3 small text-uppercase fw-bold text-muted text-end">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {patient.appointments.map((apt, i) => (
                                                    <tr key={i}>
                                                        <td className="px-4">
                                                            <div className="fw-bold">{apt.appointment_date}</div>
                                                            <div className="small text-muted">{apt.appointment_time}</div>
                                                        </td>
                                                        <td className="px-4 small">#{apt.doctor_id}</td>
                                                        <td className="px-4 small text-truncate" style={{ maxWidth: '200px' }}>{apt.notes}</td>
                                                        <td className="px-4 text-end">
                                                            <span className={`badge ${apt.status === 'Completed' ? 'bg-success' : apt.status === 'Pending' ? 'bg-warning' : 'bg-primary'} bg-opacity-10 ${apt.status === 'Completed' ? 'text-success' : apt.status === 'Pending' ? 'text-warning' : 'text-primary'} px-3 py-2 rounded-pill`}>
                                                                {apt.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <Calendar size={48} className="text-muted opacity-25 mb-3" />
                                        <h6 className="fw-bold text-muted text-uppercase">No Appointments Found</h6>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                    <Clipboard size={20} className="text-primary" /> Medical Reports
                                </h5>
                                {patient.reports?.length > 0 ? (
                                    <div className="row g-3">
                                        {patient.reports.map((rpt, i) => (
                                            <div className="col-md-6" key={i}>
                                                <div className="p-3 rounded-4 border bg-light bg-opacity-50 d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <div className="fw-bold">{rpt.report_type}</div>
                                                        <div className="smaller text-muted">{new Date(rpt.created_at).toLocaleDateString()}</div>
                                                    </div>
                                                    <a href={rpt.report_file} className="btn btn-sm btn-outline-primary" target="_blank" rel="noreferrer">View File</a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-5 opacity-50">
                                        <Clipboard size={48} className="mb-3" />
                                        <div>No medical reports uploaded yet.</div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h5 className="fw-bold mb-4 text-primary d-flex align-items-center gap-2">
                                    <CreditCard size={20} /> Billing History
                                </h5>
                                {patient.billing?.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table align-middle">
                                            <thead>
                                                <tr className="small text-muted text-uppercase">
                                                    <th className="px-0">Date</th>
                                                    <th>Bill ID</th>
                                                    <th>Total</th>
                                                    <th>Paid</th>
                                                    <th className="text-end">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {patient.billing.map((bill, i) => (
                                                    <tr key={i}>
                                                        <td className="px-0 small">{bill.payment_date}</td>
                                                        <td className="fw-bold small">BILL#{bill.bill_id}</td>
                                                        <td className="small fw-bold">₹{bill.total_amount}</td>
                                                        <td className="small text-success">₹{bill.paid_amount}</td>
                                                        <td className="text-end">
                                                            <span className={`badge ${bill.payment_status === 'Paid' ? 'bg-success' : 'bg-warning'} bg-opacity-10 ${bill.payment_status === 'Paid' ? 'text-success' : 'text-warning'} rounded-pill`}>{bill.payment_status}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-5 text-muted">No billing records found.</div>
                                )}
                            </div>

                            <div>
                                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                    <Shield size={20} className="text-primary" /> Insurance & Claims
                                </h5>
                                <div className="card border-0 bg-light p-4 rounded-4 mb-4">
                                    <label className="smaller fw-bold text-muted text-uppercase mb-1">Active Policy Number</label>
                                    <div className="h4 fw-black font-monospace mb-0">{patient.insurance_number || 'NONE'}</div>
                                </div>
                                {patient.insurance_claims?.length > 0 ? (
                                    <div className="d-flex flex-column gap-3">
                                        {patient.insurance_claims.map((cl, i) => (
                                            <div className="p-3 border rounded-4 d-flex justify-content-between align-items-center" key={i}>
                                                <div>
                                                    <div className="fw-bold">₹{cl.claim_amount} Claim</div>
                                                    <div className="smaller text-muted">Processed: {cl.processed_date}</div>
                                                </div>
                                                <span className={`badge ${cl.claim_status === 'Approved' ? 'bg-success' : 'bg-warning'} bg-opacity-10 ${cl.claim_status === 'Approved' ? 'text-success' : 'text-warning'} rounded-pill px-3 py-2`}>
                                                    {cl.claim_status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 bg-light bg-opacity-50 rounded-4">
                                        <Shield size={32} className="text-muted opacity-25 mb-2" />
                                        <div className="small text-muted">No insurance claims registered.</div>
                                    </div>
                                )}
                            </div>

                            <div className="d-flex flex-column gap-4">
                                <div className="bg-primary bg-opacity-5 p-4 p-md-5 rounded-4 border border-primary border-opacity-10">
                                    <div className="d-flex align-items-start gap-4">
                                        <div className="bg-primary bg-opacity-10 p-4 rounded-4 d-none d-md-block">
                                            <Brain size={48} className="text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="fw-bold text-primary">Disease Predictions</h4>
                                            <p className="text-muted smaller">Advanced neural models at work for your diagnostics.</p>
                                        </div>
                                    </div>
                                </div>

                                {patient.ai_predictions?.length > 0 ? (
                                    <div className="row g-4">
                                        {patient.ai_predictions.map((pred, i) => (
                                            <div className="col-md-6" key={i}>
                                                <div className="p-4 rounded-4 border border-primary border-opacity-10 bg-white">
                                                    <div className="d-flex justify-content-between mb-3">
                                                        <div className="smaller text-primary fw-black text-uppercase">Confidence: {pred.confidence_score}%</div>
                                                        <div className="smaller text-muted">{new Date(pred.created_at).toLocaleDateString()}</div>
                                                    </div>
                                                    <h3 className="fw-black text-dark mb-2">{pred.predicted_disease}</h3>
                                                    <div className="small text-muted mb-0">Symptoms: <span className="text-dark opacity-75">{pred.symptoms}</span></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-5 border rounded-4 border-dashed">
                                        <Brain size={42} className="text-muted opacity-25 mb-3" />
                                        <div className="text-muted small">No AI diagnosis found. Start by entering symptoms.</div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                    <Folder size={20} className="text-primary" /> Personal Repository
                                </h5>
                                {patient.documents?.length > 0 ? (
                                    <div className="row g-3">
                                        {patient.documents.map((doc, i) => (
                                            <div className="col-md-4" key={i}>
                                                <div className="card border p-3 rounded-4 h-100 shadow-sm border-light">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="p-2 bg-light rounded-3 text-primary"><FileText size={24} /></div>
                                                        <div className="overflow-hidden">
                                                            <div className="fw-bold small text-truncate">{doc.type}</div>
                                                            <a href={doc.file_path} className="smaller text-primary text-decoration-none" target="_blank" rel="noreferrer">Open Document</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-5 opacity-25">
                                        <Folder size={64} className="mb-3" />
                                        <div>Archive is empty.</div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Quick Booking Modal */}
            <QuickAppointmentModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                initialPatient={patient}
            />
        </div>
    );
};

export default PatientProfile;
