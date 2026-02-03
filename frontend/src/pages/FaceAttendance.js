import React, { useState } from 'react';

const FaceAttendance = () => {
    const [status, setStatus] = useState('');
    const [message, setMessage] = useState('');
    const [cameraActive, setCameraActive] = useState(true);

    const SERVICE_URL = "http://localhost:5001";

    const quotes = [
        "Smile Please! 😊",
        "Work Hard, Dream Big! 💪",
        "Make Today Amazing! ✨",
        "Your Smile is Contagious! 😃",
        "Focus on the Good! 🌟",
        "Believe in Yourself! 🚀"
    ];

    const markAttendance = async () => {
        setStatus('loading');
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        setMessage(`Scanning... ${randomQuote}`);

        try {
            const res = await fetch(`${SERVICE_URL}/mark_attendance`, {
                method: 'POST'
            });
            const data = await res.json();

            if (data.status === 'success') {
                setStatus('success');
                setMessage(data.msg);
                setCameraActive(false); // Stop camera on success
            } else if (data.status === 'warning') {
                setStatus('warning');
                setMessage(data.msg);
            } else {
                setStatus('error');
                setMessage(data.msg);
            }
        } catch (e) {
            setStatus('error');
            setMessage('Error connecting to Face Service');
        }
    };

    const resetScanner = () => {
        setStatus('');
        setMessage('');
        setCameraActive(true);
    };

    return (
        <div className="container py-5 fade-in">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                        <div className="card-header bg-dark text-white text-center p-4">
                            <h3 className="fw-bold mb-0">
                                <i className="bi bi-person-bounding-box me-2"></i> Face Attendance
                            </h3>
                            <small className="text-white-50">Kiosk Mode - Please Stand Still</small>
                        </div>

                        <div className="card-body p-0 position-relative text-center bg-black" style={{ minHeight: '300px' }}>
                            {cameraActive ? (
                                <img
                                    src={`${SERVICE_URL}/video_feed?t=${Date.now()}`}
                                    alt="Live Feed"
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        alert("Camera feed not available. Make sure the Python Service is running!");
                                    }}
                                />
                            ) : (
                                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-white p-5" style={{ minHeight: '300px' }}>
                                    <h1 className="display-1 text-success mb-3"><i className="bi bi-check-lg"></i></h1>
                                    <h4 className="fw-bold">Attendance Marked</h4>
                                    <p className="text-white-50 small">Camera turned off</p>
                                </div>
                            )}
                        </div>

                        <div className="card-footer p-4 bg-white text-center">

                            {status === 'error' && (
                                <div className="alert alert-danger mb-3 rounded-pill">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i> {message}
                                </div>
                            )}

                            {status === 'warning' && (
                                <div className="alert alert-warning mb-3 rounded-pill">
                                    <i className="bi bi-clock-history me-2"></i> {message}
                                </div>
                            )}

                            {status === 'success' && (
                                <div className="alert alert-success mb-3 rounded-3">
                                    <div className="d-flex align-items-center justify-content-center">
                                        <i className="bi bi-check-circle-fill fs-1 me-3"></i>
                                        <div className="text-start">
                                            <h5 className="mb-0 fw-bold">Success!</h5>
                                            <p className="mb-0 small">{message}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="d-grid gap-3">
                                {!cameraActive && status === 'success' ? (
                                    <button
                                        onClick={resetScanner}
                                        className="btn btn-outline-primary btn-lg rounded-pill shadow-sm py-3"
                                    >
                                        <i className="bi bi-arrow-clockwise me-2"></i> Scan Next Person
                                    </button>
                                ) : (
                                    <button
                                        onClick={markAttendance}
                                        className="btn btn-primary btn-lg rounded-pill shadow-sm py-3"
                                        disabled={status === 'loading'}
                                    >
                                        {status === 'loading' ? (
                                            <span><span className="spinner-grow spinner-grow-sm me-2"></span>{message.includes('Scanning') ? message : 'Processing...'}</span>
                                        ) : (
                                            <><i className="bi bi-camera-fill me-2"></i> Mark Attendance</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-center mt-4 text-muted small">
                        {cameraActive ? 'Ensure you are facing the camera directly.' : 'Camera is inactive to save resources.'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaceAttendance;
