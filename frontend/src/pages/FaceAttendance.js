import React, { useState, useEffect } from 'react';
import {
    Camera, UserCheck, ShieldAlert, RefreshCw,
    Maximize2, Zap, User, Clock, CheckCircle2, AlertCircle,
    ScanFace, ShieldCheck, Fingerprint, ArrowRight, Save, X, Activity,
    Database, Target, Cpu, Wifi
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumSelect from '../components/PremiumSelect';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const FaceAttendance = () => {
    const { user: currentUser } = useAuth();
    const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

    const [mode, setMode] = useState('attendance'); // 'attendance' | 'register'
    const [status, setStatus] = useState(''); // '', 'loading', 'success', 'warning', 'error'
    const [message, setMessage] = useState('');
    const [cameraActive, setCameraActive] = useState(true);
    const [scanProgress, setScanProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedUserId, setSelectedUserId] = useState('');
    const [users, setUsers] = useState([]);

    const SERVICE_URL = "http://127.0.0.1:5005";

    const [cameraLoading, setCameraLoading] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        if (isAdmin) fetchUsers();

        // Auto-start camera when entering page
        const initCamera = async () => {
            setCameraLoading(true);
            try {
                await fetch(`${SERVICE_URL}/start_camera`);
                setCameraLoading(false);
            } catch (e) {
                console.error("Camera service offline");
                setCameraLoading(false);
            }
        };
        initCamera();

        return () => {
            clearInterval(timer);
            // Auto-stop camera when leaving page to save hardware resources
            fetch(`${SERVICE_URL}/stop_camera`).catch(() => { });
        };
    }, [isAdmin]);

    const fetchUsers = async () => {
        try {
            const res = await api.get('users/list.php');
            if (res.status === 'success') {
                setUsers(res.data);
            }
        } catch (e) {
            console.error("Failed to fetch users", e);
        }
    };

    const markAttendance = async () => {
        setStatus('loading');
        setMessage('Initializing Biometric Validation...');
        setScanProgress(0);

        const progressInterval = setInterval(() => {
            setScanProgress(prev => Math.min(prev + 5, 95));
        }, 100);

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
                setTimeout(() => setCameraActive(false), 3000);
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
            setMessage('Face AI Service Offline.');
        }
    };

    const registerFace = async () => {
        if (!isAdmin) {
            setStatus('error');
            setMessage('Operation Restricted to Admin.');
            return;
        }
        if (!selectedUserId) {
            setStatus('error');
            setMessage('Please select a staff member to enroll.');
            return;
        }

        const user = users.find(u => u.user_id == selectedUserId);
        const name = user ? `${user.first_name} ${user.last_name}` : 'User';

        setStatus('loading');
        setMessage(`Capturing Biometrics for ${name}...`);

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
                }, 3000);
            } else {
                setStatus('error');
                setMessage(data.msg);
            }
        } catch (e) {
            setStatus('error');
            setMessage('Service Offline.');
        }
    };

    const resetScanner = () => {
        setStatus('');
        setMessage('');
        setScanProgress(0);
        setCameraActive(true);
    };

    return (
        <div className="container-fluid py-5 min-vh-100 bg-dark-deep text-white">
            <div className="mx-auto" style={{ maxWidth: '800px' }}>

                {/* Minimal Header */}
                <div className="text-center mb-5">
                    <h2 className="fw-bold tracking-tight text-uppercase mb-1">Face Attendance</h2>
                    <div className="d-flex justify-content-center gap-3 mt-3">
                        <button
                            className={`btn btn-sm px-4 rounded-pill ${mode === 'attendance' ? 'btn-primary' : 'btn-outline-secondary text-white'}`}
                            onClick={() => { setMode('attendance'); resetScanner(); }}
                        >
                            Mark Attendance
                        </button>
                        {isAdmin && (
                            <button
                                className={`btn btn-sm px-4 rounded-pill ${mode === 'register' ? 'btn-primary' : 'btn-outline-secondary text-white'}`}
                                onClick={() => { setMode('register'); resetScanner(); }}
                            >
                                Register Face
                            </button>
                        )}
                    </div>
                </div>

                <div className="card bg-black border-tech rounded-4 overflow-hidden shadow-2xl position-relative mb-4" style={{ aspectRatio: '4/3' }}>
                    {cameraActive ? (
                        <>
                            <img
                                src={`${SERVICE_URL}/video_feed?t=${Date.now()}`}
                                alt="Live Feed"
                                className="w-100 h-100 object-fit-cover mirror"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    setStatus('error');
                                    setMessage("CAMERA_HARDWARE_FAULT");
                                }}
                            />

                            {/* Simple Face Mask Feedback */}
                            <div className="absolute-inset d-flex align-items-center justify-content-center pointer-events-none">
                                <div className={`face-guide ${status === 'loading' ? 'active' : ''}`}>
                                    <div className="corner c-tl"></div><div className="corner c-tr"></div>
                                    <div className="corner c-bl"></div><div className="corner c-br"></div>
                                </div>
                            </div>

                            {cameraLoading && (
                                <div className="absolute-inset d-flex align-items-center justify-content-center bg-black bg-opacity-50 backdrop-blur-sm">
                                    <div className="text-center">
                                        <div className="spinner-border text-primary mb-3"></div>
                                        <div className="small font-monospace text-uppercase tracking-widest">Initialising Hardware...</div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-success bg-opacity-10">
                            <CheckCircle2 size={80} className="text-success mb-4 animate-bounce" />
                            <h3 className="text-success fw-bold text-uppercase">Identification Success</h3>
                            <p className="text-white-50 px-4 text-center">{message}</p>
                            <button onClick={resetScanner} className="btn btn-primary rounded-pill px-5 mt-3">Next Scan</button>
                        </div>
                    )}
                </div>

                {/* Control & Result Area */}
                <div className="text-center">
                    {mode === 'register' && cameraActive && (
                        <div className="mb-4 mx-auto" style={{ maxWidth: '400px' }}>
                            <PremiumSelect
                                label="Enroll Biometrics For"
                                name="user_id"
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                options={users.filter(u => ['Doctor', 'Staff', 'Receptionist', 'Admin'].includes(u.role_name)).map(u => ({
                                    value: u.user_id,
                                    label: `${u.first_name} ${u.last_name} (${u.role_name})`
                                }))}
                                placeholder="Search Staff Member..."
                                dark={true}
                            />
                        </div>
                    )}

                    <div className="mb-4 min-height-status">
                        <AnimatePresence mode="wait">
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`fw-bold text-uppercase tracking-widest ${status === 'success' ? 'text-success' : status === 'error' ? 'text-danger' : 'text-primary'}`}
                                >
                                    {status === 'loading' && <span className="spinner-grow spinner-grow-sm me-2"></span>}
                                    {message}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {cameraActive && (
                        <button
                            className="btn btn-primary btn-lg rounded-pill px-5 py-3 fw-black tracking-widest text-uppercase shadow-glow-primary"
                            onClick={mode === 'attendance' ? markAttendance : registerFace}
                            disabled={status === 'loading'}
                        >
                            {mode === 'attendance' ? 'Validate My Identity' : 'Enroll Biometrics'}
                        </button>
                    )}
                </div>

            </div>

            <style>{`
                .bg-dark-deep { background: #0f172a; }
                .mirror { transform: scaleX(-1); }
                .absolute-inset { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }
                .border-tech { border: 2px solid rgba(13, 110, 253, 0.2); }
                .shadow-glow-primary { box-shadow: 0 0 20px rgba(13, 110, 253, 0.4); }
                .min-height-status { min-height: 30px; }
                
                .face-guide { width: 260px; height: 320px; position: relative; border: 1px solid rgba(255,255,255,0.1); border-radius: 40px; transition: all 0.3s; }
                .face-guide.active { border-color: #0d6efd; box-shadow: 0 0 30px rgba(13,110,253,0.3); }
                
                .corner { position: absolute; width: 20px; height: 20px; border-color: #0d6efd; border-style: solid; }
                .c-tl { top: -2px; left: -2px; border-width: 4px 0 0 4px; border-radius: 10px 0 0 0; }
                .c-tr { top: -2px; right: -2px; border-width: 4px 4px 0 0; border-radius: 0 10px 0 0; }
                .c-bl { bottom: -2px; left: -2px; border-width: 0 0 4px 4px; border-radius: 0 0 0 10px; }
                .c-br { bottom: -2px; right: -2px; border-width: 0 4px 4px 0; border-radius: 0 0 10px 0; }
            `}</style>
        </div>
    );
};

export default FaceAttendance;
