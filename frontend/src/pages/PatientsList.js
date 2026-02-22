import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { TableSkeleton } from '../components/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumSelect from '../components/PremiumSelect';

const PatientsList = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        patient_id: '',
        first_name: '',
        last_name: '',
        phone: '',
        address: '',
        blood_group: '',
        emergency_contact: '',
        insurance_number: '',
        medical_history: ''
    });

    const navigate = useNavigate();

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const res = await api.get('patients/list.php');
            if (res.status === 'success') {
                setPatients(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const handleDelete = async (patient) => {
        if (window.confirm(`Are you sure you want to delete patient ${patient.first_name} ${patient.last_name}? This will also delete their user account.`)) {
            try {
                const res = await api.get(`patients/delete.php?id=${patient.patient_id}`);
                if (res.status === 'success') {
                    fetchPatients();
                } else {
                    alert(res.message);
                }
            } catch (err) {
                console.error(err);
                alert("Failed to delete patient");
            }
        }
    };

    const openEditModal = (patient) => {
        setEditingPatient(patient);
        setFormData({
            patient_id: patient.patient_id,
            first_name: patient.first_name,
            last_name: patient.last_name,
            phone: patient.phone,
            address: patient.address || '',
            blood_group: patient.blood_group || '',
            emergency_contact: patient.emergency_contact || '',
            insurance_number: patient.insurance_number || '',
            medical_history: patient.medical_history || ''
        });
        setIsModalOpen(true);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.post('patients/update.php', formData);
            if (res.status === 'success') {
                setIsModalOpen(false);
                fetchPatients();
            } else {
                alert(res.message);
            }
        } catch (err) {
            console.error(err);
            alert("Update failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = [
        {
            key: 'first_name',
            label: 'Patient Name',
            sortable: true,
            render: (row) => (
                <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40 }}>
                        {row.first_name.charAt(0)}
                    </div>
                    <div>
                        <div className="fw-semibold text-dark">{row.first_name} {row.last_name}</div>
                        <div className="small text-muted">{row.email}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'phone',
            label: 'Contact',
            render: (row) => (
                <div>
                    <div className="text-dark">{row.phone}</div>
                    {row.emergency_contact && row.emergency_contact !== 'N/A' && (
                        <div className="small text-danger">Emerg: {row.emergency_contact}</div>
                    )}
                </div>
            )
        },
        {
            key: 'gender',
            label: 'Gender / Age',
            render: (row) => (
                <div>
                    <span className="text-capitalize">{row.gender}</span>
                    <div className="small text-muted">{row.dob}</div>
                </div>
            )
        },
        {
            key: 'blood_group',
            label: 'Blood Group',
            sortable: true,
            render: (row) => (
                <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill px-3">
                    {row.blood_group || 'N/A'}
                </span>
            )
        }
    ];

    const actions = [
        {
            label: 'View Profile',
            icon: Eye,
            onClick: (row) => navigate(`/patients/${row.patient_id}`)
        },
        {
            label: 'Edit Info',
            icon: Edit,
            onClick: (row) => openEditModal(row)
        },
        {
            label: 'Delete Patient',
            icon: Trash2,
            className: 'text-danger',
            onClick: (row) => handleDelete(row)
        }
    ];

    return (
        <div className="container-fluid py-4 fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark">Patient Management</h2>
                    <p className="text-muted">View records, history, and contact info</p>
                </div>
            </div>

            {loading ? (
                <TableSkeleton rows={10} cols={4} />
            ) : (
                <DataTable
                    title="All Patients"
                    columns={columns}
                    data={patients}
                    actions={actions}
                    keyField="patient_id"
                />
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="modal-dialog modal-lg modal-dialog-centered"
                        >
                            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                                <div className="modal-header border-bottom-0 bg-light p-4">
                                    <h5 className="modal-title fw-bold text-dark">Edit Patient Profile</h5>
                                    <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <form onSubmit={handleSubmit}>
                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted text-uppercase">First Name</label>
                                                <input name="first_name" className="form-control bg-light border-0 py-2" value={formData.first_name} onChange={handleChange} disabled />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted text-uppercase">Last Name</label>
                                                <input name="last_name" className="form-control bg-light border-0 py-2" value={formData.last_name} onChange={handleChange} disabled />
                                            </div>
                                        </div>

                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted text-uppercase">Phone</label>
                                                <input name="phone" className="form-control bg-light border-0 py-2" value={formData.phone} onChange={handleChange} required />
                                            </div>
                                            <div className="col-md-6 d-flex flex-column">
                                                <PremiumSelect
                                                    label="Blood Group"
                                                    name="blood_group"
                                                    value={formData.blood_group}
                                                    onChange={handleChange}
                                                    options={[
                                                        { value: 'A+', label: 'A+' },
                                                        { value: 'A-', label: 'A-' },
                                                        { value: 'B+', label: 'B+' },
                                                        { value: 'B-', label: 'B-' },
                                                        { value: 'O+', label: 'O+' },
                                                        { value: 'O-', label: 'O-' },
                                                        { value: 'AB+', label: 'AB+' },
                                                        { value: 'AB-', label: 'AB-' }
                                                    ]}
                                                />
                                            </div>
                                        </div>

                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted text-uppercase">Emergency Contact</label>
                                                <input name="emergency_contact" className="form-control bg-light border-0 py-2" value={formData.emergency_contact} onChange={handleChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted text-uppercase">Insurance No.</label>
                                                <input name="insurance_number" className="form-control bg-light border-0 py-2" value={formData.insurance_number} onChange={handleChange} />
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted text-uppercase">Address</label>
                                            <textarea name="address" className="form-control bg-light border-0 py-2" value={formData.address} onChange={handleChange} rows="2"></textarea>
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label small fw-bold text-muted text-uppercase">Medical History</label>
                                            <textarea name="medical_history" className="form-control bg-light border-0 py-2" value={formData.medical_history} onChange={handleChange} rows="3"></textarea>
                                        </div>

                                        <div className="d-flex justify-content-end gap-2">
                                            <button type="button" className="btn btn-light px-4" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                            <button type="submit" className="btn btn-primary px-4 shadow-sm" disabled={isSubmitting}>
                                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PatientsList;
