import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import { Calendar, User, Video, CheckCircle, BedDouble, FileText, Activity, Plus, Clock, MessageSquare, Trash2, Edit3, Eye, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TableSkeleton } from '../components/Skeleton';
import PremiumSelect from '../components/PremiumSelect';

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
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);
    const [newApptData, setNewApptData] = useState({
        patient_id: '',
        doctor_id: '',
        date: '',
        time: '',
        method: 'Online',
        notes: ''
    });
    const navigate = useNavigate();

    const isStaff = ['admin', 'receptionist', 'staff'].includes(user?.role?.toLowerCase());
    const isDoctor = user?.role?.toLowerCase() === 'doctor';
    const isPatient = user?.role?.toLowerCase() === 'patient';


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

    const handleDeleteAppt = async (apptId) => {
        if (!window.confirm("Are you sure you want to delete this appointment? This action cannot be undone.")) return;
        try {
            const res = await api.post('appointments/delete.php', { appointment_id: apptId });
            if (res.status === 'success') {
                alert("Appointment deleted successfully.");
                fetchAppointments();
            } else {
                alert(res.message);
            }
        } catch (err) {
            alert("Failed to delete appointment.");
        }
    };

    const handleStatusUpdate = async (apptId, newStatus) => {
        setStatusLoading(true);
        try {
            const res = await api.post('appointments/update_status.php', {
                appointment_id: apptId,
                status: newStatus
            });
            if (res.status === 'success') {
                setShowStatusModal(false);
                fetchAppointments();
            } else {
                alert(res.message);
            }
        } catch (err) {
            alert("Failed to update status.");
        } finally {
            setStatusLoading(false);
        }
    };

    const isToday = (dateStr) => {
        const today = new Date();
        const apptDate = new Date(dateStr);
        return today.getFullYear() === apptDate.getFullYear() &&
            today.getMonth() === apptDate.getMonth() &&
            today.getDate() === apptDate.getDate();
    };

    const calculateAge = (dob) => {
        if (!dob) return 'N/A';
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
    };

    const PatientHoverCard = ({ row }) => (
        <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            className="position-absolute bg-white shadow-xl rounded-4 p-3 border border-light"
            style={{
                zIndex: 9999,
                width: '300px',
                top: '-10px',
                left: '100%',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
        >
            <div className="d-flex align-items-center gap-3 mb-3 border-bottom pb-2">
                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 45, height: 45 }}>
                    {row.patient_fname?.charAt(0)}
                </div>
                <div>
                    <h6 className="mb-0 fw-bold">{row.patient_fname} {row.patient_lname}</h6>
                    <small className="text-muted">ID: #P-{row.patient_id}</small>
                </div>
            </div>

            <div className="row g-2 small text-muted">
                <div className="col-6">
                    <div className="fw-bold text-dark">Age</div>
                    <div>{calculateAge(row.patient_dob)} Years</div>
                </div>
                <div className="col-6 text-end">
                    <div className="fw-bold text-dark">Gender</div>
                    <div>{row.patient_gender}</div>
                </div>
                <div className="col-6">
                    <div className="fw-bold text-dark">Blood Group</div>
                    <div className="text-danger fw-bold">{row.patient_blood_group || 'N/A'}</div>
                </div>
                <div className="col-6 text-end">
                    <div className="fw-bold text-dark">Phone</div>
                    <div>{row.patient_phone}</div>
                </div>
            </div>

            <div className="mt-3 pt-2 border-top text-center">
                <Link to={`/patients/${row.patient_id}`} className="btn btn-sm btn-light w-100 rounded-pill fw-bold text-primary">
                    Open Full Profile
                </Link>
            </div>
        </motion.div>
    );

    const PatientCell = ({ row }) => {
        const [isHovered, setIsHovered] = useState(false);
        return (
            <div
                className="position-relative d-inline-block"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="d-flex align-items-center gap-2">
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                        {row.patient_fname?.charAt(0)}
                    </div>
                    <div>
                        <Link
                            to={`/patients/${row.patient_id}`}
                            className="fw-semibold text-dark text-decoration-none hover-primary transition-all"
                        >
                            {row.patient_fname} {row.patient_lname}
                        </Link>
                        <div className="small text-muted" style={{ fontSize: '0.7rem' }}>{row.patient_gender} • {calculateAge(row.patient_dob)}y</div>
                    </div>
                </div>
                <AnimatePresence>
                    {isHovered && <PatientHoverCard row={row} />}
                </AnimatePresence>
            </div>
        );
    };

    const columns = [
        {
            key: 'appointment_date',
            label: 'Date & Time',
            sortable: true,
            render: (row) => (
                <div>
                    <div className="fw-bold text-dark">{new Date(row.appointment_date).toDateString()}</div>
                    <div className="small text-muted">{row.appointment_time}</div>
                </div>
            )
        },
        {
            key: 'patient_info',
            label: 'Patient',
            hidden: isPatient,
            render: (row) => <PatientCell row={row} />
        },
        {
            key: 'doctor_info',
            label: 'Assigned Doctor',
            hidden: isDoctor,
            render: (row) => (
                <div className="d-flex align-items-center gap-2">
                    <div className="bg-success rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                        {row.doctor_fname?.charAt(0)}
                    </div>
                    <div>
                        <div className="fw-semibold text-dark">
                            Dr. {row.doctor_fname} {row.doctor_lname}
                        </div>
                        <div className="small text-muted" style={{ fontSize: '0.7rem' }}>{row.specialization}</div>
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
                    <span className={`badge ${row.booking_method === 'Online' ? 'bg-info bg-opacity-10 text-info' : 'bg-secondary bg-opacity-10 text-secondary'} border border-opacity-10 w-fit`}>
                        {row.booking_method}
                    </span>
                    {/* VIDEO CALL LINK - Only show today */}
                    {row.booking_method === 'Online' && (row.status === 'Confirmed' || row.status === 'Pending') && row.meeting_code && isToday(row.appointment_date) && (
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
            render: (row) => (
                <span className={`badge ${row.status === 'Confirmed' ? 'bg-primary bg-opacity-10 text-primary' :
                    row.status === 'Completed' ? 'bg-success bg-opacity-10 text-success' :
                        'bg-danger bg-opacity-10 text-danger'
                    } rounded-pill px-3 py-1`}>
                    {row.status}
                </span>
            )
        }
    ];

    const actions = [];

    if (isDoctor || isStaff) {
        actions.push({
            label: 'Change Status',
            icon: Edit3,
            onClick: (row) => {
                setSelectedAppt(row);
                setShowStatusModal(true);
            },
            className: 'text-primary'
        });
        actions.push({
            label: 'View Patient',
            icon: Eye,
            onClick: (row) => navigate(`/patients/${row.patient_id}`),
            className: 'text-info'
        });
        if (isStaff) {
            actions.push({
                label: 'Delete Appointment',
                icon: Trash2,
                onClick: (row) => handleDeleteAppt(row.appointment_id),
                className: 'text-danger'
            });
        }
    } else {
        // Patient Actions
        actions.push({
            label: 'View Bill',
            icon: FileText,
            onClick: () => { },
            className: (row) => row.status === 'Completed' ? 'text-dark' : 'd-none'
        });
    }

    return (
        <div className="container-fluid py-4 fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark">{isDoctor ? 'My Assessments' : 'Medical History'}</h2>
                    <p className="text-muted">{isDoctor ? 'Manage patient consultations' : 'Track your health records'}</p>
                </div>
                {!isDoctor && (
                    <button className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-4 shadow-sm" onClick={handleNewApptClick}>
                        <Plus size={18} /> Book Appointment
                    </button>
                )}
            </div>

            {loading ? (
                <TableSkeleton rows={8} cols={4} />
            ) : (
                <DataTable
                    title={isDoctor ? "Upcoming Appointments" : "History"}
                    columns={columns}
                    data={appointments}
                    actions={actions}
                    keyField="appointment_id"
                />
            )}

            {/* Consultation Modal */}
            <AnimatePresence>
                {modalMode === 'consult' && selectedAppt && (
                    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="modal-dialog modal-dialog-centered modal-lg"
                        >
                            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                                <div className="modal-header border-bottom-0 bg-light p-4">
                                    <h5 className="modal-title fw-bold">
                                        Consultation: {selectedAppt.patient_fname} {selectedAppt.patient_lname}
                                    </h5>
                                    <button type="button" className="btn-close" onClick={() => setModalMode(null)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="alert alert-info d-flex align-items-center gap-2 mb-4">
                                        <CheckCircle size={18} />
                                        <small>Complete the consultation below. Choose to finish as Outpatient (OPD) or Admit (IPD).</small>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label small fw-bold text-muted">Consultation Notes / Diagnosis</label>
                                        <textarea
                                            className="form-control bg-light border-0 p-3"
                                            rows="5"
                                            placeholder="Enter symptoms, diagnosis, and prescription notes..."
                                            value={consultNotes}
                                            onChange={(e) => setConsultNotes(e.target.value)}
                                        ></textarea>
                                    </div>

                                    <div className="row g-3">
                                        {/* IPD Section */}
                                        <div className="col-md-6 border-end pe-md-4">
                                            <h6 className="fw-bold text-danger mb-3 d-flex align-items-center gap-2">
                                                <BedDouble size={18} /> Inpatient Admission (IPD)
                                            </h6>
                                            <div className="mb-3 d-flex flex-column text-start">
                                                <PremiumSelect
                                                    label="Select Ward / Bed"
                                                    name="bed_id"
                                                    value={selectedBed}
                                                    onChange={(e) => setSelectedBed(e.target.value)}
                                                    options={freeBeds.map(bed => ({
                                                        value: bed.bed_id,
                                                        label: `${bed.ward_name} - Bed ${bed.bed_number}`
                                                    }))}
                                                    placeholder="-- Choose Available Bed --"
                                                    disabled={freeBeds.length === 0}
                                                />
                                                {freeBeds.length === 0 && <small className="text-danger d-block mt-1">No beds available!</small>}
                                            </div>
                                            <button
                                                className="btn btn-outline-danger w-100"
                                                onClick={handleAdmitIPD}
                                                disabled={isSubmitting || !selectedBed}
                                            >
                                                Admit to Ward
                                            </button>
                                        </div>

                                        {/* OPD Section */}
                                        <div className="col-md-6 ps-md-4 d-flex flex-column justify-content-between">
                                            <h6 className="fw-bold text-success mb-3 d-flex align-items-center gap-2">
                                                <CheckCircle size={18} /> Outpatient Complete (OPD)
                                            </h6>
                                            <p className="small text-muted mb-4">
                                                Mark assessment as complete. An OPD invoice will be auto-generated for the patient.
                                            </p>
                                            <button
                                                className="btn btn-primary w-100 py-2"
                                                onClick={handleCompleteOPD}
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? 'Processing...' : 'Finish & Generate Bill'}
                                            </button>
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
                    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                                <form onSubmit={handleBookAppt}>
                                    <div className="modal-header border-bottom-0 bg-primary text-white p-4">
                                        <h5 className="modal-title fw-bold">Schedule New Appointment</h5>
                                        <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddAppt(false)}></button>
                                    </div>
                                    <div className="modal-body p-4">
                                        {(isStaff || isDoctor) && (
                                            <div className="mb-4 d-flex flex-column">
                                                <PremiumSelect
                                                    label="Select Patient"
                                                    name="patient_id"
                                                    value={newApptData.patient_id}
                                                    onChange={(e) => setNewApptData({ ...newApptData, patient_id: e.target.value })}
                                                    options={allPatients.map(p => ({
                                                        value: p.patient_id,
                                                        label: `${p.first_name} ${p.last_name} (ID: ${p.patient_id}) - ${p.email}`
                                                    }))}
                                                    placeholder="Search Patient..."
                                                />
                                            </div>
                                        )}

                                        <div className="mb-4 d-flex flex-column">
                                            <PremiumSelect
                                                label="Select Specialist"
                                                name="doctor_id"
                                                value={newApptData.doctor_id}
                                                onChange={(e) => setNewApptData({ ...newApptData, doctor_id: e.target.value })}
                                                options={doctors.map(d => ({
                                                    value: d.doctor_id,
                                                    label: `Dr. ${d.first_name} ${d.last_name} (${d.specialization})`
                                                }))}
                                                placeholder="Search Specialist..."
                                            />
                                        </div>

                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted"><Calendar size={14} className="me-1" /> Date</label>
                                                <input
                                                    type="date"
                                                    className="form-control bg-light border-0"
                                                    value={newApptData.date}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    onChange={(e) => setNewApptData({ ...newApptData, date: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold text-muted"><Clock size={14} className="me-1" /> Time</label>
                                                <input
                                                    type="time"
                                                    className="form-control bg-light border-0"
                                                    value={newApptData.time}
                                                    onChange={(e) => setNewApptData({ ...newApptData, time: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted">Consultation Mode</label>
                                            <div className="d-flex gap-3 mt-1">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="radio" name="method" id="online" value="Online"
                                                        checked={newApptData.method === 'Online'} onChange={(e) => setNewApptData({ ...newApptData, method: e.target.value })} />
                                                    <label className="form-check-label small" htmlFor="online">Online / Video</label>
                                                </div>
                                                <div className="form-check">
                                                    <input className="form-check-input" type="radio" name="method" id="walkin" value="Walk-in"
                                                        checked={newApptData.method === 'Walk-in'} onChange={(e) => setNewApptData({ ...newApptData, method: e.target.value })} />
                                                    <label className="form-check-label small" htmlFor="walkin">In-Person / Walk-in</label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-0">
                                            <label className="form-label small fw-bold text-muted"><MessageSquare size={14} className="me-1" /> Symptoms / Notes</label>
                                            <textarea
                                                className="form-control bg-light border-0"
                                                rows="3"
                                                value={newApptData.notes}
                                                onChange={(e) => setNewApptData({ ...newApptData, notes: e.target.value })}
                                                placeholder="Briefly describe your health concern..."
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="modal-footer border-top-0 p-4 pt-0">
                                        <button type="submit" className="btn btn-primary w-100 py-3 rounded-pill fw-bold" disabled={isSubmitting}>
                                            {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Status Update Modal */}
            <AnimatePresence>
                {showStatusModal && selectedAppt && (
                    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="modal-dialog modal-dialog-centered modal-sm">
                            <div className="modal-content border-0 shadow-lg rounded-4">
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="fw-bold mb-0 small text-uppercase text-muted ls-1">Update Status</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowStatusModal(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <p className="small text-muted mb-3">Change status for appointment on <b>{selectedAppt.appointment_date}</b></p>
                                    <div className="d-flex flex-column gap-2">
                                        {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map(status => (
                                            <button
                                                key={status}
                                                className={`btn btn-sm py-2 rounded-3 text-start px-3 d-flex align-items-center justify-content-between ${selectedAppt.status === status ? 'btn-primary' : 'btn-light'}`}
                                                disabled={statusLoading}
                                                onClick={() => handleStatusUpdate(selectedAppt.appointment_id, status)}
                                            >
                                                {status}
                                                {selectedAppt.status === status && <CheckCircle size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyAppointments;
