import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import { Edit, Plus, User, Moon, Sun, Camera, ScanFace } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StaffList = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [selectedStaffForFace, setSelectedStaffForFace] = useState(null);
    const [faceStatus, setFaceStatus] = useState(''); // '', 'loading', 'success', 'error'
    const [faceMessage, setFaceMessage] = useState('');

    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', phone: '',
        password: '', designation: 'Nurse', shift: 'Day', gender: 'Female', dob: '', address: ''
    });

    const SERVICE_URL = "http://localhost:5001";

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await api.get('staff/list.php');
            if (res.status === 'success') {
                setStaff(res.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (s = null) => {
        if (s) {
            setEditingStaff(s);
            setFormData({
                staff_id: s.staff_id,
                first_name: s.first_name,
                last_name: s.last_name,
                email: s.email,
                phone: s.phone,
                designation: s.designation,
                shift: s.shift,
                gender: s.gender || 'Female',
                address: s.address || ''
            });
        } else {
            setEditingStaff(null);
            setFormData({
                first_name: '', last_name: '', email: '', phone: '',
                password: '', designation: 'Nurse', shift: 'Day', gender: 'Female', dob: '', address: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleRegisterFaceClick = (s) => {
        setSelectedStaffForFace(s);
        setFaceStatus('');
        setFaceMessage('');
        setIsFaceModalOpen(true);
    };

    const handleRegisterFaceConfirm = async () => {
        if (!selectedStaffForFace) return;
        setFaceStatus('loading');
        setFaceMessage('Capturing face...');

        const fullName = `${selectedStaffForFace.first_name} ${selectedStaffForFace.last_name}`;

        try {
            const res = await fetch(`${SERVICE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: fullName })
            });
            const data = await res.json();

            if (data.status === 'success') {
                setFaceStatus('success');
                setFaceMessage(data.msg);
                // Close after delay
                setTimeout(() => setIsFaceModalOpen(false), 2000);
            } else {
                setFaceStatus('error');
                setFaceMessage(data.msg);
            }
        } catch (e) {
            setFaceStatus('error');
            setFaceMessage('Error connecting to Face Service');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.post('staff/manage.php', formData);
            if (res.status === 'success') {
                setIsModalOpen(false);
                fetchStaff();
            } else {
                alert(res.message);
            }
        } catch (error) {
            console.error("Submit failed", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = [
        {
            key: 'first_name',
            label: 'Staff Name',
            sortable: true,
            render: (row) => (
                <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40 }}>
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
            key: 'designation',
            label: 'Designation',
            sortable: true,
            render: (row) => (
                <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 rounded-pill px-3">
                    {row.designation}
                </span>
            )
        },
        {
            key: 'shift',
            label: 'Shift',
            sortable: true,
            render: (row) => (
                <div className="d-flex align-items-center gap-2">
                    {row.shift === 'Day' ? <Sun size={16} className="text-warning" /> : <Moon size={16} className="text-secondary" />}
                    <span>{row.shift}</span>
                </div>
            )
        },
        {
            key: 'phone',
            label: 'Contact',
            render: (row) => <div>{row.phone}</div>
        }
    ];

    const actions = [
        { label: 'Edit Staff', icon: Edit, onClick: openModal },
        { label: 'Register Face', icon: ScanFace, onClick: handleRegisterFaceClick, className: 'text-success' }
    ];

    return (
        <div className="container-fluid py-4 fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark">Staff Management</h2>
                    <p className="text-muted">Manage nurses, receptionists, and support staff</p>
                </div>
                <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => openModal()}>
                    <Plus size={18} /> Add Staff
                </button>
            </div>

            {loading ? (
                <div className="text-center py-5 text-muted">Loading staff...</div>
            ) : (
                <DataTable
                    title="Staff Directory"
                    columns={columns}
                    data={staff}
                    actions={actions}
                    keyField="staff_id"
                />
            )}

            {/* Edit/Add Staff Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="modal-dialog modal-dialog-centered modal-lg"
                        >
                            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                                <div className="modal-header border-bottom-0 bg-light p-4">
                                    <h5 className="modal-title fw-bold">{editingStaff ? 'Edit Staff' : 'Add New Staff'}</h5>
                                    <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <form onSubmit={handleSubmit}>
                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">First Name</label>
                                                <input name="first_name" className="form-control bg-light border-0" value={formData.first_name} onChange={handleChange} required />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Last Name</label>
                                                <input name="last_name" className="form-control bg-light border-0" value={formData.last_name} onChange={handleChange} required />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted">Email</label>
                                            <input type="email" name="email" className="form-control bg-light border-0" value={formData.email} onChange={handleChange} required />
                                        </div>
                                        {!editingStaff && (
                                            <div className="mb-3">
                                                <label className="form-label small fw-bold text-muted">Password</label>
                                                <input type="password" name="password" className="form-control bg-light border-0" value={formData.password} onChange={handleChange} required />
                                            </div>
                                        )}
                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Designation</label>
                                                <input name="designation" className="form-control bg-light border-0" value={formData.designation} onChange={handleChange} required placeholder="e.g. Nurse" />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Shift</label>
                                                <select name="shift" className="form-select bg-light border-0" value={formData.shift} onChange={handleChange}>
                                                    <option value="Day">Day</option>
                                                    <option value="Night">Night</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Phone</label>
                                                <input name="phone" className="form-control bg-light border-0" value={formData.phone} onChange={handleChange} required />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Gender</label>
                                                <select name="gender" className="form-select bg-light border-0" value={formData.gender} onChange={handleChange}>
                                                    <option value="Female">Female</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted">Address</label>
                                            <input name="address" className="form-control bg-light border-0" value={formData.address} onChange={handleChange} required />
                                        </div>
                                        <div className="d-flex justify-content-end gap-2 mt-4">
                                            <button type="button" className="btn btn-light" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                            <button type="submit" className="btn btn-primary px-4" disabled={isSubmitting}>
                                                {isSubmitting ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Saving...
                                                    </>
                                                ) : 'Save Staff'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Face Registration Modal */}
            <AnimatePresence>
                {isFaceModalOpen && (
                    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.8)' }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-dialog modal-dialog-centered"
                        >
                            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-dark text-white">
                                <div className="modal-header border-bottom-0 p-4">
                                    <div>
                                        <h5 className="modal-title fw-bold">Register Face</h5>
                                        <p className="mb-0 text-white-50 small">For {selectedStaffForFace?.first_name} {selectedStaffForFace?.last_name}</p>
                                    </div>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setIsFaceModalOpen(false)}></button>
                                </div>
                                <div className="modal-body p-0 text-center bg-black">
                                    <div style={{ minHeight: 300 }}>
                                        <img
                                            src={`${SERVICE_URL}/video_feed?t=${Date.now()}`}
                                            alt="Live Feed"
                                            style={{ width: '100%', height: 'auto', display: 'block' }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer border-top-0 p-4 justify-content-center flex-column">
                                    {faceStatus === 'error' && <div className="text-danger mb-3 small">{faceMessage}</div>}
                                    {faceStatus === 'success' && <div className="text-success mb-3 small fw-bold"><i className="bi bi-check-circle me-1"></i> {faceMessage}</div>}

                                    <button
                                        className="btn btn-primary rounded-pill px-5 py-2 fw-bold"
                                        onClick={handleRegisterFaceConfirm}
                                        disabled={faceStatus === 'loading' || faceStatus === 'success'}
                                    >
                                        {faceStatus === 'loading' ? 'Capturing...' : 'Capture & Register'}
                                    </button>
                                    <small className="text-white-50 mt-2">Ensure staff is facing the camera directly</small>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StaffList;
