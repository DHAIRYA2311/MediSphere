import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        gender: 'Male',
        dob: '',
        address: '',
        role: 'patient'
    });
    const [error, setError] = useState('');
    const { register, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await register(formData);
        if (res.status === 'success') {
            navigate('/login');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center py-5 bg-light">
            <div className="row w-100 justify-content-center">
                <div className="col-md-8">
                    <div className="card-enterprise border-0 shadow-lg p-5">
                        <div className="text-center mb-5">
                            <h2 className="fw-bold text-primary">Join Medisphere</h2>
                            <p className="text-muted">Create your enterprise account</p>
                        </div>

                        {error && <div className="alert alert-danger rounded-3 text-center py-2">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label small fw-bold text-muted">First Name</label>
                                    <input type="text" name="first_name" className="form-control bg-light border-0" value={formData.first_name} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label small fw-bold text-muted">Last Name</label>
                                    <input type="text" name="last_name" className="form-control bg-light border-0" value={formData.last_name} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label small fw-bold text-muted">Email</label>
                                    <input type="email" name="email" className="form-control bg-light border-0" value={formData.email} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label small fw-bold text-muted">Phone</label>
                                    <input type="text" name="phone" className="form-control bg-light border-0" value={formData.phone} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">Password</label>
                                <input type="password" name="password" className="form-control bg-light border-0" value={formData.password} onChange={handleChange} required />
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label small fw-bold text-muted">Gender</label>
                                    <select name="gender" className="form-select bg-light border-0" value={formData.gender} onChange={handleChange}>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label small fw-bold text-muted">Date of Birth</label>
                                    <input type="date" name="dob" className="form-control bg-light border-0" value={formData.dob} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">Address</label>
                                <textarea name="address" className="form-control bg-light border-0" rows="2" value={formData.address} onChange={handleChange} required></textarea>
                            </div>

                            <div className="mb-4">
                                <label className="form-label small fw-bold text-muted">Role</label>
                                <select name="role" className="form-select bg-light border-0" value={formData.role} onChange={handleChange}>
                                    <option value="patient">Patient</option>
                                    <option value="doctor">Doctor</option>
                                    <option value="receptionist">Receptionist</option>
                                </select>
                            </div>

                            <button type="submit" className="btn btn-primary w-100 py-3 mb-3 fw-bold">Register</button>
                        </form>
                        <div className="text-center">
                            <small className="text-muted">Already have an account? <Link to="/login" className="fw-bold text-primary text-decoration-none">Login</Link></small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
