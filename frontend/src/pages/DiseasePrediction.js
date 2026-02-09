import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, AlertTriangle, RefreshCw, Stethoscope } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DiseasePrediction = () => {
    // These match exactly what the python script was trained with (minus 'Symptom_' prefix)
    const symptomsList = [
        'Fever', 'Cough', 'Fatigue', 'Headache',
        'SoreThroat', 'BodyPain', 'RunnyNose', 'Breathlessness'
    ];

    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const toggleSymptom = (symptom) => {
        if (selectedSymptoms.includes(symptom)) {
            setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
        } else {
            setSelectedSymptoms([...selectedSymptoms, symptom]);
        }
    };

    const handlePredict = async () => {
        if (selectedSymptoms.length === 0) {
            alert("Please select at least one symptom.");
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await fetch('http://localhost:5004/predict_disease', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symptoms: selectedSymptoms })
            });
            const data = await res.json();

            if (data.status === 'success') {
                setResult(data);
            } else {
                setError(data.msg || "Prediction failed.");
            }
        } catch (e) {
            setError("Service Offline.");
        } finally {
            setLoading(false);
        }
    };

    const runDemoPrediction = () => {
        setLoading(true);
        setError('');
        setResult(null);
        setTimeout(() => {
            setResult({
                disease: "Viral Influenza",
                confidence: "87%",
                features_used: selectedSymptoms
            });
            setLoading(false);
        }, 1500);
    };

    const handleReset = () => {
        setSelectedSymptoms([]);
        setResult(null);
        setError('');
    };

    return (
        <div className="container-fluid py-4 fade-in">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    {/* Header Section */}
                    <motion.div initial={{ y: -20 }} animate={{ y: 0 }} className="text-center mb-5">
                        <div className="d-inline-flex align-items-center gap-3 mb-3">
                            <div className="rounded-3 p-3" style={{ background: 'linear-gradient(135deg, #1a3a4a 0%, #2d5a6e 100%)' }}>
                                <Stethoscope size={32} className="text-white" />
                            </div>
                            <h2 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>AI Disease Predictor</h2>
                        </div>
                        <p className="text-muted">Select your symptoms to get an AI-powered preliminary diagnosis.</p>
                    </motion.div>

                    {/* Main Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card border-0 shadow-lg rounded-4 overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)', backdropFilter: 'blur(20px)' }}
                    >
                        {/* Teal Gradient Header */}
                        <div className="p-4" style={{ background: 'linear-gradient(135deg, #1a3a4a 0%, #2d5a6e 100%)' }}>
                            <h5 className="mb-0 fw-bold text-white d-flex align-items-center gap-2">
                                <Activity size={20} />
                                Symptom Checker
                            </h5>
                        </div>

                        <div className="card-body p-5">
                            <label className="fw-bold text-uppercase small mb-3 d-block" style={{ color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                                Select all that apply:
                            </label>

                            {/* Symptom Chips */}
                            <div className="d-flex flex-wrap gap-2 mb-4">
                                {symptomsList.map(sym => (
                                    <motion.button
                                        key={sym}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => toggleSymptom(sym)}
                                        className={`btn rounded-pill px-4 py-2 border-0 transition-all fw-medium ${selectedSymptoms.includes(sym)
                                            ? 'text-white shadow-sm'
                                            : 'text-dark'
                                            }`}
                                        style={{
                                            background: selectedSymptoms.includes(sym)
                                                ? 'linear-gradient(135deg, #1a3a4a 0%, #2d5a6e 100%)'
                                                : 'rgba(255,255,255,0.8)',
                                            border: selectedSymptoms.includes(sym) ? 'none' : '1px solid rgba(0,0,0,0.08)'
                                        }}
                                    >
                                        {selectedSymptoms.includes(sym) && <CheckCircle size={16} className="me-2" />}
                                        {sym.replace(/([A-Z])/g, ' $1').trim()}
                                    </motion.button>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="d-grid gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className="btn btn-lg rounded-pill text-white shadow fw-bold py-3"
                                    style={{ background: 'linear-gradient(135deg, #1a3a4a 0%, #2d5a6e 100%)' }}
                                    onClick={handlePredict}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span><span className="spinner-border spinner-border-sm me-2"></span>Analyzing...</span>
                                    ) : (
                                        <>
                                            <Stethoscope size={20} className="me-2" />
                                            Predict Disease
                                        </>
                                    )}
                                </motion.button>
                                {result && (
                                    <button className="btn btn-link" style={{ color: 'var(--text-muted)' }} onClick={handleReset}>
                                        <RefreshCw size={14} className="me-1" /> Start Over
                                    </button>
                                )}
                            </div>

                            {/* RESULTS SECTION */}
                            <AnimatePresence>
                                {result && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-4"
                                    >
                                        <div className="rounded-4 p-4 text-center" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                            <p className="small text-uppercase fw-bold mb-2" style={{ color: '#059669', letterSpacing: '0.5px' }}>Predicted Condition</p>
                                            <h1 className="display-5 fw-bold mb-3" style={{ color: 'var(--text-main)' }}>{result.disease}</h1>
                                            <div className="d-inline-block px-4 py-2 rounded-pill fw-bold text-white" style={{ background: '#10b981' }}>
                                                Confidence: {result.confidence}
                                            </div>
                                            <p className="mt-3 text-muted small mb-0">
                                                Based on: {result.features_used.join(', ')}
                                            </p>
                                        </div>
                                        <div className="d-flex align-items-center gap-3 p-3 rounded-3 mt-3" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                            <AlertTriangle size={24} style={{ color: '#d97706' }} className="flex-shrink-0" />
                                            <small className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                                                <strong>Disclaimer:</strong> This is an AI-generated prediction for informational purposes only.
                                                It is not a substitute for professional medical advice, diagnosis, or treatment.
                                                Please consult a doctor.
                                            </small>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Error Section */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-4 p-4 rounded-3"
                                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                                >
                                    <div className="d-flex align-items-center gap-2 mb-3" style={{ color: '#dc2626' }}>
                                        <AlertTriangle size={18} />
                                        <span className="fw-bold">{error}</span>
                                    </div>
                                    <button
                                        className="btn btn-sm rounded-pill fw-bold w-100 text-white"
                                        style={{ background: 'linear-gradient(135deg, #1a3a4a 0%, #2d5a6e 100%)' }}
                                        onClick={runDemoPrediction}
                                    >
                                        Run Simulation (Demo)
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default DiseasePrediction;
