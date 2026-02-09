import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import { Edit, Plus, User, Moon, Sun, Users, Briefcase, Clock, TrendingUp, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StaffList = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);

    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', phone: '',
        password: '', designation: 'Nurse', shift: 'Day', gender: 'Female', dob: '', address: ''
    });

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

    // Stats
    const totalStaff = staff.length;
    const dayShift = staff.filter(s => s.shift === 'Day').length;
    const nightShift = staff.filter(s => s.shift === 'Night').length;
    const nurseCount = staff.filter(s => s.designation?.toLowerCase().includes('nurse')).length;

    const columns = [
        {
            key: 'first_name',
            label: 'Staff Name',
            sortable: true,
            render: (row) => (
                <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: 44, height: 44 }}>
                        {row.first_name.charAt(0)}{row.last_name.charAt(0)}
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
                <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 rounded-pill px-3 py-2">
                    <Briefcase size={12} className="me-1" />
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
                    <div className={`rounded-circle d-flex align-items-center justify-content-center ${row.shift === 'Day' ? 'bg-warning bg-opacity-10' : 'bg-dark bg-opacity-10'}`} style={{ width: 32, height: 32 }}>
                        {row.shift === 'Day' ? <Sun size={16} className="text-warning" /> : <Moon size={16} className="text-dark" />}
                    </div>
                    <span className="fw-medium">{row.shift}</span>
                </div>
            )
        },
        {
            key: 'phone',
            label: 'Contact',
            render: (row) => <span className="text-muted">{row.phone || '-'}</span>
        }
    ];

    const actions = [
        { label: 'Edit Staff', icon: Edit, onClick: openModal }
    ];

    // Stat Card Component
    const StatCard = ({ icon: Icon, title, value, color, subtitle }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card border-0 shadow-sm h-100"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)', backdropFilter: 'blur(10px)' }}
        >
            <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <p className="text-muted small mb-1 text-uppercase fw-bold" style={{ letterSpacing: '0.5px' }}>{title}</p>
                        <h2 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>{value}</h2>
                        {subtitle && <small className="text-muted">{subtitle}</small>}
                    </div>
                    <div className={`rounded-3 p-3 bg-${color} bg-opacity-10`}>
                        <Icon size={24} className={`text-${color}`} />
                    </div>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="container-fluid py-4 fade-in">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--text-main)' }}>Staff Management</h2>
                    <p className="text-muted mb-0">Manage nurses, receptionists, and support staff</p>
                </div>
                <button className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow-sm" onClick={() => openModal()}>
                    <Plus size={18} /> Add Staff
                </button>
            </div>

            {/* Stats Row */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <StatCard icon={Users} title="Total Staff" value={totalStaff} color="primary" />
                </div>
                <div className="col-md-3">
                    <StatCard icon={Sun} title="Day Shift" value={dayShift} color="warning" subtitle="Morning crew" />
                </div>
                <div className="col-md-3">
                    <StatCard icon={Moon} title="Night Shift" value={nightShift} color="dark" subtitle="Night crew" />
                </div>
                <div className="col-md-3">
                    <StatCard icon={UserCheck} title="Nurses" value={nurseCount} color="success" />
                </div>
            </div>

            {/* Data Table */}
            {loading ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted mt-3 mb-0">Loading staff...</p>
                    </div>
                </div>
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
                    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.6)' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="modal-dialog modal-dialog-centered modal-lg"
                        >
                            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                                <div className="modal-header border-0 p-4" style={{ background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)' }}>
                                    <div>
                                        <h5 className="modal-title fw-bold text-white mb-1">{editingStaff ? 'Edit Staff Member' : 'Add New Staff'}</h5>
                                        <p className="text-white-50 mb-0 small">{editingStaff ? 'Update staff information' : 'Register new staff member'}</p>
                                    </div>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setIsModalOpen(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <form onSubmit={handleSubmit}>
                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">First Name</label>
                                                <input name="first_name" className="form-control bg-light border-0 py-2" value={formData.first_name} onChange={handleChange} required />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Last Name</label>
                                                <input name="last_name" className="form-control bg-light border-0 py-2" value={formData.last_name} onChange={handleChange} required />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted">Email</label>
                                            <input type="email" name="email" className="form-control bg-light border-0 py-2" value={formData.email} onChange={handleChange} required />
                                        </div>
                                        {!editingStaff && (
                                            <div className="mb-3">
                                                <label className="form-label small fw-bold text-muted">Password</label>
                                                <input type="password" name="password" className="form-control bg-light border-0 py-2" value={formData.password} onChange={handleChange} required />
                                            </div>
                                        )}
                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Designation</label>
                                                <select name="designation" className="form-select bg-light border-0 py-2" value={formData.designation} onChange={handleChange}>
                                                    <option value="Nurse">Nurse</option>
                                                    <option value="Senior Nurse">Senior Nurse</option>
                                                    <option value="Receptionist">Receptionist</option>
                                                    <option value="Lab Technician">Lab Technician</option>
                                                    <option value="Pharmacist">Pharmacist</option>
                                                    <option value="Cleaner">Cleaner</option>
                                                    <option value="Security">Security</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Shift</label>
                                                <select name="shift" className="form-select bg-light border-0 py-2" value={formData.shift} onChange={handleChange}>
                                                    <option value="Day">Day Shift (6AM - 6PM)</option>
                                                    <option value="Night">Night Shift (6PM - 6AM)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Phone</label>
                                                <input name="phone" className="form-control bg-light border-0 py-2" value={formData.phone} onChange={handleChange} required />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Gender</label>
                                                <select name="gender" className="form-select bg-light border-0 py-2" value={formData.gender} onChange={handleChange}>
                                                    <option value="Female">Female</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <label className="form-label small fw-bold text-muted">Address</label>
                                            <input name="address" className="form-control bg-light border-0 py-2" value={formData.address} onChange={handleChange} required />
                                        </div>
                                        <div className="d-flex justify-content-end gap-3 pt-3 border-top">
                                            <button type="button" className="btn btn-light px-4 rounded-pill" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                            <button type="submit" className="btn btn-success px-5 rounded-pill shadow-sm" disabled={isSubmitting}>
                                                {isSubmitting ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Saving...
                                                    </>
                                                ) : editingStaff ? 'Update Staff' : 'Add Staff'}
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

export default StaffList;
