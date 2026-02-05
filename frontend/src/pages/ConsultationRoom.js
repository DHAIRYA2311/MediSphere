import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PhoneOff, CreditCard, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';

const ConsultationRoom = () => {
    const { meetingCode } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const jitsiContainer = useRef(null);
    const [jitsiApi, setJitsiApi] = useState(null);

    // States
    const [isDoctorPresent, setIsDoctorPresent] = useState(false);
    const [statusMessage, setStatusMessage] = useState("Connecting to secure room...");
    const [showStopConfirm, setShowStopConfirm] = useState(false);
    const [prescription, setPrescription] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const isPatient = user && user.role.toLowerCase() === 'patient';
    const amIDoctor = user && user.role.toLowerCase() === 'doctor';

    // Helper: Doctor Check
    const checkIsDoctor = (displayName) => {
        return displayName && (displayName.startsWith("Dr.") || displayName.includes("(Doctor)"));
    };

    useEffect(() => {
        if (!user) return;
        if (window.jitsiAPIInstance) {
            window.jitsiAPIInstance.dispose();
            window.jitsiAPIInstance = null;
        }
        if (jitsiContainer.current) jitsiContainer.current.innerHTML = '';

        const loadJitsiScript = () => {
            if (window.JitsiMeetExternalAPI) {
                initJitsi();
                return;
            }
            if (document.getElementById('jitsi-script')) return;

            const script = document.createElement("script");
            script.id = 'jitsi-script';
            script.src = "https://meet.guifi.net/external_api.js";
            script.async = true;
            script.onload = () => initJitsi();
            document.body.appendChild(script);
        };
        loadJitsiScript();

        return () => {
            if (window.jitsiAPIInstance) {
                window.jitsiAPIInstance.dispose();
                window.jitsiAPIInstance = null;
            }
        };
    }, [user, meetingCode]);

    // Polling for Patient
    useEffect(() => {
        if (!isPatient) return;
        let interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, [isPatient, meetingCode]);

    const checkStatus = async () => {
        try {
            const res = await api.get(`appointments/check_status.php?code=${meetingCode}`);
            if (res.status === 'success') {
                const data = res.data;
                if (data.status === 'Completed' && data.bill_id && data.payment_status !== 'Paid') {
                    if (window.jitsiAPIInstance) window.jitsiAPIInstance.executeCommand('hangup');
                    navigate(`/pay/${data.bill_id}`);
                }
            }
        } catch (e) { console.error(e); }
    };

    const initJitsi = () => {
        if (!jitsiContainer.current) return;
        jitsiContainer.current.innerHTML = '';

        let displayName = user.name || "User";
        if (amIDoctor && !displayName.startsWith("Dr.")) displayName = `Dr. ${displayName}`;

        const domain = "meet.guifi.net";
        const options = {
            roomName: meetingCode,
            width: '100%',
            height: '100%',
            parentNode: jitsiContainer.current,
            lang: 'en',
            userInfo: { displayName: displayName },
            configOverwrite: {
                startWithAudioMuted: true,
                startWithVideoMuted: true,
                prejoinPageEnabled: false,
                disableDeepLinking: true
            },
            interfaceConfigOverwrite: {
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false
            }
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);
        window.jitsiAPIInstance = api;
        setJitsiApi(api);

        api.addEventListeners({
            videoConferenceJoined: (event) => {
                setStatusMessage("You have joined the room.");
                if (amIDoctor) setIsDoctorPresent(true);
                else {
                    const participants = api.getParticipantsInfo();
                    if (participants.find(p => checkIsDoctor(p.displayName))) setIsDoctorPresent(true);
                    else setStatusMessage("Waiting for the Doctor to start the session...");
                }
            },
            participantJoined: (participant) => {
                if (isPatient && checkIsDoctor(participant.displayName)) {
                    setIsDoctorPresent(true);
                    setStatusMessage("Doctor has joined!");
                }
            },
            participantLeft: (participant) => {
                if (isPatient && checkIsDoctor(participant.displayName)) {
                    setIsDoctorPresent(false);
                    setStatusMessage("Doctor has left. Checking for invoice...");
                    checkStatus();
                }
            },
            videoConferenceLeft: () => {
                if (amIDoctor) navigate('/dashboard');
                else {
                    checkStatus().then(() => { });
                    navigate('/dashboard');
                }
            }
        });
    };

    const generateAndUploadPrescription = async (apptId, patientName, patientId, shouldUpload = false) => {
        setIsGenerating(true);
        try {
            const doc = new jsPDF();
            doc.setFontSize(22); doc.setTextColor(40, 40, 40);
            doc.text("Medisphere Hospital", 105, 20, null, null, "center");
            doc.setFontSize(12); doc.text("123 Health Avenue, Medicity", 105, 28, null, null, "center");
            doc.line(20, 35, 190, 35);
            doc.setFontSize(16); doc.text("PRESCRIPTION", 105, 50, null, null, "center");
            doc.setFontSize(11);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 65);
            doc.text(`Patient: ${patientName}`, 20, 72);
            doc.text(`Doctor: ${user.name}`, 130, 72);
            doc.setFontSize(12); doc.text("Rx:", 20, 90);
            doc.setFont("helvetica", "normal");
            const splitText = doc.splitTextToSize(prescription, 170);
            doc.text(splitText, 20, 100);

            if (shouldUpload) {
                const pdfBlob = doc.output('blob');
                const formData = new FormData();
                formData.append('patient_id', patientId);
                formData.append('appointment_id', apptId);
                formData.append('type', 'Prescription');
                formData.append('file', pdfBlob, `Prescription_${apptId}.pdf`);
                const token = localStorage.getItem('token');
                await fetch('http://localhost:8080/Medisphere-Project/backend/api/documents/upload.php', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
            } else {
                doc.save(`Prescription_${apptId}.pdf`);
            }
        } catch (e) { console.error(e); }
        finally { setIsGenerating(false); }
    };

    const generateBillPDF = async (apptId, patientName, patientId, shouldUpload = false) => {
        setIsGenerating(true);
        try {
            const doc = new jsPDF();
            doc.setFontSize(22); doc.setTextColor(40, 40, 40);
            doc.text("Medisphere Hospital", 105, 20, null, null, "center");
            doc.setFontSize(10); doc.text("OFFICIAL INVOICE (ONLINE)", 105, 28, null, null, "center");
            doc.line(20, 35, 190, 35);

            doc.setFontSize(11);
            doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 20, 50);
            doc.text(`Patient: ${patientName}`, 20, 57);
            doc.text(`Appointment ID: #${apptId}`, 140, 50);
            doc.text(`Payment Status: PAID`, 140, 57);

            doc.setFillColor(245, 245, 245);
            doc.rect(20, 70, 170, 10, 'F');
            doc.setFontSize(12); doc.setTextColor(0);
            doc.text("Description", 25, 77); doc.text("Amount", 160, 77);
            doc.text("Consultation Fee (Online)", 25, 95); doc.text("$50.00", 160, 95);

            doc.line(20, 110, 190, 110);
            doc.setFontSize(14); doc.text("Total Paid:", 120, 120); doc.text("$50.00", 160, 120);
            doc.setFontSize(10); doc.setTextColor(100);
            doc.text("Thank you for choosing Medisphere.", 105, 150, null, null, "center");

            if (shouldUpload) {
                const pdfBlob = doc.output('blob');
                const formData = new FormData();
                formData.append('patient_id', patientId);
                formData.append('appointment_id', apptId);
                formData.append('type', 'Invoices');
                formData.append('file', pdfBlob, `Bill_Online_${apptId}.pdf`);
                const token = localStorage.getItem('token');
                await fetch('http://localhost:8080/Medisphere-Project/backend/api/documents/upload.php', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
            } else {
                doc.save(`Invoice_${apptId}.pdf`);
            }
        } catch (e) { console.error(e); }
        finally { setIsGenerating(false); }
    };

    const handleDoctorFinish = async () => {
        if (isGenerating) return;
        if (!prescription.trim()) {
            if (!window.confirm("No prescription written. Are you sure you want to finish without one?")) return;
        }

        try {
            const statusRes = await api.get(`appointments/check_status.php?code=${meetingCode}`);
            if (statusRes.status !== 'success') { alert("Error details"); return; }
            const apptData = statusRes.data;
            const apptId = apptData.appointment_id;
            const patientId = apptData.patient_id;
            const patientName = apptData.patient_name || "Patient";

            // 1. Generate & Upload PDFs
            await Promise.all([
                prescription.trim() ? generateAndUploadPrescription(apptId, patientName, patientId, true) : Promise.resolve(),
                generateBillPDF(apptId, patientName, patientId, true)
            ]);

            // 2. Complete Appointment
            const res = await api.post('appointments/complete.php', {
                appointment_id: apptId,
                notes: prescription || "Consultation Completed"
            });

            if (res.status === 'success') {
                if (window.jitsiAPIInstance) window.jitsiAPIInstance.executeCommand('hangup');
                navigate('/dashboard');
            } else {
                alert(res.message);
            }
        } catch (e) {
            alert("Error completing consultation");
        }
    };

    return (
        <div style={{ height: 'calc(100vh - 80px)', position: 'relative' }} className="fade-in bg-dark">
            <div ref={jitsiContainer} style={{ width: '100%', height: '100%' }} />

            {(!amIDoctor && !isDoctorPresent) && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', zIndex: 2000 }} className="d-flex flex-column align-items-center justify-content-center text-white text-center p-4">
                    <div className="spinner-border text-primary mb-4" style={{ width: '3rem', height: '3rem' }}></div>
                    <h3 className="fw-bold">{statusMessage}</h3>
                    <p className="text-white-50">Please wait for the doctor to join.</p>
                </div>
            )}

            {amIDoctor && (
                <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 3000 }}>
                    <button
                        className="btn btn-danger btn-lg shadow-lg d-flex align-items-center gap-2 rounded-pill px-4"
                        onClick={() => setShowStopConfirm(true)}
                    >
                        <PhoneOff size={20} /> Finish Consultation
                    </button>
                </div>
            )}

            <AnimatePresence>
                {showStopConfirm && (
                    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.85)', zIndex: 4000 }}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content border-0 shadow-lg rounded-4">
                                <div className="modal-header border-0">
                                    <h5 className="modal-title fw-bold">Complete Consultation</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowStopConfirm(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Digital Prescription</label>
                                        <textarea
                                            className="form-control bg-light"
                                            rows="8"
                                            placeholder="Enter medicines, dosage, and instructions here..."
                                            value={prescription}
                                            onChange={(e) => setPrescription(e.target.value)}
                                        ></textarea>
                                        <div className="form-text">This will be generated as a PDF and saved to the patient's records.</div>
                                    </div>

                                    <div className="alert alert-info small">
                                        <i className="bi bi-info-circle me-2"></i>
                                        Clicking "Complete" will generate invoice and prescription PDF.
                                    </div>

                                    <div className="d-flex gap-2 justify-content-end mt-4">
                                        <button className="btn btn-light rounded-pill px-4" onClick={() => setShowStopConfirm(false)}>Cancel</button>
                                        <button
                                            className="btn btn-primary rounded-pill px-4"
                                            onClick={handleDoctorFinish}
                                            disabled={isGenerating}
                                        >
                                            {isGenerating ? 'Processing...' : 'Complete & Send'}
                                        </button>
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

export default ConsultationRoom;
