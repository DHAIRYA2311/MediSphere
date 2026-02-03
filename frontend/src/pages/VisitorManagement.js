import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import { UserPlus, LogOut, Search, Clock, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VisitorManagement = () => {
    const [visitors, setVisitors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        patient_id: '',
        visitor_name: '',
        relation: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [visRes, patRes] = await Promise.all([
                api.get('visitors/list.php'),
                api.get('patients/list.php')
            ]);

            if (visRes.status === 'success') setVisitors(visRes.data);
            if (patRes.status === 'success') setPatients(patRes.data);
        } catch (e) {
            console.error("Error fetching data", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async (visitorId) => {
        if (!window.confirm("Mark visitor as checked out?")) return;
        try {
            const res = await api.post('visitors/checkout.php', { visitor_id: visitorId });
            if (res.status === 'success') {
                fetchData(); // Refresh list
            } else {
                alert(res.message);
            }
        } catch (e) {
            alert("Error checking out");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.post('visitors/add.php', formData);
            if (res.status === 'success') {
                setIsModalOpen(false);
                setFormData({ patient_id: '', visitor_name: '', relation: '' });
                fetchData();
            } else {
                alert(res.message);
            }
        } catch (e) {
            alert("Error adding visitor");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredPatients = patients.filter(p =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone?.includes(searchTerm)
    );

    const columns = [
        {
            key: 'visitor_name',
            label: 'Visitor Details',
            sortable: true,
            render: (row) => (
                <div>
                    <div className="fw-bold text-dark">{row.visitor_name}</div>
                    <div className="small text-muted">{row.relation}</div>
                </div>
            )
        },
        {
            key: 'patient_first_name',
            label: 'Visiting Patient',
            sortable: true,
            render: (row) => (
                <div className="d-flex align-items-center gap-2">
                    <div className="rounded-circle bg-light border d-flex align-items-center justify-content-center text-muted small" style={{ width: 30, height: 30 }}>
                        <UserPlus size={14} />
                    </div>
                    <div>
                        <div className="fw-semibold text-dark">{row.patient_first_name} {row.patient_last_name}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'entry_time',
            label: 'Time Log',
            sortable: true,
            render: (row) => {
                const isOut = row.exit_time && new Date(row.exit_time).getFullYear() < 2050; // Simple check for "Active" dummy date
                return (
                    <div className="small">
                        <div className="text-success"><span className="fw-bold">In:</span> {new Date(row.entry_time).toLocaleString()}</div>
                        {isOut ? (
                            <div className="text-danger"><span className="fw-bold">Out:</span> {new Date(row.exit_time).toLocaleString()}</div>
                        ) : (
                            <div className="badge bg-success bg-opacity-10 text-success border border-success mt-1">Active Now</div>
                        )}
                    </div>
                );
            }
        }
    ];

    const actions = [
        {
            label: 'Check Out',
            icon: LogOut,
            onClick: (row) => handleCheckOut(row.visitor_id),
            className: (row) => (row.exit_time && new Date(row.exit_time).getFullYear() > 2050) ? 'text-danger' : 'd-none'
        }
    ];

    return (
        <div className="container-fluid py-4 fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark">Visitor Management</h2>
                    <p className="text-muted">Track patient visitors and pass logs</p>
                </div>
                <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setIsModalOpen(true)}>
                    <UserPlus size={18} /> New Visitor Check-In
                </button>
            </div>

            {loading ? (
                <div className="text-center py-5 text-muted">Loading logs...</div>
            ) : (
                <DataTable
                    title="Visitor Logs"
                    columns={columns}
                    data={visitors}
                    actions={actions}
                    keyField="visitor_id"
                />
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="modal-dialog modal-dialog-centered"
                        >
                            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                                <div className="modal-header border-bottom-0 bg-light p-4">
                                    <h5 className="modal-title fw-bold">Visitor Check-In</h5>
                                    <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted">Select Patient</label>

                                            {/* Simple Custom Dropdown with Search */}
                                            <div className="dropdown w-100">
                                                <input
                                                    type="text"
                                                    className="form-control mb-2"
                                                    placeholder="Search patient name..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                                <select
                                                    className="form-select bg-light border-0"
                                                    size="5"
                                                    required
                                                    value={formData.patient_id}
                                                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                                                    style={{ height: 'auto', maxHeight: '150px' }}
                                                >
                                                    <option value="" disabled>-- Select Patient --</option>
                                                    {filteredPatients.map(p => (
                                                        <option key={p.patient_id} value={p.patient_id}>
                                                            {p.first_name} {p.last_name} ({p.phone})
                                                        </option>
                                                    ))}
                                                    {filteredPatients.length === 0 && <option disabled>No matches found</option>}
                                                </select>
                                                <div className="form-text small">Select the patient currently admitted or visiting.</div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted">Visitor Name</label>
                                            <input
                                                className="form-control bg-light border-0"
                                                value={formData.visitor_name}
                                                onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted">Relation</label>
                                            <select
                                                className="form-select bg-light border-0"
                                                value={formData.relation}
                                                onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                                                required
                                            >
                                                <option value="">-- Select Relation --</option>
                                                <option value="Family">Family Member</option>
                                                <option value="Friend">Friend</option>
                                                <option value="Relative">Relative</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        <div className="d-flex justify-content-end gap-2 mt-4">
                                            <button type="button" className="btn btn-light" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                            <button type="submit" className="btn btn-primary px-4" disabled={isSubmitting}>
                                                {isSubmitting ? 'Checking In...' : 'Check In Visitor'}
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

export default VisitorManagement;
