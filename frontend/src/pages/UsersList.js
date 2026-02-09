import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import { Edit, Trash2, Power, Plus, Users, Shield, UserCheck, UserX, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', phone: '',
        password: '', role: 'Patient', gender: 'Male', dob: '', address: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('users/list.php');
            if (res.status === 'success') {
                setUsers(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (user) => {
        const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
        if (window.confirm(`Set status to ${newStatus}?`)) {
            const res = await api.post('users/status.php', { user_id: user.user_id, status: newStatus });
            if (res.status === 'success') fetchUsers();
        }
    };

    const handleDelete = async (user) => {
        if (window.confirm('Delete this user? This cannot be undone.')) {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`http://localhost:8080/MediSphere/backend/api/users/manage.php?id=${user.user_id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.status === 'success') {
                    fetchUsers();
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error("Delete failed", error);
            }
        }
    };

    const openModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                user_id: user.user_id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone: user.phone,
                gender: user.gender || 'Male',
                address: user.address || '',
            });
        } else {
            setEditingUser(null);
            setFormData({
                first_name: '', last_name: '', email: '', phone: '',
                password: '', role: 'Patient', gender: 'Male', dob: '', address: ''
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
            const res = await api.post('users/manage.php', formData);
            if (res.status === 'success') {
                setIsModalOpen(false);
                fetchUsers();
            } else {
                alert(res.message);
            }
        } catch (error) {
            console.error("Submit failed", error);
            alert("An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Stats calculations
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'Active').length;
    const inactiveUsers = users.filter(u => u.status !== 'Active').length;
    const adminCount = users.filter(u => u.role_name === 'Admin').length;

    // Table Configuration
    const columns = [
        {
            key: 'first_name',
            label: 'User',
            sortable: true,
            render: (row) => (
                <div className="d-flex align-items-center gap-3">
                    <div className={`rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm ${row.role_name === 'Admin' ? 'bg-danger' :
                        row.role_name === 'Doctor' ? 'bg-success' : 'bg-primary'
                        }`} style={{ width: 40, height: 40 }}>
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
            key: 'role_name',
            label: 'Role',
            sortable: true,
            render: (row) => (
                <span className={`badge ${row.role_name === 'Admin' ? 'bg-danger bg-opacity-10 text-danger border-danger' :
                    row.role_name === 'Doctor' ? 'bg-success bg-opacity-10 text-success border-success' :
                        row.role_name === 'Patient' ? 'bg-primary bg-opacity-10 text-primary border-primary' :
                            'bg-secondary bg-opacity-10 text-secondary border-secondary'
                    } border fw-medium px-3 py-2 rounded-pill`}>
                    {row.role_name}
                </span>
            )
        },
        {
            key: 'phone',
            label: 'Phone',
            sortable: false,
            render: (row) => <span className="text-muted">{row.phone || '-'}</span>
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (row) => (
                <span className={`badge ${row.status === 'Active' ? 'bg-success bg-opacity-10 text-success border-success' : 'bg-secondary bg-opacity-10 text-secondary border-secondary'} border rounded-pill px-3 py-1`}>
                    <span className={`d-inline-block rounded-circle me-1 ${row.status === 'Active' ? 'bg-success' : 'bg-secondary'}`} style={{ width: 6, height: 6 }}></span>
                    {row.status}
                </span>
            )
        }
    ];

    const actions = [
        { label: 'Edit', icon: Edit, onClick: openModal },
        { label: 'Toggle Status', icon: Power, className: 'text-warning', onClick: toggleStatus },
        { label: 'Delete', icon: Trash2, className: 'text-danger', onClick: handleDelete },
    ];

    // Stat Card Component
    const StatCard = ({ icon: Icon, title, value, color, trend }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card border-0 shadow-sm h-100"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)', backdropFilter: 'blur(10px)' }}
        >
            <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <p className="text-muted small mb-1 text-uppercase fw-bold" style={{ letterSpacing: '0.5px' }}>{title}</p>
                        <h2 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>{value}</h2>
                        {trend && <small className="text-success"><TrendingUp size={12} className="me-1" />{trend}</small>}
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
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--text-main)' }}>User Management</h2>
                    <p className="text-muted mb-0">Manage system access, roles and permissions</p>
                </div>
                <button className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow-sm" onClick={() => openModal()}>
                    <Plus size={18} /> Add User
                </button>
            </div>

            {/* Stats Row */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <StatCard icon={Users} title="Total Users" value={totalUsers} color="primary" />
                </div>
                <div className="col-md-3">
                    <StatCard icon={UserCheck} title="Active Users" value={activeUsers} color="success" />
                </div>
                <div className="col-md-3">
                    <StatCard icon={UserX} title="Inactive" value={inactiveUsers} color="secondary" />
                </div>
                <div className="col-md-3">
                    <StatCard icon={Shield} title="Administrators" value={adminCount} color="danger" />
                </div>
            </div>

            {/* Data Table */}
            {loading ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted mt-3 mb-0">Loading users...</p>
                    </div>
                </div>
            ) : (
                <DataTable
                    title="All Users"
                    columns={columns}
                    data={users}
                    actions={actions}
                    keyField="user_id"
                />
            )}

            {/* Modal */}
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
                                        <h5 className="modal-title fw-bold text-white mb-1">{editingUser ? 'Edit User' : 'Create New User'}</h5>
                                        <p className="text-white-50 mb-0 small">{editingUser ? 'Update user information' : 'Add a new user to the system'}</p>
                                    </div>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setIsModalOpen(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <form onSubmit={handleSubmit}>
                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">First Name</label>
                                                <input name="first_name" className="form-control bg-light border-0 py-2" value={formData.first_name} onChange={handleChange} required placeholder="Enter first name" />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Last Name</label>
                                                <input name="last_name" className="form-control bg-light border-0 py-2" value={formData.last_name} onChange={handleChange} required placeholder="Enter last name" />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted">Email Address</label>
                                            <input type="email" name="email" className="form-control bg-light border-0 py-2" value={formData.email} onChange={handleChange} required disabled={!!editingUser} placeholder="user@example.com" />
                                        </div>
                                        {!editingUser && (
                                            <div className="mb-3">
                                                <label className="form-label small fw-bold text-muted">Password</label>
                                                <input type="password" name="password" className="form-control bg-light border-0 py-2" value={formData.password} onChange={handleChange} required placeholder="Create a strong password" />
                                            </div>
                                        )}
                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Phone Number</label>
                                                <input name="phone" className="form-control bg-light border-0 py-2" value={formData.phone} onChange={handleChange} required placeholder="+1 234 567 8900" />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Role</label>
                                                {editingUser ? <input className="form-control bg-light border-0 py-2" value={editingUser.role_name} disabled /> : (
                                                    <select name="role" className="form-select bg-light border-0 py-2" value={formData.role} onChange={handleChange}>
                                                        <option value="Patient">Patient</option>
                                                        <option value="Doctor">Doctor</option>
                                                        <option value="Receptionist">Receptionist</option>
                                                        <option value="Staff">Staff</option>
                                                        <option value="Admin">Admin</option>
                                                    </select>
                                                )}
                                            </div>
                                        </div>
                                        {!editingUser && (
                                            <div className="row g-3 mb-3">
                                                <div className="col-md-6">
                                                    <label className="form-label small fw-bold text-muted">Gender</label>
                                                    <select name="gender" className="form-select bg-light border-0 py-2" value={formData.gender} onChange={handleChange}>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label small fw-bold text-muted">Date of Birth</label>
                                                    <input type="date" name="dob" className="form-control bg-light border-0 py-2" value={formData.dob} onChange={handleChange} required />
                                                </div>
                                            </div>
                                        )}
                                        <div className="mb-4">
                                            <label className="form-label small fw-bold text-muted">Address</label>
                                            <input name="address" className="form-control bg-light border-0 py-2" value={formData.address} onChange={handleChange} required placeholder="Enter full address" />
                                        </div>
                                        <div className="d-flex justify-content-end gap-3 pt-3 border-top">
                                            <button type="button" className="btn btn-light px-4 rounded-pill" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                            <button type="submit" className="btn btn-primary px-5 rounded-pill shadow-sm" disabled={isSubmitting}>
                                                {isSubmitting ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Saving...
                                                    </>
                                                ) : editingUser ? 'Update User' : 'Create User'}
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

export default UsersList;
