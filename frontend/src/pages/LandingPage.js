import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    Activity,
    Calendar,
    User,
    CheckCircle,
    Phone,
    Mail,
    MapPin,
    Users,
    Award,
    Clock,
    Shield,
    Video,
    Building
} from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [doctors, setDoctors] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Booking Form State
    const [bookingData, setBookingData] = useState({
        first_name: '', last_name: '', email: '', phone: '',
        password: '', dob: '', gender: 'Male', address: '',
        appointment_date: '', appointment_time: '',
        department: '', doctor_id: '', notes: '',
        method: 'Online'
    });

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const res = await api.get('public/doctors.php');
            if (res.status === 'success') {
                setDoctors(res.data);
            }
        } catch (e) {
            console.error("Failed to fetch doctors", e);
        }
    };

    const departments = [...new Set(doctors.map(d => d.department))];
    const filteredDoctors = doctors.filter(d => d.department === bookingData.department);

    const handleChange = (e) => {
        setBookingData({ ...bookingData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.post('public/book_appointment.php', bookingData);
            const data = res; // api.post already returns data.json()

            if (data.status === 'success') {
                // Auto Login
                login(data.user, data.token);
                // Redirect
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500); // 1.5s delay to show success
            } else {
                alert(data.message);
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error(error);
            alert("Booking failed. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="landing-page bg-white fw-sans">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-light bg-white fixed-top shadow-sm py-3">
                <div className="container">
                    <a className="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary fs-4" href="#">
                        <div className="bg-primary text-white rounded p-1"><Activity size={24} /></div>
                        Medisphere
                    </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto gap-4 align-items-center fw-medium">
                            <li className="nav-item"><a className="nav-link" href="#home">Home</a></li>
                            <li className="nav-item"><a className="nav-link" href="#about">About</a></li>
                            <li className="nav-item"><a className="nav-link" href="#services">Services</a></li>
                            <li className="nav-item"><a className="nav-link" href="#doctors">Doctors</a></li>
                            <li className="nav-item"><a className="nav-link" href="#contact">Contact</a></li>
                            <li className="nav-item">
                                <button className="btn btn-primary rounded-pill px-4" onClick={() => navigate('/login')}>Login</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="pt-5 mt-5 d-flex align-items-center" style={{ minHeight: '90vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
                <div className="container pt-5">
                    <div className="row align-items-center">
                        <div className="col-lg-6 mb-5 mb-lg-0">
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-3">#1 Hospital Management System</span>
                                <h1 className="display-3 fw-bold text-dark mb-4">Your Health, <br /><span className="text-primary">Our Priority.</span></h1>
                                <p className="lead text-muted mb-5">Experience world-class healthcare with advanced technology and compassionate care. Book appointments online and manage your health records effortlessly.</p>
                                <div className="d-flex gap-3">
                                    <a href="#book" className="btn btn-primary btn-lg rounded-pill px-5 shadow-lg">Book Appointment</a>
                                    <a href="#services" className="btn btn-outline-primary btn-lg rounded-pill px-5">Learn More</a>
                                </div>
                                <div className="mt-5 d-flex gap-5 text-muted">
                                    <div className="d-flex align-items-center gap-2">
                                        <Users size={24} className="text-primary" />
                                        <div><div className="fw-bold text-dark">50k+</div><small>Happy Patients</small></div>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <Award size={24} className="text-primary" />
                                        <div><div className="fw-bold text-dark">150+</div><small>Expert Doctors</small></div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                        <div className="col-lg-6 position-relative">
                            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                                <img src="https://img.freepik.com/free-photo/team-young-specialist-doctors-standing-corridor-hospital_1303-21199.jpg" alt="Doctors" className="img-fluid rounded-4 shadow-lg" />
                                <div className="position-absolute bottom-0 start-0 m-4 p-4 bg-white rounded-4 shadow-lg" style={{ maxWidth: '280px' }}>
                                    <div className="d-flex align-items-center gap-3 mb-3">
                                        <div className="bg-success rounded-circle p-2 text-white"><Shield size={20} /></div>
                                        <div>
                                            <div className="fw-bold">24/7 Support</div>
                                            <small className="text-muted">Always here for you</small>
                                        </div>
                                    </div>
                                    <div className="progress" style={{ height: '6px' }}>
                                        <div className="progress-bar bg-success" style={{ width: '100%' }}></div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features / About */}
            <section id="services" className="py-5">
                <div className="container py-5">
                    <div className="text-center mb-5">
                        <h6 className="text-primary fw-bold text-uppercase ls-1">Why Choose Us</h6>
                        <h2 className="fw-bold display-6">Complete Healthcare Solutions</h2>
                    </div>
                    <div className="row g-4">
                        {[
                            { icon: Calendar, title: 'Easy Scheduling', desc: 'Book appointments instantly anytime.' },
                            { icon: User, title: 'Expert Doctors', desc: 'Access to top specialists in every field.' },
                            { icon: Shield, title: 'Secure Records', desc: 'Your medical history is safe and private.' },
                            { icon: Clock, title: '24/7 Emergency', desc: 'Round the clock care for critical needs.' },
                        ].map((item, i) => (
                            <div className="col-md-3" key={i}>
                                <div className="card h-100 border-0 shadow-sm hover-lift p-4 text-center">
                                    <div className="mx-auto bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: 60, height: 60 }}>
                                        <item.icon size={28} />
                                    </div>
                                    <h5 className="fw-bold">{item.title}</h5>
                                    <p className="text-muted small">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Doctors Preview */}
            <section id="doctors" className="py-5 bg-light">
                <div className="container py-5">
                    <div className="d-flex justify-content-between align-items-end mb-5">
                        <div>
                            <h6 className="text-primary fw-bold text-uppercase ls-1">Our Team</h6>
                            <h2 className="fw-bold display-6">Meet Our Specialists</h2>
                        </div>
                        <button className="btn btn-outline-primary rounded-pill">View All Doctors</button>
                    </div>
                    {/* Placeholder Cards for Doctors since we don't have public API yet */}
                    <div className="row g-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div className="col-md-3" key={i}>
                                <div className="card border-0 shadow-sm overflow-hidden">
                                    <div className="bg-secondary bg-opacity-25" style={{ height: '200px' }}></div>
                                    <div className="card-body text-center p-4">
                                        <h5 className="fw-bold">Dr. Specialist {i}</h5>
                                        <p className="text-muted small mb-0">Cardiology</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Book Appointment Form */}
            <section id="book" className="py-5 bg-primary bg-opacity-10 position-relative">
                <div className="container py-5">
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                                <div className="row g-0">
                                    <div className="col-lg-5 bg-primary text-white p-5 d-flex flex-column justify-content-center">
                                        <h3 className="fw-bold mb-4">Book Your Appointment</h3>
                                        <p className="mb-4 opacity-75">New to Medisphere? Fill out this form to create your patient account and book your first consultation instantly.</p>
                                        <div className="d-flex align-items-center gap-3 mb-3">
                                            <Phone size={20} /> <span>+1 (555) 123-4567</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-3">
                                            <Mail size={20} /> <span>appointments@medisphere.com</span>
                                        </div>
                                    </div>
                                    <div className="col-lg-7 p-5 bg-white">
                                        {isSubmitting ? (
                                            <div className="text-center py-5">
                                                <div className="spinner-border text-primary mb-3" role="status"></div>
                                                <h4 className="fw-bold">Processing...</h4>
                                                <p className="text-muted">Creating your account and booking appointment.</p>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleSubmit}>
                                                <h5 className="mb-4 text-dark fw-bold">Patient Details</h5>
                                                <div className="row g-3 mb-3">
                                                    <div className="col-6"><input name="first_name" className="form-control bg-light border-0" placeholder="First Name" onChange={handleChange} required /></div>
                                                    <div className="col-6"><input name="last_name" className="form-control bg-light border-0" placeholder="Last Name" onChange={handleChange} required /></div>
                                                </div>
                                                <div className="row g-3 mb-3">
                                                    <div className="col-6"><input type="email" name="email" className="form-control bg-light border-0" placeholder="Email Address" onChange={handleChange} required /></div>
                                                    <div className="col-6"><input name="phone" className="form-control bg-light border-0" placeholder="Phone Number" onChange={handleChange} required /></div>
                                                </div>
                                                <div className="row g-3 mb-3">
                                                    <div className="col-6"><input type="date" name="dob" className="form-control bg-light border-0" onChange={handleChange} required /></div>
                                                    <div className="col-6">
                                                        <select name="gender" className="form-select bg-light border-0" onChange={handleChange}>
                                                            <option value="Male">Male</option>
                                                            <option value="Female">Female</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="mb-4"><input name="address" className="form-control bg-light border-0" placeholder="Address" onChange={handleChange} required /></div>
                                                <div className="mb-4"><input type="password" name="password" className="form-control bg-light border-0" placeholder="Create Password" onChange={handleChange} required /></div>

                                                <h5 className="mb-4 text-dark fw-bold border-top pt-4">Appointment Details</h5>
                                                <div className="row g-3 mb-3">
                                                    <div className="col-6">
                                                        <select name="department" className="form-select bg-light border-0" value={bookingData.department} onChange={handleChange} required>
                                                            <option value="">Select Department</option>
                                                            {departments.map(dept => (
                                                                <option key={dept} value={dept}>{dept}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="col-6">
                                                        <select name="doctor_id" className="form-select bg-light border-0" value={bookingData.doctor_id} onChange={handleChange} required disabled={!bookingData.department}>
                                                            <option value="">{bookingData.department ? 'Select Doctor' : 'Choose Dept First'}</option>
                                                            {filteredDoctors.map(doc => (
                                                                <option key={doc.doctor_id} value={doc.doctor_id}>
                                                                    Dr. {doc.first_name} {doc.last_name} ({doc.specialization})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="row g-3 mb-4">
                                                    <div className="col-6"><input type="date" name="appointment_date" className="form-control bg-light border-0" onChange={handleChange} required /></div>
                                                    <div className="col-6"><input type="time" name="appointment_time" className="form-control bg-light border-0" onChange={handleChange} required /></div>
                                                </div>

                                                <h6 className="small fw-bold text-secondary text-uppercase mb-3">Consultation Type</h6>
                                                <div className="row g-3 mb-4">
                                                    <div className="col-6">
                                                        <input type="radio" name="method" value="Online" id="landing-online" className="btn-check" checked={bookingData.method === 'Online'} onChange={handleChange} />
                                                        <label className="btn btn-outline-primary w-100 p-4 rounded-4 border-2 d-flex flex-column align-items-center justify-content-center gap-2 transition-all" htmlFor="landing-online" style={{ minHeight: '120px' }}>
                                                            <Video size={32} />
                                                            <div className="fw-bold">Video Call</div>
                                                            <div className="small opacity-75">Connect Remotely</div>
                                                        </label>
                                                    </div>
                                                    <div className="col-6">
                                                        <input type="radio" name="method" value="Walk-in" id="landing-walkin" className="btn-check" checked={bookingData.method === 'Walk-in'} onChange={handleChange} />
                                                        <label className="btn btn-outline-success w-100 p-4 rounded-4 border-2 d-flex flex-column align-items-center justify-content-center gap-2 transition-all" htmlFor="landing-walkin" style={{ minHeight: '120px' }}>
                                                            <Building size={32} />
                                                            <div className="fw-bold">In-Hospital</div>
                                                            <div className="small opacity-75">Visit the Clinic</div>
                                                        </label>
                                                    </div>
                                                </div>

                                                <button type="submit" className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-sm">Confirm & Book Appointment</button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-dark text-white py-5" id="contact">
                <div className="container">
                    <div className="row g-5">
                        <div className="col-lg-4">
                            <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                <Activity /> Medisphere
                            </h4>
                            <p className="text-white-50">Leading the way in medical excellence, trusted care, and modern healthcare technology.</p>
                        </div>
                        <div className="col-lg-2">
                            <h6 className="fw-bold mb-3">Quick Links</h6>
                            <ul className="list-unstyled text-white-50 small d-flex flex-column gap-2">
                                <li>Home</li>
                                <li>Our Doctors</li>
                                <li>Services</li>
                                <li>Appointments</li>
                            </ul>
                        </div>
                        <div className="col-lg-3">
                            <h6 className="fw-bold mb-3">Contact</h6>
                            <ul className="list-unstyled text-white-50 small d-flex flex-column gap-2">
                                <li className="d-flex gap-2"><MapPin size={16} /> 123 Health Ave, NY</li>
                                <li className="d-flex gap-2"><Phone size={16} /> +1 (555) 123-4567</li>
                                <li className="d-flex gap-2"><Mail size={16} /> help@medisphere.com</li>
                            </ul>
                        </div>
                        <div className="col-lg-3">
                            <h6 className="fw-bold mb-3">Newsletter</h6>
                            <div className="input-group">
                                <input type="text" className="form-control border-0" placeholder="Email" />
                                <button className="btn btn-primary">Subscribe</button>
                            </div>
                        </div>
                    </div>
                    <div className="border-top border-secondary border-opacity-25 mt-5 pt-4 text-center text-white-50 small">
                        &copy; 2024 Medisphere SHMS. All rights reserved.
                    </div>
                </div>
            </footer>
            <style>{`
                .cursor-pointer { cursor: pointer; }
                .hover-lift { transition: transform 0.2s ease; }
                .hover-lift:hover { transform: translateY(-5px); }
                .transition-all { transition: all 0.3s ease; }
                .ls-1 { letter-spacing: 1px; }
            `}</style>
        </div>
    );
};

export default LandingPage;
