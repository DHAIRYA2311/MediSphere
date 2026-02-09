import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DataTable from '../components/DataTable';
import { FileText, Upload, Filter, ExternalLink, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = "http://localhost:8080/MediSphere/backend"; // Needed for linking files

const DocumentManager = () => {
    const [documents, setDocuments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [filterCategory, setFilterCategory] = useState('All');

    // Categories as defined in requirements
    const categories = [
        "Patient Identity & Legal",
        "Medical Records",
        "Lab Reports",
        "Admission Documents",
        "Billing & Payment",
        "Insurance & Claims",
        "Consent Forms",
        "Discharge & Follow-up",
        "External Referrals"
    ];

    const [uploadData, setUploadData] = useState({
        patient_id: '',
        type: categories[0], // Default
        file: null
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [docsRes, patsRes] = await Promise.all([
                api.get('documents/list.php'),
                api.get('patients/list.php')
            ]);
            if (docsRes.status === 'success') setDocuments(docsRes.data);
            if (patsRes.status === 'success') setPatients(patsRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setUploadData({ ...uploadData, file: e.target.files[0] });
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadData.file || !uploadData.patient_id) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('patient_id', uploadData.patient_id);
        formData.append('type', uploadData.type);
        formData.append('file', uploadData.file);

        try {
            // Need a custom fetch here because api wrapper might be JSON specific or need headers tweak
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/documents/upload.php`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            const data = await res.json();

            if (data.status === 'success') {
                setIsUploadModalOpen(false);
                setUploadData({ patient_id: '', type: categories[0], file: null });
                fetchInitialData();
            } else {
                alert(data.message);
            }
        } catch (e) {
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    // Filter Logic
    const filteredDocuments = filterCategory === 'All'
        ? documents
        : documents.filter(d => d.type === filterCategory);

    const columns = [
        {
            key: 'file_path',
            label: 'Document',
            render: (row) => {
                // Heuristic to get icon or name
                const ext = row.file_path.split('.').pop();
                return (
                    <div className="d-flex align-items-center gap-2">
                        <div className="bg-light p-2 rounded text-primary">
                            <FileText size={20} />
                        </div>
                        <div>
                            <div className="fw-bold text-dark">{row.type}</div>
                            <small className="text-muted text-uppercase">{ext} File</small>
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'patient',
            label: 'Patient',
            sortable: true,
            render: (row) => (
                <div>
                    <span className="fw-semibold">{row.first_name} {row.last_name}</span>
                    <div className="text-muted small">ID: {row.patient_id}</div>
                </div>
            )
        },
        {
            key: 'category', // Actually 'type' col in DB
            label: 'Category',
            sortable: true,
            render: (row) => <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary rounded-pill">{row.type}</span>
        },
        {
            key: 'actions',
            label: 'View',
            render: (row) => (
                <a
                    href={`${API_BASE}/${row.file_path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                >
                    <ExternalLink size={14} /> Open
                </a>
            )
        }
    ];

    return (
        <div className="container-fluid py-4 fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark">Document Manager</h2>
                    <p className="text-muted">Centralized repository for patient files, reports, and legal docs</p>
                </div>
                <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setIsUploadModalOpen(true)}>
                    <Upload size={18} /> Upload Document
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="d-flex gap-2 overflow-auto pb-3 mb-2 thin-scrollbar">
                <button
                    className={`btn rounded-pill px-4 ${filterCategory === 'All' ? 'btn-dark' : 'btn-outline-secondary border-0 bg-white shadow-sm'}`}
                    onClick={() => setFilterCategory('All')}
                >
                    All
                </button>
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`btn rounded-pill px-3 text-nowrap ${filterCategory === cat ? 'btn-dark' : 'btn-outline-secondary border-0 bg-white shadow-sm'}`}
                        onClick={() => setFilterCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <DataTable
                title={`${filterCategory} Documents`}
                columns={columns}
                data={filteredDocuments}
                keyField="document_id"
            />

            {/* Upload Modal */}
            <AnimatePresence>
                {isUploadModalOpen && (
                    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="modal-dialog modal-dialog-centered"
                        >
                            <div className="modal-content border-0 shadow-lg rounded-4">
                                <div className="modal-header border-bottom-0 p-4">
                                    <h5 className="modal-title fw-bold">Upload Document</h5>
                                    <button type="button" className="btn-close" onClick={() => setIsUploadModalOpen(false)}></button>
                                </div>
                                <div className="modal-body p-4 pt-0">
                                    <form onSubmit={handleUpload}>
                                        <div className="mb-3">
                                            <label className="form-label text-muted small fw-bold">Select Patient</label>
                                            <select
                                                className="form-select bg-light border-0 py-2"
                                                value={uploadData.patient_id}
                                                onChange={(e) => setUploadData({ ...uploadData, patient_id: e.target.value })}
                                                required
                                            >
                                                <option value="">-- Patient --</option>
                                                {patients.map(p => (
                                                    <option key={p.patient_id} value={p.patient_id}>{p.first_name} {p.last_name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label text-muted small fw-bold">Document Category</label>
                                            <select
                                                className="form-select bg-light border-0 py-2"
                                                value={uploadData.type}
                                                onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                                                required
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label text-muted small fw-bold">File</label>
                                            <input type="file" className="form-control" onChange={handleFileChange} required />
                                        </div>

                                        <div className="d-flex justify-content-end gap-2">
                                            <button type="button" className="btn btn-light" onClick={() => setIsUploadModalOpen(false)}>Cancel</button>
                                            <button type="submit" className="btn btn-primary px-4" disabled={uploading}>
                                                {uploading ? 'Uploading...' : 'Upload'}
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

export default DocumentManager;
