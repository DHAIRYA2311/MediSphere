import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(email, password);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="row w-100 justify-content-center">
                <div className="col-md-5 col-lg-4">
                    <div className="card-enterprise border-0 shadow-lg p-5">
                        <div className="text-center mb-4">
                            <i className="bi bi-hospital-fill text-primary display-4"></i>
                            <h2 className="fw-bold mt-2 text-dark">Welcome Back</h2>
                            <p className="text-muted">Sign in to Medisphere Enterprise</p>
                        </div>

                        {error && <div className="alert alert-danger rounded-3 text-center py-2">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="form-label text-muted fw-bold small text-uppercase">Email Address</label>
                                <input
                                    type="email"
                                    className="form-control form-control-lg bg-light border-0"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="form-label text-muted fw-bold small text-uppercase">Password</label>
                                <input
                                    type="password"
                                    className="form-control form-control-lg bg-light border-0"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg w-100 py-3 mb-3 fw-bold">Sign In</button>
                        </form>
                        <div className="text-center">
                            <small className="text-muted">Don't have an account? <Link to="/register" className="fw-bold text-primary text-decoration-none">Create Account</Link></small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
