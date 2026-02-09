import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, CheckCircle, XCircle } from 'lucide-react';

const MagicLoginVerify = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { setUser } = useAuth(); // Need to expose setUser or create a method
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            return;
        }

        const verifyToken = async () => {
            try {
                const response = await fetch('http://localhost:8080/MediSphere/backend/api/auth/verify_magic_link.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                const text = await response.text();
                try {
                    const data = JSON.parse(text);
                    if (data.success) {
                        setStatus('success');
                        // SAVE BOTH USER AND TOKEN (AuthContext needs both)
                        localStorage.setItem('user', JSON.stringify(data.user));
                        localStorage.setItem('token', data.token);

                        // Short delay to show the success state checkmark
                        setTimeout(() => {
                            window.location.href = '/dashboard';
                        }, 800);
                    } else {
                        console.error("Verification failed:", data);
                        setStatus('error');
                        setErrorMessage(data.message || "Invalid Token");
                    }
                } catch (parseError) {
                    console.error("Malformed JSON:", text);
                    setStatus('error');
                    setErrorMessage("Server Error: Malformed response");
                }
            } catch (error) {
                console.error("Fetch Error:", error);
                setStatus('error');
                setErrorMessage("Network Error: " + error.message);
            }
        };

        verifyToken();
    }, [token]);

    return (
        <div className="d-flex min-vh-100 align-items-center justify-content-center bg-light">
            <div className="card border-0 shadow-sm p-5 text-center" style={{ maxWidth: '400px' }}>
                <div className="mb-4 d-inline-block p-3 rounded-circle bg-light">
                    {status === 'verifying' && <div className="spinner-border text-primary" role="status"></div>}
                    {status === 'success' && <CheckCircle className="text-success" size={48} />}
                    {status === 'error' && <XCircle className="text-danger" size={48} />}
                </div>

                <h3 className="fw-bold mb-2">
                    {status === 'verifying' && 'Verifying...'}
                    {status === 'success' && 'Welcome Back!'}
                    {status === 'error' && 'Verification Failed'}
                </h3>

                <p className="text-muted">
                    {status === 'verifying' && 'Please wait while we log you in securely.'}
                    {status === 'success' && 'Successfully verified. Redirecting you to the dashboard...'}
                    {status === 'error' && (errorMessage || 'This magic link is invalid or has expired. Please try again.')}
                </p>

                {status === 'error' && (
                    <button className="btn btn-primary mt-3" onClick={() => navigate('/login')}>
                        Back to Login
                    </button>
                )}
            </div>
        </div>
    );
};

export default MagicLoginVerify;
