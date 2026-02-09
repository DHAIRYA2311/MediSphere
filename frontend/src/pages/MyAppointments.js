import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import { Calendar, User, Video, CheckCircle, BedDouble, FileText, Activity, Plus, Clock, MessageSquare, XCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TableSkeleton } from '../components/Skeleton';

const MyAppointments = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [modalMode, setModalMode] = useState(null); // 'consult' or 'admit'
    const [consultNotes, setConsultNotes] = useState('');
    const [freeBeds, setFreeBeds] = useState([]);
    const [selectedBed, setSelectedBed] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAddAppt, setShowAddAppt] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [allPatients, setAllPatients] = useState([]);
    const [newApptData, setNewApptData] = useState({
        patient_id: '',
        doctor_id: '',
        date: '',
        time: '',
        method: 'Online',
        notes: ''
    });

    const isStaff = ['admin', 'receptionist', 'staff'].includes(user?.role?.toLowerCase());
    const isDoctor = user?.role?.toLowerCase() === 'doctor';



    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        setLoading(true);
        const res = await api.get('appointments/list.php');
        if (res.status === 'success') {
            setAppointments(res.data);
        }
        setLoading(false);
    };

    const fetchDoctors = async () => {
        const res = await api.get('doctors/list.php');
        if (res.status === 'success') setDoctors(res.data);
    };

    const fetchAllPatients = async () => {
        if (!isStaff && !isDoctor) return;
        const res = await api.get('patients/list.php');
        if (res.status === 'success') setAllPatients(res.data);
    };

    const handleNewApptClick = () => {
        fetchDoctors();
        if (isStaff || isDoctor) fetchAllPatients();

        // Reset form
        setNewApptData({
            patient_id: '',
            doctor_id: '',
            date: new Date().toISOString().split('T')[0],
            time: '10:00',
            method: 'Online',
            notes: ''
        });
        setShowAddAppt(true);
    };

    const handleBookAppt = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.post('appointments/book.php', newApptData);
            if (res.status === 'success') {
                alert("Appointment booked successfully!");
                setShowAddAppt(false);
                fetchAppointments();
            } else {
                alert(res.message);
            }
        } catch (err) {
            alert("Failed to book appointment");
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchFreeBeds = async () => {
        const res = await api.get('beds/list_free.php');
        if (res.status === 'success') {
            setFreeBeds(res.data);
        }
    };

    const handleConsultClick = (appt) => {
        setSelectedAppt(appt);
        setConsultNotes(appt.notes || '');
        setModalMode('consult');
        fetchFreeBeds(); // Pre-fetch in case they want to admit
    };

    const handleCompleteOPD = async () => {
        if (!consultNotes) {
            alert("Please enter consultation notes.");
            return;
        }
        if (!window.confirm("Complete consultation and generate OPD Bill?")) return;

        setIsSubmitting(true);
        try {
            const res = await api.post('appointments/complete.php', {
                appointment_id: selectedAppt.appointment_id,
                notes: consultNotes
            });
            if (res.status === 'success') {
                alert("Consultation completed successfully! Bill generated.");
                setModalMode(null);
                fetchAppointments();
            } else {
                alert(res.message);
            }
        } catch (err) {
            alert("Error completing appointment");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAdmitIPD = async () => {
        if (!selectedBed) {
            alert("Please select a bed.");
            return;
        }
        if (!window.confirm("Admit patient to ward and start IPD Billing?")) return;

        setIsSubmitting(true);
        try {
            const res = await api.post('beds/admit.php', {
                patient_id: selectedAppt.patient_id,
                bed_id: selectedBed,
                appointment_id: selectedAppt.appointment_id
            });
            if (res.status === 'success') {
                alert("Patient admitted to ward successfully!");
                setModalMode(null);
                fetchAppointments();
            } else {
                alert(res.message);
            }
        } catch (err) {
            alert("Error admitting patient");
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = [
        {
            key: 'appointment_date',
            label: 'Date & Time',
            sortable: true,
            render: (row) => (
                <div>
                    <div className="fw-bold text-dark">{new Date(row.appointment_date).toDateString()}</div>
                    <div className="small text-muted d-flex align-items-center gap-1">
                        <Clock size={12} /> {row.appointment_time}
                    </div>
                </div>
            )
        },
        {
            key: isDoctor ? 'patient_lname' : 'doctor_lname',
            label: isDoctor ? 'Patient' : 'Doctor',
            sortable: true,
            render: (row) => (
                <div className="d-flex align-items-center gap-2">
                    <div className={`rounded-circle d-flex align-items-center justify-content-center text-white fw-bold ${isDoctor ? 'bg-primary' : 'bg-success'}`} style={{ width: 40, height: 40, fontSize: '1rem' }}>
                        {isDoctor ? row.patient_fname?.charAt(0) : row.doctor_fname?.charAt(0)}
                    </div>
                    <div>
                        <div className="fw-bold text-dark">
                            {isDoctor ? `${row.patient_fname} ${row.patient_lname}` : `Dr. ${row.doctor_fname} ${row.doctor_lname}`}
                        </div>
                        {!isDoctor && <div className="small text-muted">{row.specialization}</div>}
                    </div>
                </div>
            )
        },
        {
            key: 'booking_method',
            label: 'Type',
            sortable: true,
            render: (row) => (
                <div className="d-flex flex-column gap-1">
                    <span className={`badge ${row.booking_method === 'Online' ? 'bg-info bg-opacity-10 text-info' : 'bg-secondary bg-opacity-10 text-secondary'} border border-opacity-25 w-fit`}>
                        {row.booking_method === 'Online' ? <Video size={12} className="me-1" /> : <User size={12} className="me-1" />}
                        {row.booking_method}
                    </span>
                    {/* VIDEO CALL LINK */}
                    {row.booking_method === 'Online' && (row.status === 'Confirmed' || row.status === 'Pending') && row.meeting_code && (
                        <Link
                            to={`/consultation/${row.meeting_code}`}
                            className="btn btn-sm btn-outline-primary py-0 px-2 rounded-pill mt-1"
                            style={{ fontSize: '0.75rem' }}
                            target="_blank"
                        >
                            <Video size={12} className="me-1" /> Join Video
                        </Link>
                    )}
                    {/* WALK-IN CONSULTATION LINK */}
                    {row.booking_method === 'Walk-in' && (row.status === 'Confirmed' || row.status === 'Pending') && isDoctor && (
                        <Link
                            to={`/walk-in-consultation/${row.appointment_id}`}
                            className="btn btn-sm btn-outline-success py-0 px-2 rounded-pill mt-1 text-decoration-none"
                            style={{ fontSize: '0.75rem' }}
                        >
                            <Activity size={12} className="me-1" /> Start Consultation
                        </Link>
                    )}
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (row) => {
                let color = 'secondary';
                if (row.status === 'Confirmed') color = 'primary';
                if (row.status === 'Completed') color = 'success';
                if (row.status === 'Cancelled') color = 'danger';
                if (row.status === 'Pending') color = 'warning';

                return (
                    <span className={`badge bg-${color} bg-opacity-10 text-${color} border border-${color} border-opacity-25 rounded-pill px-3 py-2`}>
                        {row.status}
                    </span>
                );
            }
        }
    ];

    const actions = [];

    // Doctor Actions
    if (isDoctor) {
        actions.push({
            label: 'Consult',
            icon: Activity,
            onClick: handleConsultClick,
            className: (row) => row.status === 'Completed' ? 'd-none' : 'text-primary'
        });
    } else {
        // Patient Actions
        actions.push({
            label: 'View Bill',
            icon: FileText,
            onClick: () => { },
            className: (row) => row.status === 'Completed' ? 'text-dark' : 'd-none'
        });
    }

    // Stats
    const totalAppt = appointments.length;
    const upcoming = appointments.filter(a => a.status === 'Confirmed' || a.status === 'Pending').length;
    const completed = appointments.filter(a => a.status === 'Completed').length;
    const cancelled = appointments.filter(a => a.status === 'Cancelled').length;

    // Stat Card
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
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--text-main)' }}>{isDoctor ? 'My Assessments' : 'Medical History'}</h2>
                    <p className="text-muted mb-0">{isDoctor ? 'Manage patient consultations' : 'Track your health records and appointments'}</p>
                </div>
                {!isDoctor && (
                    <button className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-4 py-2 shadow-sm" onClick={handleNewApptClick}>
                        <Plus size={18} /> Book Appointment
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <StatCard icon={Calendar} title="Total Appointments" value={totalAppt} color="primary" />
                </div>
                <div className="col-md-3">
                    <StatCard icon={Clock} title="Upcoming" value={upcoming} color="warning" subtitle="Scheduled" />
                </div>
                <div className="col-md-3">
                    <StatCard icon={CheckCircle} title="Completed" value={completed} color="success" />
                </div>
                <div className="col-md-3">
                    <StatCard icon={XCircle} title="Cancelled" value={cancelled} color="danger" />
                </div>
            </div>

            {/* Table Card */}
            {loading ? (
                <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body p-4">
                        <TableSkeleton rows={8} cols={4} />
                    </div>
                </div>
            ) : (
                <DataTable
                    title={isDoctor ? "Upcoming Appointments" : "Appointment History"}
                    columns={columns}
                    data={appointments}
                    actions={actions}
                    keyField="appointment_id"
                />
            )}

            {/* Consultation Modal */}
            <AnimatePresence>
                {modalMode === 'consult' && selectedAppt && (
                    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.6)' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="modal-dialog modal-dialog-centered modal-lg"
                        >
                            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                                <div className="modal-header border-0 p-4" style={{ background: 'linear-gradient(135deg, #5eaab5 0%, #7fc4ce 100%)' }}>
                                    <div>
                                        <h5 className="modal-title fw-bold text-white mb-1">
                                            Consultation: {selectedAppt.patient_fname} {selectedAppt.patient_lname}
                                        </h5>
                                        <p className="text-white-50 mb-0 small">Perform diagnosis and choose course of action</p>
                                    </div>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setModalMode(null)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="alert alert-light border border-info border-opacity-25 d-flex align-items-center gap-2 mb-4 text-info bg-info bg-opacity-10 rounded-3">
                                        <AlertCircle size={18} />
                                        <small className="fw-semibold">Complete the consultation below. Choose to finish as Outpatient (OPD) or Admit (IPD).</small>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label small fw-bold text-muted">Consultation Notes / Diagnosis</label>
                                        <textarea
                                            className="form-control bg-light border-0 p-3 rounded-3"
                                            rows="5"
                                            placeholder="Enter symptoms, diagnosis, and prescription notes..."
                                            value={consultNotes}
                                            onChange={(e) => setConsultNotes(e.target.value)}
                                        ></textarea>
                                    </div>

                                    <div className="row g-4">
                                        {/* IPD Section */}
                                        <div className="col-md-6 border-end pe-md-4">
                                            <div className="p-3 bg-danger bg-opacity-10 rounded-3 h-100">
                                                <h6 className="fw-bold text-danger mb-3 d-flex align-items-center gap-2">
                                                    <BedDouble size={18} /> Inpatient Admission (IPD)
                                                </h6>
                                                <p className="small text-muted mb-3">Admit the patient to a ward if condition requires hospitalization.</p>
                                                <div className="mb-3">
                                                    <label className="form-label small text-muted fw-bold">Select Ward / Bed</label>
                                                    <select
                                                        className="form-select border-0 bg-white"
                                                        value={selectedBed}
                                                        onChange={(e) => setSelectedBed(e.target.value)}
                                                    >
                                                        <option value="">-- Select Available Bed --</option>
                                                        {freeBeds.map(bed => (
                                                            <option key={bed.bed_id} value={bed.bed_id}>
                                                                {bed.ward_name} - Bed {bed.bed_number}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {freeBeds.length === 0 && <small className="text-danger d-block mt-1 fw-bold">No beds available!</small>}
                                                </div>
                                                <button
                                                    className="btn btn-danger w-100 shadow-sm"
                                                    onClick={handleAdmitIPD}
                                                    disabled={isSubmitting || !selectedBed}
                                                >
                                                    Admit to Ward
                                                </button>
                                            </div>
                                        </div>

                                        {/* OPD Section */}
                                        <div className="col-md-6 ps-md-4">
                                            <div className="p-3 bg-success bg-opacity-10 rounded-3 h-100 d-flex flex-column justify-content-between">
                                                <div>
                                                    <h6 className="fw-bold text-success mb-3 d-flex align-items-center gap-2">
                                                        <CheckCircle size={18} /> Outpatient Complete (OPD)
                                                    </h6>
                                                    <p className="small text-muted mb-4">
                                                        Mark assessment as complete. Patient will be discharged immediately and an OPD invoice will be auto-generated.
                                                    </p>
                                                </div>
                                                <button
                                                    className="btn btn-success w-100 py-2 shadow-sm"
                                                    onClick={handleCompleteOPD}
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? 'Processing...' : 'Finish & Generate Bill'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* New Appointment Modal */}
            <AnimatePresence>
                {showAddAppt && (
                    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="modal-dialog modal-dialog-centered"
                        >
                            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                                <div className="modal-header border-bottom-0 p-4" style={{ background: 'linear-gradient(135deg, #5eaab5 0%, #7fc4ce 100%)' }}>
                                    <div>
                                        <h5 className="modal-title fw-bold text-white mb-1">Schedule Appointment</h5>
                                        <p className="text-white-50 mb-0 small">Book a new consultation with a doctor</p>
                                    </div>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddAppt(false)}></button>
                                </div>
                                <form onSubmit={handleBookAppt}>
                                    <div className="modal-body p-4">
                                        {(isStaff || isDoctor) && (
                                            <div className="mb-3">
                                                <label className="form-label small fw-bold text-muted text-uppercase">Select Patient</label>
                                                <select
                                                    className="form-select bg-light border-0 py-3 rounded-3"
                                                    value={newApptData.patient_id}
                                                    onChange={(e) => setNewApptData({ ...newApptData, patient_id: e.target.value })}
                                                    required
                                                    style={{ height: 'auto' }}
                                                >
                                                    <option value="">-- Choose Patient --</option>
                                                    {allPatients.map(p => (
                                                        <option key={p.patient_id} value={p.patient_id}>{p.first_name} {p.last_name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted text-uppercase">Select Doctor</label>
                                            <select
                                                className="form-select bg-light border-0 py-3 rounded-3"
                                                value={newApptData.doctor_id}
                                                onChange={(e) => setNewApptData({ ...newApptData, doctor_id: e.target.value })}
                                                required
                                                style={{ height: 'auto' }}
                                            >
                                                <option value="">-- Choose Doctor --</option>
                                                {doctors.map(d => (
                                                    <option key={d.doctor_id} value={d.doctor_id}>Dr. {d.first_name} {d.last_name} ({d.specialization})</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted text-uppercase"><Calendar size={14} className="me-1" /> Date</label>
                                                <input
                                                    type="date"
                                                    className="form-control bg-light border-0 py-3 rounded-3"
                                                    value={newApptData.date}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    onChange={(e) => setNewApptData({ ...newApptData, date: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted text-uppercase"><Clock size={14} className="me-1" /> Time</label>
                                                <input
                                                    type="time"
                                                    className="form-control bg-light border-0 py-3 rounded-3"
                                                    value={newApptData.time}
                                                    onChange={(e) => setNewApptData({ ...newApptData, time: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted text-uppercase">Consultation Mode</label>
                                            <div className="d-flex gap-2 mt-1">
                                                <div className="flex-grow-1">
                                                    <input
                                                        type="radio"
                                                        className="btn-check"
                                                        name="method"
                                                        id="online"
                                                        value="Online"
                                                        checked={newApptData.method === 'Online'}
                                                        onChange={(e) => setNewApptData({ ...newApptData, method: e.target.value })}
                                                    />
                                                    <label className={`btn w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 ${newApptData.method === 'Online' ? 'btn-primary' : 'btn-light text-muted'}`} htmlFor="online">
                                                        <Video size={16} /> Online / Video
                                                    </label>
                                                </div>
                                                <div className="flex-grow-1">
                                                    <input
                                                        type="radio"
                                                        className="btn-check"
                                                        name="method"
                                                        id="walkin"
                                                        value="Walk-in"
                                                        checked={newApptData.method === 'Walk-in'}
                                                        onChange={(e) => setNewApptData({ ...newApptData, method: e.target.value })}
                                                    />
                                                    <label className={`btn w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 ${newApptData.method === 'Walk-in' ? 'btn-success text-white' : 'btn-light text-muted'}`} htmlFor="walkin">
                                                        <Activity size={16} /> In-Person
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-0">
                                            <label className="form-label small fw-bold text-muted text-uppercase"><MessageSquare size={14} className="me-1" /> Symptoms / Notes</label>
                                            <textarea
                                                className="form-control bg-light border-0 py-3 rounded-3"
                                                rows="3"
                                                value={newApptData.notes}
                                                onChange={(e) => setNewApptData({ ...newApptData, notes: e.target.value })}
                                                placeholder="Briefly describe your health concern..."
                                                style={{ resize: 'none' }}
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="modal-footer border-top-0 p-4 pt-0">
                                        <button
                                            type="submit"
                                            className="btn w-100 py-3 rounded-pill fw-bold shadow-lg d-flex align-items-center justify-content-center gap-2"
                                            disabled={isSubmitting}
                                            style={{ background: 'linear-gradient(135deg, #1a3a4a 0%, #2d5a6e 100%)', border: 'none', color: '#fff' }}
                                        >
                                            {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyAppointments;
