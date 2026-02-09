import React, { useState } from 'react';
import { Upload, FileImage, Activity, AlertTriangle, CheckCircle, Scan } from 'lucide-react';
import { motion } from 'framer-motion';

const XRayAnalysis = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
            setAnalysis(null);
            setError("");
        }
    };

    const handleAnalyze = async () => {
        if (!selectedFile) return;

        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            // Demo Mode Check (implicit if fails or explicit button?)
            // For now, let's catch the error and offer demo result if service is offline.

            // Direct call to Python Service
            const res = await fetch('http://localhost:5003/analyze_xray', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error("Service unavailable. Ensure Python AI Service is running on Port 5003.");

            const data = await res.json();
            if (data.status === 'success') {
                setAnalysis(data.analysis);
            } else {
                setError(data.msg || "Analysis failed");
            }

        } catch (e) {
            console.log("Service offline, switching to demo mode logic check...");
            // Allow user to use demo mode via a button in the error message?
            // Or auto-fallback? Let's add a "Try Demo" button in the error UI.
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const runDemoAnalysis = () => {
        setLoading(true);
        setError("");
        setTimeout(() => {
            setAnalysis(
                "### Normal Chest X-Ray\nNo abnormalities detected in the lung fields. Heart size is normal. Bones and soft tissues appear unremarkable.\n\n### Recommendation\nNo further action required. Routine follow-up recommended."
            );
            setLoading(false);
        }, 1500);
    };

    // Helper to format the markdown-like response
    const formatAnalysis = (text) => {
        if (!text) return null;

        // Split by sections roughly
        const sections = text.split('###').filter(s => s.trim());

        return sections.map((section, idx) => {
            const lines = section.trim().split('\n');
            const title = lines[0];
            const content = lines.slice(1).join('\n').trim();

            return (
                <div key={idx} className="mb-4">
                    <h5 className="fw-bold text-primary mb-2 text-uppercase" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                        {title}
                    </h5>
                    <div className="text-secondary bg-light p-3 rounded border border-light-subtle" style={{ whiteSpace: 'pre-line' }}>
                        {content}
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="container-fluid py-4 fade-in">
            <div className="row g-4 justify-content-center">

                {/* Header */}
                <div className="col-12 text-center mb-2">
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                        <h2 className="fw-bold text-dark d-flex align-items-center justify-content-center gap-2">
                            <Scan size={32} className="text-primary" />
                            X-Ray Analysis (AI Assistant)
                        </h2>
                        <p className="text-muted">Clinical decision support for radiology interpretation.</p>
                    </motion.div>
                </div>

                {/* Left Column: Upload */}
                <div className="col-md-5">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-4 d-flex flex-column">
                            <h5 className="fw-bold mb-4">1. Upload Image</h5>

                            <div className="upload-area flex-grow-1 border-2 border-dashed border-secondary rounded-4 d-flex flex-column align-items-center justify-content-center p-5 bg-light position-relative"
                                style={{ minHeight: '300px', cursor: 'pointer', transition: 'all 0.2s' }}>

                                <input
                                    type="file"
                                    className="position-absolute w-100 h-100 opacity-0"
                                    style={{ cursor: 'pointer' }}
                                    onChange={handleFileSelect}
                                    accept="image/*"
                                />

                                {preview ? (
                                    <div className="text-center w-100 h-100 d-flex align-items-center justify-content-center overflow-hidden rounded-3 bg-dark">
                                        <img src={preview} alt="Preview" className="img-fluid" style={{ maxHeight: '400px', objectFit: 'contain' }} />
                                    </div>
                                ) : (
                                    <div className="text-center text-muted">
                                        <Upload size={48} className="mb-3 opacity-50" />
                                        <p className="fw-bold mb-1">Drag & Drop or Click to Upload</p>
                                        <small>Supports JPG, PNG, DICOM (converted)</small>
                                    </div>
                                )}
                            </div>

                            {preview && (
                                <button
                                    className="btn btn-primary w-100 mt-4 py-3 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                                    onClick={handleAnalyze}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm"></span> A.I. Analysis in Progress...
                                        </>
                                    ) : (
                                        <>
                                            <Activity size={20} /> Analyze Scan
                                        </>
                                    )}
                                </button>
                            )}

                            {error && (
                                <div className="alert alert-danger mt-3">
                                    <div className="d-flex align-items-center gap-2">
                                        <AlertTriangle size={18} /> {error}
                                    </div>
                                    <button
                                        className="btn btn-sm btn-outline-danger mt-2 fw-bold w-100"
                                        onClick={runDemoAnalysis}
                                    >
                                        Try Demo Analysis
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Analysis */}
                <div className="col-md-7">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4">2. Clinical Report</h5>

                            {loading ? (
                                <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted opacity-75" style={{ minHeight: '400px' }}>
                                    <div className="spinner-grow text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                                    <p className="h5">Analyzing X-Ray Patterns...</p>
                                    <small>Checking for abnormalities...</small>
                                </div>
                            ) : analysis ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="analysis-result">
                                    <div className="d-flex align-items-center gap-2 mb-4 p-3 bg-success bg-opacity-10 text-success rounded">
                                        <CheckCircle size={20} /> Analysis Complete
                                    </div>

                                    <div className="report-content">
                                        {formatAnalysis(analysis)}
                                    </div>

                                    <div className="alert alert-warning mt-5 d-flex gap-3">
                                        <AlertTriangle size={24} className="flex-shrink-0" />
                                        <div>
                                            <strong>Disclaimer:</strong> This AI-generated analysis is for clinical assistance only.
                                            It provides pattern recognition support and is <strong>NOT</strong> a diagnosis.
                                            Results must be reviewed by a licensed doctor.
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-100 d-flex align-items-center justify-content-center text-muted" style={{ minHeight: '400px' }}>
                                    <div className="text-center opacity-50">
                                        <FileImage size={64} className="mb-3" />
                                        <p>Upload a scan to view AI-generated insights here.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default XRayAnalysis;
