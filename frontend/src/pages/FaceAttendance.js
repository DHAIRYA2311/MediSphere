import React, { useState, useEffect } from 'react';
import { api } from '../services/api'; // Add api service
import {
    Camera, UserCheck, ShieldAlert, RefreshCw,
    Maximize2, Zap, User, Clock, CheckCircle2, AlertCircle,
    ScanFace, ShieldCheck, Fingerprint, ArrowRight, Save, X, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FaceAttendance = () => {
    const [mode, setMode] = useState('attendance'); // 'attendance' | 'register'
    const [status, setStatus] = useState(''); // '', 'loading', 'success', 'warning', 'error'
    const [message, setMessage] = useState('');
    const [cameraActive, setCameraActive] = useState(true);
    const [scanProgress, setScanProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedUserId, setSelectedUserId] = useState('');
    const [users, setUsers] = useState([]);
    const [isDemo, setIsDemo] = useState(false);

    const SERVICE_URL = "http://localhost:5001";

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        fetchUsers();
        return () => clearInterval(timer);
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('users/list.php'); // Assuming admin/staff access
            if (res.status === 'success') {
                setUsers(res.data);
            }
        } catch (e) {
            console.error("Failed to fetch users", e);
            // Fallback users for demo
            if (isDemo) {
                setUsers([
                    { user_id: 1, first_name: 'John', last_name: 'Doe', role_name: 'Doctor' },
                    { user_id: 2, first_name: 'Jane', last_name: 'Smith', role_name: 'Nurse' }
                ]);
            }
        }
    };

    const markAttendance = async () => {
        setStatus('loading');
        setMessage('Initializing Biometric Validation...');
        setScanProgress(0);

        const progressInterval = setInterval(() => {
            setScanProgress(prev => Math.min(prev + 5, 95));
        }, 100);

        if (isDemo) {
            setTimeout(() => {
                clearInterval(progressInterval);
                setScanProgress(100);
                setStatus('success');
                setMessage('Demo: Attendance Marked Successfully for John Doe');
                setTimeout(() => setCameraActive(false), 2000);
            }, 2000);
            return;
        }

        try {
            const res = await fetch(`${SERVICE_URL}/mark_attendance`, {
                method: 'POST'
            });
            const data = await res.json();

            clearInterval(progressInterval);
            setScanProgress(100);

            if (data.status === 'success') {
                setStatus('success');
                setMessage(data.msg);
                setTimeout(() => setCameraActive(false), 2000);
            } else if (data.status === 'warning') {
                setStatus('warning');
                setMessage(data.msg);
            } else {
                setStatus('error');
                setMessage(data.msg);
            }
        } catch (e) {
            clearInterval(progressInterval);
            setStatus('error');
            setMessage('Face AI Service Offline. Try Demo Mode.');
        }
    };

    const registerFace = async () => {
        if (!selectedUserId) {
            setStatus('error');
            setMessage('Please select a user to enroll.');
            return;
        }

        const user = users.find(u => u.user_id == selectedUserId);
        const name = user ? `${user.first_name} ${user.last_name}` : 'User';

        setStatus('loading');
        setMessage(`Capturing Biometrics for ${name}...`);

        if (isDemo) {
            setTimeout(() => {
                setStatus('success');
                setMessage(`Demo: Face Registered for ${name}`);
                setSelectedUserId('');
                setTimeout(() => {
                    setMode('attendance');
                    resetScanner();
                }, 2000);
            }, 2000);
            return;
        }

        try {
            const res = await fetch(`${SERVICE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: selectedUserId })
            });
            const data = await res.json();

            if (data.status === 'success') {
                setStatus('success');
                setMessage(data.msg);
                setSelectedUserId('');
                setTimeout(() => {
                    setMode('attendance');
                    resetScanner();
                }, 2000);
            } else {
                setStatus('error');
                setMessage(data.msg);
            }
        } catch (e) {
            setStatus('error');
            setMessage('Service Offline. Try Demo Mode.');
        }
    };

    const resetScanner = () => {
        setStatus('');
        setMessage('');
        setScanProgress(0);
        setCameraActive(true);
    };

    return (
        <div className="container-fluid py-5 bg-light min-vh-100 d-flex align-items-center justify-content-center">
            <div className="w-100" style={{ maxWidth: '1100px' }}>

                {/* Header Section */}
                <div className="d-flex justify-content-between align-items-end mb-4 px-2">
                    <div>
                        <h2 className="fw-bold text-dark mb-1">Medisphere Biometrics</h2>
                        <p className="text-muted small mb-0">Intellectual Face Recognition & Attendance System</p>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <div className="form-check form-switch me-2">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="demoMode"
                                checked={isDemo}
                                onChange={(e) => setIsDemo(e.target.checked)}
                            />
                            <label className="form-check-label small fw-bold text-muted" htmlFor="demoMode">Demo Mode</label>
                        </div>
                        <div className="d-flex bg-white rounded-3 p-1 shadow-sm border">
                            <button
                                className={`btn btn-sm px-3 fw-bold rounded-2 transition-all ${mode === 'attendance' ? 'bg-primary text-white shadow-sm' : 'text-muted'}`}
                                onClick={() => { setMode('attendance'); resetScanner(); }}
                            >
                                Attendance
                            </button>
                            <button
                                className={`btn btn-sm px-3 fw-bold rounded-2 transition-all ${mode === 'register' ? 'bg-primary text-white shadow-sm' : 'text-muted'}`}
                                onClick={() => { setMode('register'); resetScanner(); }}
                            >
                                Register Face
                            </button>
                        </div>
                    </div>
                </div>

                <div className="row g-0 shadow-2xl rounded-4 overflow-hidden border bg-white" style={{ minHeight: '550px' }}>

                    {/* LEFT PANEL: The Scanner Viewport */}
                    <div className="col-lg-7 bg-black position-relative border-end border-white border-opacity-10" style={{ minHeight: '450px' }}>
                        {cameraActive ? (
                            <>
                                <img
                                    src={`${SERVICE_URL}/video_feed?t=${Date.now()}`}
                                    alt="Biometric Feed"
                                    className="w-100 h-100 object-fit-cover opacity-90"
                                    onError={(e) => {
                                        if (!isDemo) {
                                            e.target.style.display = 'none';
                                            setStatus('error');
                                            setMessage("Camera Hardware Not Found");
                                        }
                                    }}
                                />
                                {isDemo && (
                                    <div className="position-absolute inset-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75 text-white">
                                        <div className="text-center opacity-50">
                                            <p className="mb-0 small font-monospace">DEMO MODE ACTIVE</p>
                                            <p className="mb-0 small font-monospace">SIMULATED FEED</p>
                                        </div>
                                    </div>
                                )}
                                {/* HUD Layer */}
                                <div className="position-absolute inset-0 w-100 h-100 p-4 d-flex flex-column justify-content-between pointer-events-none z-1">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="bg-black bg-opacity-40 backdrop-blur-sm border border-white border-opacity-10 p-2 rounded-2">
                                            <div className="d-flex align-items-center gap-2 text-primary small fw-bold tracking-widest font-monospace">
                                                <div className="spinner-grow spinner-grow-sm"></div>
                                                LIVE_ENCRYPTION_ON
                                            </div>
                                        </div>
                                        <div className="text-end font-monospace text-white text-shadow">
                                            <div className="h4 mb-0 fw-bold">{currentTime.toLocaleTimeString()}</div>
                                            <div className="small opacity-50">{currentTime.toLocaleDateString()}</div>
                                        </div>
                                    </div>

                                    {/* Viewport Brackets */}
                                    <div className="position-absolute top-50 start-50 translate-middle w-75 h-75 border-cyan-glow">
                                        <div className="pos-abs top-0 start-0 w-8 h-8 border-t-2 border-l-2 border-primary"></div>
                                        <div className="pos-abs top-0 end-0 w-8 h-8 border-t-2 border-r-2 border-primary"></div>
                                        <div className="pos-abs bottom-0 start-0 w-8 h-8 border-b-2 border-l-2 border-primary"></div>
                                        <div className="pos-abs bottom-0 end-0 w-8 h-8 border-b-2 border-r-2 border-primary"></div>

                                        {/* Horizontal Scan Line */}
                                        {status === 'loading' && (
                                            <motion.div
                                                animate={{ top: ['0%', '100%', '0%'] }}
                                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                className="position-absolute w-100 bg-primary shadow-glow-primary"
                                                style={{ height: '2px', left: 0 }}
                                            />
                                        )}
                                    </div>

                                    <div className="d-flex justify-content-center">
                                        <div className="bg-black bg-opacity-60 backdrop-blur-md px-4 py-2 rounded-pill border border-white border-opacity-10 text-white small font-monospace tracking-tight">
                                            {mode === 'attendance' ? 'SYSTEM_WAITING: AUTH_TRIGGER_REQUIRED' : 'SYSTEM_WAITING: BIOMETRIC_ENROLLMENT'}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white bg-dark p-5">
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="p-4 bg-success bg-opacity-10 rounded-circle mb-4 border border-success border-opacity-20">
                                    <CheckCircle2 size={80} className="text-success" />
                                </motion.div>
                                <h3 className="fw-bold text-success">Identity Confirmed</h3>
                                <p className="text-muted text-center max-w-sm">Recognition successful. Your participation has been securely logged in the master ledger.</p>
                            </div>
                        )}
                    </div>

                    {/* RIGHT PANEL: Controls & Info */}
                    <div className="col-lg-5 p-5 d-flex flex-column justify-content-between bg-white">
                        <div>
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="bg-primary bg-opacity-10 p-3 rounded-4">
                                    {mode === 'attendance' ? <ScanFace size={28} className="text-primary" /> : <UserCheck size={28} className="text-primary" />}
                                </div>
                                <div>
                                    <h4 className="fw-bold mb-0">{mode === 'attendance' ? 'Attendance Check' : 'Face Enrollment'}</h4>
                                    <p className="text-muted small mb-0">{mode === 'attendance' ? 'Biometric verification protocol' : 'Digital identity registration'}</p>
                                </div>
                            </div>

                            <div className="bg-light p-4 rounded-4 border mb-4">
                                <h6 className="fw-bold text-dark small text-uppercase tracking-wider mb-3">Protocol Requirements</h6>
                                <ul className="list-unstyled small text-secondary mb-0">
                                    <li className="d-flex gap-3 mb-3">
                                        <div className="text-primary"><Activity size={16} /></div>
                                        <span>Stay within 1-2 feet of the camera for high-accuracy feature extraction.</span>
                                    </li>
                                    <li className="d-flex gap-3 mb-3">
                                        <div className="text-primary"><Clock size={16} /></div>
                                        <span>Authentication typically completes in under 2.5 seconds.</span>
                                    </li>
                                    <li className="d-flex gap-3">
                                        <div className="text-primary"><ShieldCheck size={16} /></div>
                                        <span>All data is processed using local GPU-accelerated neural networks.</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Status Area */}
                            <AnimatePresence mode="wait">
                                {message && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className={`p-3 rounded-3 mb-4 d-flex align-items-start gap-3 border ${status === 'success' ? 'bg-success bg-opacity-5 text-success border-success border-opacity-20' :
                                            status === 'warning' ? 'bg-warning bg-opacity-5 text-dark border-warning border-opacity-20' :
                                                status === 'error' ? 'bg-danger bg-opacity-5 text-danger border-danger border-opacity-20' :
                                                    'bg-primary bg-opacity-5 text-primary border-primary border-opacity-20'
                                            }`}
                                    >
                                        <div className="mt-1 shadow-sm">
                                            {status === 'loading' ? <RefreshCw className="animate-spin" size={18} /> :
                                                status === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold small text-uppercase mb-1">{status === 'loading' ? 'Encrypting...' : status}</div>
                                            <div className="small opacity-80">{message}</div>
                                            {status === 'loading' && mode === 'attendance' && (
                                                <div className="progress mt-2 bg-primary bg-opacity-10" style={{ height: '3px' }}>
                                                    <motion.div
                                                        className="progress-bar bg-primary shadow-sm"
                                                        style={{ width: `${scanProgress}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Actions */}
                        <div className="mt-auto">
                            {mode === 'register' ? (
                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-secondary text-uppercase mb-2">Select User for Biometric Link</label>
                                    <div className="input-group input-group-lg shadow-sm">
                                        <span className="input-group-text bg-white border-end-0"><User size={20} className="text-muted" /></span>
                                        <select
                                            className="form-select bg-white border-start-0 fs-6 ps-1"
                                            value={selectedUserId}
                                            onChange={(e) => setSelectedUserId(e.target.value)}
                                            disabled={status === 'loading'}
                                        >
                                            <option value="">-- Choose Staff/User --</option>
                                            {users.map(u => (
                                                <option key={u.user_id} value={u.user_id}>
                                                    {u.first_name} {u.last_name} ({u.role_name || 'User'})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ) : null}

                            <div className="d-grid gap-3">
                                {!cameraActive ? (
                                    <button onClick={resetScanner} className="btn btn-dark btn-lg py-3 fw-bold rounded-3 shadow d-flex align-items-center justify-content-center gap-2">
                                        <RefreshCw size={20} /> Reset Scanner
                                    </button>
                                ) : (
                                    <button
                                        onClick={mode === 'attendance' ? markAttendance : registerFace}
                                        className="btn btn-primary btn-lg py-3 fw-bold rounded-3 shadow d-flex align-items-center justify-content-center gap-2 group"
                                        disabled={status === 'loading'}
                                    >
                                        {status === 'loading' ? 'PROCESSING...' : (
                                            <>
                                                {mode === 'attendance' ? (
                                                    <>IDENTIFY ME <ArrowRight size={20} className="group-hover-translate-x-1 transition-all" /></>
                                                ) : (
                                                    <>ENROLL BIOMETRICS <Save size={20} /></>
                                                )}
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                            <div className="text-center mt-3">
                                <span className="text-muted smaller fw-bold tracking-widest opacity-50"><Fingerprint size={12} className="me-1 mb-1" /> SECURE_ID_V3.0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .pos-abs { position: absolute; }
                .border-cyan-glow { pointer-events: none; border: 1px solid rgba(13, 110, 253, 0.1); }
                .shadow-glow-primary { box-shadow: 0 0 20px rgba(13, 110, 253, 0.6); }
                .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15); }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .text-shadow { text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
                .smaller { font-size: 0.65rem; }
                .group-hover-translate-x-1:hover svg { transform: translateX(4px); }
                .w-8 { width: 32px; }
                .h-8 { height: 32px; }
            `}</style>
        </div>
    );
};

export default FaceAttendance;
