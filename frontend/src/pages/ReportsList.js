import React, { useEffect, useState } from 'react';
import { api, BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TableSkeleton } from '../components/Skeleton';
import { CloudUpload, Download, FileText, Activity, User, FileX } from 'lucide-react';

const ReportsList = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

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
            // Patients only need doctors list, not patients list
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

        setLoading(true);
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
            setLoading(false);
        }
    };

    const canUpload = ['admin', 'doctor', 'receptionist', 'staff', 'patient'].includes(user?.role?.toLowerCase());

    return (
        <div className="container-fluid py-4 fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark">Lab Reports</h2>
                    <p className="text-muted">Manage and view diagnostic reports.</p>
                </div>
                {canUpload && (
                    <button className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
                        <CloudUpload size={18} /> Upload Report
                    </button>
                )}
            </div>

            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-secondary">
                                <tr>
                                    <th className="ps-4">Report ID</th>
                                    <th>Patient</th>
                                    <th>Doctor</th>
                                    <th>Type</th>
                                    <th>Date</th>
                                    <th className="text-end pe-4">Action</th>
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
                                            <td className="ps-4 fw-bold">#{report.report_id}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3 text-primary d-flex align-items-center justify-content-center">
                                                        <User size={18} />
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-0">{report.p_first} {report.p_last}</h6>
                                                        <small className="text-muted">ID: {report.patient_id}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td> {report.d_first ? `Dr. ${report.d_first} ${report.d_last}` : <span className="text-muted">-</span>}</td>
                                            <td>
                                                <span className="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill">
                                                    {report.report_type}
                                                </span>
                                            </td>
                                            <td>{new Date(report.created_at).toLocaleDateString()}</td>
                                            <td className="text-end pe-4">
                                                <a
                                                    href={`${BASE_URL}/${report.report_file}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm btn-outline-primary rounded-pill d-inline-flex align-items-center gap-2 px-3"
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
                                            No reports found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Manual Modal Implementation */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold">Upload New Report</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleSubmit}>

                                    {/* Hide Patient Select for Patients */}
                                    {user?.role?.toLowerCase() !== 'patient' && (
                                        <div className="mb-3">
                                            <label className="form-label">Patient</label>
                                            <select
                                                className="form-select"
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
                                        <label className="form-label">Referring Doctor</label>
                                        <select
                                            className="form-select"
                                            value={formData.doctor_id}
                                            onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                                        >
                                            <option value="">Select Doctor</option>
                                            {doctors.map(d => (
                                                <option key={d.doctor_id} value={d.doctor_id}>
                                                    Dr. {d.first_name} {d.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Report Type</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. Blood Test, X-Ray, MRI"
                                            value={formData.report_type}
                                            onChange={(e) => setFormData({ ...formData, report_type: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label">Upload File (PDF, IMG)</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={handleFileChange}
                                            required
                                        />
                                    </div>

                                    <div className="d-grid">
                                        <button type="submit" className="btn btn-primary rounded-pill py-2">
                                            Upload Report
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsList;
