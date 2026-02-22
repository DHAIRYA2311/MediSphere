import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    User, Activity, HeartPulse, FileText,
    CheckCircle, BedDouble, ArrowLeft,
    Clock, Calendar, Shield, Save,
    Download, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import PremiumSelect from '../components/PremiumSelect';

const WalkInConsultation = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [appointment, setAppointment] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [prescription, setPrescription] = useState("");
    const [vitals, setVitals] = useState({ bp: '', temp: '', pulse: '', weight: '' });
    const [freeBeds, setFreeBeds] = useState([]);
    const [selectedBed, setSelectedBed] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        fetchDetails();
        fetchFreeBeds();
    }, [id]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const res = await api.get(`appointments/get_details.php?id=${id}`);
            if (res.status === 'success') {
                setAppointment(res.data);
            } else {
                alert(res.message);
                navigate('/appointments');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchFreeBeds = async () => {
        const res = await api.get('beds/list_free.php');
        if (res.status === 'success') {
            setFreeBeds(res.data);
        }
    };

    const generatePDF = async (shouldUpload = false) => {
        setIsGenerating(true);
        try {
            const doc = new jsPDF();
            // Branding
            doc.setFontSize(22); doc.setTextColor(40, 40, 40);
            doc.text("Medisphere Hospital", 105, 20, null, null, "center");
            doc.setFontSize(12); doc.text("123 Health Avenue, Medicity", 105, 28, null, null, "center");
            doc.line(20, 35, 190, 35);

            // Title
            doc.setFontSize(16); doc.text("WALK-IN CONSULTATION SLIP", 105, 50, null, null, "center");

            // Details
            doc.setFontSize(11);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 65);
            doc.text(`Patient: ${appointment.patient_fname} ${appointment.patient_lname}`, 20, 72);
            doc.text(`Doctor: ${user.name}`, 130, 72);
            doc.text(`Weight: ${vitals.weight || 'N/A'} kg | BP: ${vitals.bp || 'N/A'} | Temp: ${vitals.temp || 'N/A'}°C`, 20, 80);

            // Content
            doc.setFontSize(12); doc.text("Consultation Notes / Rx:", 20, 95);
            doc.setFont("helvetica", "normal");
            const splitText = doc.splitTextToSize(prescription || "None shared", 170);
            doc.text(splitText, 20, 105);

            // Footer
            doc.setFontSize(10); doc.text("This is a digitally generated document.", 105, 280, null, null, "center");

            if (shouldUpload) {
                const pdfBlob = doc.output('blob');
                const formData = new FormData();
                formData.append('patient_id', appointment.patient_id);
                formData.append('appointment_id', id);
                formData.append('type', 'Prescription');
                formData.append('file', pdfBlob, `Prescription_WalkIn_${id}.pdf`);

                const token = localStorage.getItem('token');
                await fetch('http://localhost:8080/Medisphere-Project/backend/api/documents/upload.php', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
            } else {
                doc.save(`Prescription_${appointment.patient_lname}.pdf`);
            }
        } catch (e) { console.error("PDF error", e); }
        finally { setIsGenerating(false); }
    };

    const generateBillPDF = async (shouldUpload = false) => {
        setIsGenerating(true);
        try {
            const doc = new jsPDF();
            doc.setFontSize(22); doc.setTextColor(40, 40, 40);
            doc.text("Medisphere Hospital", 105, 20, null, null, "center");
            doc.setFontSize(10); doc.text("OFFICIAL INVOICE", 105, 28, null, null, "center");
            doc.line(20, 35, 190, 35);

            doc.setFontSize(11);
            doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 20, 50);
            doc.text(`Patient: ${appointment.patient_fname} ${appointment.patient_lname}`, 20, 57);
            doc.text(`Appointment ID: #${id}`, 140, 50);
            doc.text(`Payment Status: PAID`, 140, 57);

            doc.setFillColor(245, 245, 245);
            doc.rect(20, 70, 170, 10, 'F');
            doc.setFontSize(12); doc.setTextColor(0);
            doc.text("Description", 25, 77); doc.text("Amount", 160, 77);
            doc.text("Consultation Fee (Walk-in)", 25, 95); doc.text("$80.00", 160, 95);

            doc.line(20, 110, 190, 110);
            doc.setFontSize(14); doc.text("Total Paid:", 120, 120); doc.text("$80.00", 160, 120);
            doc.setFontSize(10); doc.setTextColor(100);
            doc.text("Thank you for choosing Medisphere.", 105, 150, null, null, "center");

            if (shouldUpload) {
                const pdfBlob = doc.output('blob');
                const formData = new FormData();
                formData.append('patient_id', appointment.patient_id);
                formData.append('appointment_id', id);
                formData.append('type', 'Invoices');
                formData.append('file', pdfBlob, `Bill_WalkIn_${id}.pdf`);

                const token = localStorage.getItem('token');
                await fetch('http://localhost:8080/Medisphere-Project/backend/api/documents/upload.php', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
            } else {
                doc.save(`Invoice_${id}.pdf`);
            }
        } catch (e) { console.error("Bill PDF error", e); }
        finally { setIsGenerating(false); }
    };

    const handleComplete = async () => {
        if (isSubmitting) return;
        if (!prescription.trim()) {
            if (!window.confirm("No notes entered. Complete without notes?")) return;
        }
        setIsSubmitting(true);
        try {
            await Promise.all([generatePDF(true), generateBillPDF(true)]);
            const res = await api.post('appointments/complete.php', {
                appointment_id: id,
                notes: prescription
            });
            if (res.status === 'success') {
                alert("Consultation Completed! Bill and Prescription generated.");
                navigate('/appointments');
            } else {
                alert(res.message);
                setIsSubmitting(false);
            }
        } catch (err) {
            alert("Error saving consultation");
            setIsSubmitting(false);
        }
    };

    const handleAdmit = async () => {
        if (!selectedBed) return alert("Select a bed first.");
        setIsSubmitting(true);
        try {
            const res = await api.post('beds/admit.php', {
                patient_id: appointment.patient_id,
                bed_id: selectedBed,
                appointment_id: id
            });
            if (res.status === 'success') {
                alert("Patient Admit successful.");
                navigate('/appointments');
            } else {
                alert(res.message);
            }
        } catch (err) {
            alert("Error in admission");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="spinner-border text-primary"></div>
        </div>
    );

    return (
        <div className="bg-light min-vh-100 p-4">
            <div className="container-fluid max-w-7xl mx-auto">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <button onClick={() => navigate(-1)} className="btn btn-link text-decoration-none text-muted d-flex align-items-center gap-2 p-0">
                        <ArrowLeft size={20} /> Back
                    </button>
                    <div className="text-end">
                        <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 border border-success border-opacity-25">
                            Active Consultation Room
                        </span>
                    </div>
                </div>

                <div className="row g-4">
                    {/* Left Panel: Patient Details */}
                    <div className="col-lg-4">
                        <div className="card-enterprise border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: '20px' }}>
                            <div className="text-center mb-4">
                                <div className="rounded-circle bg-primary bg-opacity-10 text-primary mx-auto d-flex align-items-center justify-content-center fw-bold shadow-sm mb-3" style={{ width: 80, height: 80, fontSize: '2rem' }}>
                                    {appointment.patient_fname ? appointment.patient_fname[0] : ''}{appointment.patient_lname ? appointment.patient_lname[0] : ''}
                                </div>
                                <h4 className="fw-bold text-dark mb-1">{appointment.patient_fname} {appointment.patient_lname}</h4>
                                <p className="text-muted small">ID: #{appointment.patient_id} | {appointment.gender}, Age: {new Date().getFullYear() - new Date(appointment.dob).getFullYear()}</p>
                            </div>

                            <hr className="opacity-10" />

                            <div className="row g-3 mb-4">
                                <div className="col-6">
                                    <div className="small text-muted mb-1">Blood Group</div>
                                    <div className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-10">{appointment.blood_group}</div>
                                </div>
                                <div className="col-6 text-end">
                                    <div className="small text-muted mb-1">Insurance</div>
                                    <div className="small fw-bold text-dark">{appointment.insurance_number || 'None'}</div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="small text-muted mb-2 d-flex align-items-center gap-1 font-monospace ">
                                    <FileText size={14} /> MEDICAL HISTORY
                                </div>
                                <div className="bg-light p-3 rounded-3 small text-muted" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                    {appointment.medical_history || 'No previous medical history recorded.'}
                                </div>
                            </div>

                            <div className="p-3 bg-primary bg-opacity-5 rounded-4 border border-primary border-opacity-10">
                                <h6 className="fw-bold text-primary small mb-3 d-flex align-items-center gap-2">
                                    <Shield size={16} /> PATIENT VITALS
                                </h6>
                                <div className="row g-2">
                                    <div className="col-6">
                                        <input type="text" className="form-control form-control-sm border-0 bg-white" placeholder="BP (120/80)" value={vitals.bp} onChange={e => setVitals({ ...vitals, bp: e.target.value })} />
                                    </div>
                                    <div className="col-6">
                                        <input type="text" className="form-control form-control-sm border-0 bg-white" placeholder="Temp (°C)" value={vitals.temp} onChange={e => setVitals({ ...vitals, temp: e.target.value })} />
                                    </div>
                                    <div className="col-6">
                                        <input type="text" className="form-control form-control-sm border-0 bg-white" placeholder="Pulse (bpm)" value={vitals.pulse} onChange={e => setVitals({ ...vitals, pulse: e.target.value })} />
                                    </div>
                                    <div className="col-6">
                                        <input type="text" className="form-control form-control-sm border-0 bg-white" placeholder="Weight (kg)" value={vitals.weight} onChange={e => setVitals({ ...vitals, weight: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Consultation */}
                    <div className="col-lg-8">
                        <div className="card-enterprise border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                            <div className="bg-white p-4 border-bottom d-flex justify-content-between align-items-center">
                                <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                                    <Activity size={22} className="text-primary" /> Examination & Prescription
                                </h5>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-outline-primary btn-sm rounded-pill px-3" onClick={generatePDF}>
                                        <Download size={14} className="me-1" /> Preview Slip
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <textarea
                                    className="form-control border-0 bg-light p-4 rounded-4 shadow-inner"
                                    rows="12"
                                    placeholder="Enter your observation, diagnosis, and medications here..."
                                    style={{ fontSize: '1.1rem', resize: 'none' }}
                                    value={prescription}
                                    onChange={e => setPrescription(e.target.value)}
                                ></textarea>
                                <div className="mt-3 text-muted small d-flex align-items-center gap-2">
                                    <AlertCircle size={14} /> Notes will be saved to patient documents as a PDF.
                                </div>
                            </div>
                        </div>

                        <div className="row g-4">
                            {/* Admission Option */}
                            <div className="col-md-6">
                                <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white border-start border-danger border-4">
                                    <h6 className="fw-bold text-danger mb-3 d-flex align-items-center gap-2">
                                        <BedDouble size={20} /> Inpatient Admission (IPD)
                                    </h6>
                                    <p className="small text-muted mb-4">Transfer patient to a ward if immediate clinical monitoring is required.</p>
                                    <div className="mb-4">
                                        <PremiumSelect
                                            label="Select Priority Bed"
                                            name="bed_id"
                                            value={selectedBed}
                                            onChange={(e) => setSelectedBed(e.target.value)}
                                            options={freeBeds.map(b => ({
                                                value: b.bed_id,
                                                label: `${b.ward_name} - ${b.bed_number}`
                                            }))}
                                            placeholder="-- Choose Priority Bed --"
                                        />
                                    </div>
                                    <button className="btn btn-outline-danger w-100 py-2 rounded-pill fw-bold" onClick={handleAdmit} disabled={isSubmitting || !selectedBed}>
                                        {isSubmitting ? 'Transferring...' : 'Transfer to IPD'}
                                    </button>
                                </div>
                            </div>

                            {/* Complete Option */}
                            <div className="col-md-6">
                                <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white border-start border-success border-4">
                                    <h6 className="fw-bold text-success mb-3 d-flex align-items-center gap-2">
                                        <CheckCircle size={20} /> Outpatient Complete (OPD)
                                    </h6>
                                    <p className="small text-muted mb-4">Complete visit, release patient, and generate the final bill for the counter.</p>
                                    <button className="btn btn-success w-100 py-2 rounded-pill fw-bold shadow-sm" onClick={handleComplete} disabled={isSubmitting}>
                                        {isSubmitting ? 'Finalizing...' : 'Complete & Print Bill'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .card-enterprise {
                    background: white;
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .shadow-inner {
                    box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.05);
                }
                input:focus, textarea:focus {
                    background: #fff !important;
                    box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25) !important;
                }
            `}</style>
        </div>
    );
};

export default WalkInConsultation;
