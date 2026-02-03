import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import { Edit, Trash2, Power, Plus, MoreHorizontal } from 'lucide-react';
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
            // Fallback fetch delete logic
            try {
                const res = await fetch(`http://127.0.0.1/Medisphere-Project/backend/api/users/manage.php?id=${user.user_id}`, {
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
                <span className={`badge bg-light text-dark border fw-medium px-3 py-2 rounded-pill`}>
                    {row.role_name}
                </span>
            )
        },
        {
            key: 'phone',
            label: 'Phone',
            sortable: false
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (row) => (
                <span className={`badge ${row.status === 'Active' ? 'bg-success' : 'bg-secondary'} bg-opacity-75 status-pill`}>
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

    return (
        <div className="container-fluid py-4 fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark">User Management</h2>
                    <p className="text-muted">Manage system access and roles</p>
                </div>
                <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => openModal()}>
                    <Plus size={18} /> Add User
                </button>
            </div>

            {loading ? (
                <div className="text-center py-5 text-muted">Loading users...</div>
            ) : (
                <DataTable
                    title="All Users"
                    columns={columns}
                    data={users}
                    actions={actions}
                    keyField="user_id"
                />
            )}

            {/* Modal using standard Bootstrap for now, could be upgraded to custom motion modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="modal-dialog modal-dialog-centered"
                        >
                            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                                <div className="modal-header border-bottom-0 bg-light p-4">
                                    <h5 className="modal-title fw-bold">{editingUser ? 'Edit User' : 'New User'}</h5>
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
                                            <input type="email" name="email" className="form-control bg-light border-0" value={formData.email} onChange={handleChange} required disabled={!!editingUser} />
                                        </div>
                                        {!editingUser && (
                                            <div className="mb-3">
                                                <label className="form-label small fw-bold text-muted">Password</label>
                                                <input type="password" name="password" className="form-control bg-light border-0" value={formData.password} onChange={handleChange} required />
                                            </div>
                                        )}
                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Phone</label>
                                                <input name="phone" className="form-control bg-light border-0" value={formData.phone} onChange={handleChange} required />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted">Role</label>
                                                {editingUser ? <input className="form-control bg-light border-0" value={editingUser.role_name} disabled /> : (
                                                    <select name="role" className="form-select bg-light border-0" value={formData.role} onChange={handleChange}>
                                                        <option value="Patient">Patient</option>
                                                        <option value="Doctor">Doctor</option>
                                                        <option value="Receptionist">Receptionist</option>
                                                        <option value="Admin">Admin</option>
                                                    </select>
                                                )}
                                            </div>
                                        </div>
                                        {!editingUser && (
                                            <div className="row g-3 mb-3">
                                                <div className="col-md-6">
                                                    <label className="form-label small fw-bold text-muted">Gender</label>
                                                    <select name="gender" className="form-select bg-light border-0" value={formData.gender} onChange={handleChange}>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label small fw-bold text-muted">DOB</label>
                                                    <input type="date" name="dob" className="form-control bg-light border-0" value={formData.dob} onChange={handleChange} required />
                                                </div>
                                            </div>
                                        )}
                                        <div className="mb-4">
                                            <label className="form-label small fw-bold text-muted">Address</label>
                                            <input name="address" className="form-control bg-light border-0" value={formData.address} onChange={handleChange} required />
                                        </div>
                                        <div className="d-flex justify-content-end gap-2">
                                            <button type="button" className="btn btn-light" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                            <button type="submit" className="btn btn-primary px-4" disabled={isSubmitting}>
                                                {isSubmitting ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Saving...
                                                    </>
                                                ) : 'Save'}
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
