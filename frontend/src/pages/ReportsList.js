import React, { useEffect, useState } from 'react';
import { api, BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TableSkeleton } from '../components/Skeleton';
import { CloudUpload, Download, FileText, Activity, FileX, TrendingUp, Clipboard, Microscope } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ReportsList = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        patient_id: '',
        doctor_id: '',
        report_type: '',
        report_file: null
    });

    useEffect(() => {
        fetchReports();
        const role = user?.role?.toLowerCase();
        if (['admin', 'receptionist', 'doctor', 'staff'].includes(role)) {
            fetchOptions();
        } else if (role === 'patient') {
            fetchDoctorsOnly();
        }
    }, [user]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await api.get('reports/list.php');
            if (res.status === 'success') {
                setReports(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOptions = async () => {
        try {
            const pRes = await api.get('patients/list.php');
            if (pRes.status === 'success') setPatients(pRes.data);

            const dRes = await api.get('doctors/list.php');
            if (dRes.status === 'success') setDoctors(dRes.data);
        } catch (e) {
            console.error("Failed to fetch options", e);
        }
    };

    const fetchDoctorsOnly = async () => {
        try {
            const dRes = await api.get('doctors/list.php');
            if (dRes.status === 'success') setDoctors(dRes.data);
        } catch (e) {
            console.error("Failed to fetch doctors", e);
        }
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, report_file: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.report_file) {
            alert("Please select a file to upload.");
            return;
        }

        const data = new FormData();
        data.append('patient_id', formData.patient_id);
        data.append('doctor_id', formData.doctor_id);
        data.append('report_type', formData.report_type);
        data.append('report_file', formData.report_file);

        setIsSubmitting(true);
        try {
            const res = await api.upload('reports/create.php', data);

            if (res.status === 'success') {
                alert('Report uploaded successfully!');
                setShowModal(false);
                fetchReports();
                setFormData({ patient_id: '', doctor_id: '', report_type: '', report_file: null });
            } else {
                alert('Upload failed: ' + res.message);
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred during upload.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const canUpload = ['admin', 'doctor', 'receptionist', 'staff', 'patient'].includes(user?.role?.toLowerCase());

    // Stats
    const totalReports = reports.length;
    const bloodTests = reports.filter(r => r.report_type?.toLowerCase().includes('blood')).length;
    const xrays = reports.filter(r => r.report_type?.toLowerCase().includes('x-ray') || r.report_type?.toLowerCase().includes('xray')).length;
    const thisMonth = reports.filter(r => {
        const d = new Date(r.created_at);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    // Stat Card Component
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
                    <h2 className="fw-bold mb-1" style={{ color: 'var(--text-main)' }}>Lab Reports</h2>
                    <p className="text-muted mb-0">Manage and view diagnostic reports</p>
                </div>
                {canUpload && (
                    <button className="btn btn-primary rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm" onClick={() => setShowModal(true)}>
                        <CloudUpload size={18} /> Upload Report
                    </button>
                )}
            </div>

            {/* Stats Row */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <StatCard icon={FileText} title="Total Reports" value={totalReports} color="primary" />
                </div>
                <div className="col-md-3">
                    <StatCard icon={Activity} title="Blood Tests" value={bloodTests} color="danger" />
                </div>
                <div className="col-md-3">
                    <StatCard icon={Microscope} title="X-Rays/Scans" value={xrays} color="info" />
                </div>
                <div className="col-md-3">
                    <StatCard icon={TrendingUp} title="This Month" value={thisMonth} color="success" subtitle="New uploads" />
                </div>
            </div>

            {/* Table Card */}
            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-white border-0 p-4">
                    <h5 className="fw-bold mb-0">
                        <Clipboard size={18} className="me-2 text-primary" />
                        Reports Directory
                    </h5>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4 py-3 text-muted small text-uppercase">Report ID</th>
                                    <th className="py-3 text-muted small text-uppercase">Patient</th>
                                    <th className="py-3 text-muted small text-uppercase">Doctor</th>
                                    <th className="py-3 text-muted small text-uppercase">Type</th>
                                    <th className="py-3 text-muted small text-uppercase">Date</th>
                                    <th className="text-end pe-4 py-3 text-muted small text-uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [...Array(6)].map((_, i) => (
                                        <tr key={i}>
                                            <td className="ps-4"><TableSkeleton rows={1} cols={1} /></td>
                                            <td><TableSkeleton rows={1} cols={1} /></td>
                                            <td><TableSkeleton rows={1} cols={1} /></td>
                                            <td><TableSkeleton rows={1} cols={1} /></td>
                                            <td><TableSkeleton rows={1} cols={1} /></td>
                                            <td className="text-end pe-4"><TableSkeleton rows={1} cols={1} /></td>
                                        </tr>
                                    ))
                                ) : reports.length > 0 ? (
                                    reports.map((report) => (
                                        <tr key={report.report_id}>
                                            <td className="ps-4">
                                                <span className="badge bg-light text-dark border fw-bold">#{report.report_id}</span>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3 text-primary d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                                                        {report.p_first?.charAt(0)}{report.p_last?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-0 fw-semibold">{report.p_first} {report.p_last}</h6>
                                                        <small className="text-muted">ID: {report.patient_id}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{report.d_first ? `Dr. ${report.d_first} ${report.d_last}` : <span className="text-muted">-</span>}</td>
                                            <td>
                                                <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-3 py-2 rounded-pill">
                                                    {report.report_type}
                                                </span>
                                            </td>
                                            <td className="text-muted">{new Date(report.created_at).toLocaleDateString()}</td>
                                            <td className="text-end pe-4">
                                                <a
                                                    href={`${BASE_URL}/${report.report_file}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm btn-primary rounded-pill d-inline-flex align-items-center gap-2 px-3"
                                                >
                                                    <Download size={14} /> View
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted">
                                            <FileX size={48} className="d-block mx-auto mb-3 opacity-25" />
                                            <p className="mb-0">No reports found.</p>
                                            {canUpload && <button className="btn btn-link" onClick={() => setShowModal(true)}>Upload your first report</button>}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="modal-dialog modal-dialog-centered"
                        >
                            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                                <div className="modal-header border-0 p-4" style={{ background: 'linear-gradient(135deg, #5eaab5 0%, #7fc4ce 100%)' }}>
                                    <div>
                                        <h5 className="modal-title fw-bold text-white mb-1">Upload New Report</h5>
                                        <p className="text-white-50 mb-0 small">Add a diagnostic report to the system</p>
                                    </div>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <form onSubmit={handleSubmit}>

                                        {/* Hide Patient Select for Patients */}
                                        {user?.role?.toLowerCase() !== 'patient' && (
                                            <div className="mb-3">
                                                <label className="form-label small fw-bold text-muted">Patient</label>
                                                <select
                                                    className="form-select bg-light border-0 py-2"
                                                    value={formData.patient_id}
                                                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                                                    required
                                                >
                                                    <option value="">Select Patient</option>
                                                    {patients.map(p => (
                                                        <option key={p.patient_id} value={p.patient_id}>
                                                            {p.first_name} {p.last_name} (ID: {p.patient_id})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted">Referring Doctor</label>
                                            <select
                                                className="form-select bg-light border-0 py-2"
                                                value={formData.doctor_id}
                                                onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                                            >
                                                <option value="">Select Doctor (Optional)</option>
                                                {doctors.map(d => (
                                                    <option key={d.doctor_id} value={d.doctor_id}>
                                                        Dr. {d.first_name} {d.last_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-muted">Report Type</label>
                                            <select
                                                className="form-select bg-light border-0 py-2"
                                                value={formData.report_type}
                                                onChange={(e) => setFormData({ ...formData, report_type: e.target.value })}
                                                required
                                            >
                                                <option value="">Select Report Type</option>
                                                <option value="Blood Test">Blood Test</option>
                                                <option value="X-Ray">X-Ray</option>
                                                <option value="MRI">MRI</option>
                                                <option value="CT Scan">CT Scan</option>
                                                <option value="Ultrasound">Ultrasound</option>
                                                <option value="ECG">ECG</option>
                                                <option value="Urine Test">Urine Test</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label small fw-bold text-muted">Upload File (PDF, IMG)</label>
                                            <div className="border-2 border-dashed rounded-3 p-4 text-center bg-light" style={{ borderColor: '#dee2e6' }}>
                                                <input
                                                    type="file"
                                                    className="form-control bg-light border-0"
                                                    onChange={handleFileChange}
                                                    required
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                />
                                                <small className="text-muted d-block mt-2">Supported: PDF, JPG, PNG (Max 10MB)</small>
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-end gap-3 pt-3 border-top">
                                            <button type="button" className="btn btn-light px-4 rounded-pill" onClick={() => setShowModal(false)}>Cancel</button>
                                            <button type="submit" className="btn btn-primary px-5 rounded-pill shadow-sm" disabled={isSubmitting}>
                                                {isSubmitting ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Uploading...
                                                    </>
                                                ) : 'Upload Report'}
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

export default ReportsList;
