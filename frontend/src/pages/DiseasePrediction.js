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
            setError("Service Offline. Ensure Python AI Service (Port 5004) is running.");
        } finally {
            setLoading(false);
        }
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
                    <motion.div initial={{ y: -20 }} animate={{ y: 0 }} className="text-center mb-5">
                        <h2 className="fw-bold text-dark d-flex align-items-center justify-content-center gap-2">
                            <Stethoscope size={32} className="text-primary" />
                            AI Disease Predictor
                        </h2>
                        <p className="text-muted">Select your symptoms to get an AI-powered preliminary diagnosis.</p>
                    </motion.div>

                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                        <div className="card-header bg-primary text-white p-4">
                            <h5 className="mb-0 fw-bold"><Activity className="me-2" /> Symptom Checker</h5>
                        </div>
                        <div className="card-body p-5">
                            <label className="fw-bold text-muted mb-3 d-block">Select all that apply:</label>

                            <div className="d-flex flex-wrap gap-2 mb-4">
                                {symptomsList.map(sym => (
                                    <button
                                        key={sym}
                                        onClick={() => toggleSymptom(sym)}
                                        className={`btn rounded-pill px-4 py-2 border transition-all ${selectedSymptoms.includes(sym)
                                                ? 'btn-primary shadow-sm'
                                                : 'btn-outline-secondary bg-light text-dark border-0'
                                            }`}
                                    >
                                        {selectedSymptoms.includes(sym) && <CheckCircle size={16} className="me-2 inline-block" />}
                                        {sym.replace(/([A-Z])/g, ' $1').trim()}
                                    </button>
                                ))}
                            </div>

                            <div className="d-grid gap-2">
                                <button
                                    className="btn btn-primary btn-lg rounded-pill shadow-sm"
                                    onClick={handlePredict}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span><span className="spinner-border spinner-border-sm me-2"></span>Analyzing...</span>
                                    ) : (
                                        "Predict Disease"
                                    )}
                                </button>
                                {result && (
                                    <button className="btn btn-link text-muted" onClick={handleReset}>
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
                                        <div className="alert alert-success border-0 bg-success bg-opacity-10 rounded-4 p-4 text-center">
                                            <h6 className="text-success text-uppercase fw-bold mb-2">Predicted Condition</h6>
                                            <h1 className="display-4 fw-bold text-dark mb-2">{result.disease}</h1>
                                            <div className="badge bg-success px-3 py-2 rounded-pill fs-6">
                                                Confidence: {result.confidence}
                                            </div>
                                            <p className="mt-3 text-muted small">
                                                Based on: {result.features_used.join(', ')}
                                            </p>
                                        </div>
                                        <div className="alert alert-warning d-flex align-items-center gap-3 border-0 bg-warning bg-opacity-10 text-dark rounded-3">
                                            <AlertTriangle size={24} className="text-warning flex-shrink-0" />
                                            <small className="mb-0">
                                                <strong>Disclaimer:</strong> This is an AI-generated prediction for informational purposes only.
                                                It is not a substitute for professional medical advice, diagnosis, or treatment.
                                                Please consult a doctor.
                                            </small>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {error && (
                                <div className="alert alert-danger mt-4 rounded-3 d-flex align-items-center gap-2">
                                    <AlertTriangle size={18} /> {error}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiseasePrediction;
