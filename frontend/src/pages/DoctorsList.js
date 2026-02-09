import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Search, Stethoscope, Award, Building, Users, Clock, Phone, Mail } from 'lucide-react';
import { CardSkeleton } from '../components/Skeleton';
import { motion } from 'framer-motion';

const DoctorsList = () => {
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        const fetchDoctors = async () => {
            setLoading(true);
            try {
                const res = await api.get('doctors/list.php');
                if (res.status === 'success') {
                    setDoctors(res.data);
                    setFilteredDoctors(res.data);
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchDoctors();
    }, []);

    useEffect(() => {
        const lower = searchTerm.toLowerCase();
        const filtered = doctors.filter(doc =>
            doc.first_name.toLowerCase().includes(lower) ||
            doc.last_name.toLowerCase().includes(lower) ||
            doc.specialization.toLowerCase().includes(lower) ||
            doc.department.toLowerCase().includes(lower)
        );
        setFilteredDoctors(filtered);
    }, [searchTerm, doctors]);

    // Get unique specializations count
    const specializations = [...new Set(doctors.map(d => d.specialization))];
    const departments = [...new Set(doctors.map(d => d.department))];

    return (
        <div className="fade-in">
            {/* Page Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--text-main)' }}>Doctors Directory</h2>
                    <p className="mb-0" style={{ color: 'var(--text-muted)' }}>
                        Find specialists and book appointments
                    </p>
                </div>

                <div className="d-flex align-items-center gap-3">
                    <div className="position-relative">
                        <Search size={16} className="position-absolute" style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="search"
                            className="search-bar"
                            placeholder="Search doctors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '42px', width: '240px' }}
                        />
                    </div>
                    {isAdmin && (
                        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => navigate('/register')}>
                            <UserPlus size={18} /> Add Doctor
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Summary */}
            <div className="row g-3 mb-4">
                <div className="col-6 col-lg-3">
                    <motion.div
                        className="stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="d-flex align-items-center gap-3">
                            <div className="stat-card-icon" style={{ background: 'var(--primary)' }}>
                                <Users size={20} />
                            </div>
                            <div>
                                <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>Total Doctors</p>
                                <h4 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>{doctors.length}</h4>
                            </div>
                        </div>
                    </motion.div>
                </div>
                <div className="col-6 col-lg-3">
                    <motion.div
                        className="stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        <div className="d-flex align-items-center gap-3">
                            <div className="stat-card-icon" style={{ background: 'var(--accent)' }}>
                                <Stethoscope size={20} />
                            </div>
                            <div>
                                <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>Specializations</p>
                                <h4 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>{specializations.length}</h4>
                            </div>
                        </div>
                    </motion.div>
                </div>
                <div className="col-6 col-lg-3">
                    <motion.div
                        className="stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="d-flex align-items-center gap-3">
                            <div className="stat-card-icon" style={{ background: 'var(--success)' }}>
                                <Building size={20} />
                            </div>
                            <div>
                                <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>Departments</p>
                                <h4 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>{departments.length}</h4>
                            </div>
                        </div>
                    </motion.div>
                </div>
                <div className="col-6 col-lg-3">
                    <motion.div
                        className="stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                    >
                        <div className="d-flex align-items-center gap-3">
                            <div className="stat-card-icon" style={{ background: 'var(--warning)' }}>
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>Available Now</p>
                                <h4 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>{doctors.length}</h4>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Doctors Grid */}
            {loading ? (
                <div className="row g-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="col-md-6 col-lg-4 col-xl-3">
                            <CardSkeleton />
                        </div>
                    ))}
                </div>
            ) : filteredDoctors.length === 0 ? (
                <div className="text-center py-5">
                    <Stethoscope size={48} style={{ color: 'var(--text-muted)', opacity: 0.3 }} className="mb-3" />
                    <h5 style={{ color: 'var(--text-main)' }}>No doctors found</h5>
                    <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search terms</p>
                </div>
            ) : (
                <div className="row g-4">
                    {filteredDoctors.map((doc, index) => (
                        <div className="col-md-6 col-lg-4 col-xl-3" key={doc.doctor_id}>
                            <motion.div
                                className="stat-card h-100"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                                whileHover={{ y: -4 }}
                            >
                                <div className="d-flex flex-column h-100">
                                    {/* Header */}
                                    <div className="d-flex align-items-start justify-content-between mb-3">
                                        <div
                                            className="avatar avatar-primary"
                                            style={{ width: 56, height: 56, fontSize: '1.25rem' }}
                                        >
                                            {doc.first_name.charAt(0)}{doc.last_name.charAt(0)}
                                        </div>
                                        <span className="badge badge-info">{doc.specialization}</span>
                                    </div>

                                    {/* Info */}
                                    <h5 className="fw-bold mb-1" style={{ color: 'var(--text-main)' }}>
                                        Dr. {doc.first_name} {doc.last_name}
                                    </h5>
                                    <p className="small mb-3" style={{ color: 'var(--text-muted)' }}>
                                        {doc.qualification}
                                    </p>

                                    {/* Details */}
                                    <div className="mt-auto pt-3" style={{ borderTop: '1px solid var(--border-dark)' }}>
                                        <div className="d-flex align-items-center gap-2 small mb-2" style={{ color: 'var(--text-muted)' }}>
                                            <Building size={14} />
                                            <span>{doc.department}</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2 small mb-3" style={{ color: 'var(--text-muted)' }}>
                                            <Award size={14} />
                                            <span>{doc.years_of_experience} Years Experience</span>
                                        </div>

                                        <button
                                            className="btn btn-primary w-100"
                                            onClick={() => navigate(isAdmin ? `/doctors/${doc.doctor_id}` : '/book-appointment')}
                                        >
                                            {isAdmin ? 'View Profile' : 'Book Appointment'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DoctorsList;
