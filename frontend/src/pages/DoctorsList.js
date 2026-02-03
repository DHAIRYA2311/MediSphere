import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Search, Stethoscope, Clock, Award, Building } from 'lucide-react';

const DoctorsList = () => {
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        const fetchDoctors = async () => {
            const res = await api.get('doctors/list.php');
            if (res.status === 'success') {
                setDoctors(res.data);
                setFilteredDoctors(res.data);
            }
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

    return (
        <div className="container-fluid py-4 fade-in">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 gap-3">
                <div>
                    <h2 className="fw-bold text-dark">Doctors Directory</h2>
                    <p className="text-muted mb-0">Find specialists and book appointments</p>
                </div>

                <div className="d-flex align-items-center gap-3 w-100 w-md-auto">
                    <div className="position-relative flex-grow-1">
                        <Search className="position-absolute ms-3 translate-middle-y start-0 top-50 text-muted" size={18} />
                        <input
                            type="text"
                            className="form-control ps-5 bg-white border-0 shadow-sm"
                            placeholder="Search doctors, specialists..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ minWidth: '250px' }}
                        />
                    </div>
                    {isAdmin && (
                        <button className="btn btn-primary d-flex align-items-center gap-2 text-nowrap" onClick={() => navigate('/register')}>
                            <UserPlus size={18} /> Add Doctor
                        </button>
                    )}
                </div>
            </div>

            {filteredDoctors.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    <Stethoscope size={48} className="mb-3 opacity-25" />
                    <p>No doctors found matching your search.</p>
                </div>
            ) : (
                <div className="row g-4">
                    {filteredDoctors.map(doc => (
                        <div className="col-md-6 col-lg-4 col-xl-3" key={doc.doctor_id}>
                            <div className="card-enterprise border-0 shadow-sm h-100 position-relative hover-lift transition-all">
                                <div className="p-4 d-flex flex-column h-100">
                                    <div className="d-flex align-items-start justify-content-between mb-3">
                                        <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: 64, height: 64, fontSize: '1.5rem' }}>
                                            {doc.first_name.charAt(0)}{doc.last_name.charAt(0)}
                                        </div>
                                        <span className="badge bg-light text-dark border">{doc.specialization}</span>
                                    </div>

                                    <h5 className="fw-bold text-dark mb-1">Dr. {doc.first_name} {doc.last_name}</h5>
                                    <p className="text-muted small mb-3">{doc.qualification}</p>

                                    <div className="mt-auto pt-3 border-top border-light">
                                        <div className="d-flex align-items-center gap-2 text-muted small mb-2">
                                            <Building size={14} />
                                            <span>{doc.department}</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2 text-muted small mb-3">
                                            <Award size={14} />
                                            <span>{doc.years_of_experience} Years Exp.</span>
                                        </div>

                                        <button
                                            className="btn btn-outline-primary w-100 fw-medium"
                                            onClick={() => navigate(isAdmin ? `/doctors/${doc.doctor_id}` : '/book-appointment')}
                                        >
                                            {isAdmin ? 'Manage Profile' : 'Book Appointment'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DoctorsList;
