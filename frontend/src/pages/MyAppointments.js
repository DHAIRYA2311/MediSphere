import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import { Calendar, User, Video, CheckCircle, BedDouble, FileText, Activity } from 'lucide-react';
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

    const isDoctor = user?.role === 'doctor';

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
                    <div className="small text-muted">{row.appointment_time}</div>
                </div>
            )
        },
        {
            key: isDoctor ? 'patient_lname' : 'doctor_lname',
            label: isDoctor ? 'Patient' : 'Doctor',
            sortable: true,
            render: (row) => (
                <div className="d-flex align-items-center gap-2">
                    <div className={`rounded-circle d-flex align-items-center justify-content-center text-white fw-bold ${isDoctor ? 'bg-primary' : 'bg-success'}`} style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                        {isDoctor ? row.patient_fname?.charAt(0) : row.doctor_fname?.charAt(0)}
                    </div>
                    <div>
                        <div className="fw-semibold text-dark">
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
                    <span className={`badge ${row.booking_method === 'Online' ? 'bg-info bg-opacity-10 text-info' : 'bg-secondary bg-opacity-10 text-secondary'} border border-opacity-10 w-fit`}>
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

    // Doctor Actions
    if (isDoctor) {
        // Keep empty for now or add other doctor actions
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
                                            <div className="mb-3">
                                                <label className="form-label small text-muted">Select Ward / Bed</label>
                                                <select
                                                    className="form-select bg-light border-0"
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
        </div>
    );
};

export default MyAppointments;
