import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Bell, Globe, Shield, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState({
        email: true,
        browser: true,
        reports: false
    });
    const [security, setSecurity] = useState({
        twoFactor: true,
        sessionTimeout: '30m'
    });

    const [loading, setLoading] = useState(false);

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            alert("Settings saved successfully (Demo)");
        }, 1500);
    };

    const Section = ({ title, icon: Icon, children }) => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card border-0 shadow-sm mb-4 overflow-hidden"
            style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px'
            }}
        >
            <div className="card-header border-bottom-0 bg-white bg-opacity-50 p-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary">
                        <Icon size={20} />
                    </div>
                    <h5 className="fw-bold mb-0 text-dark">{title}</h5>
                </div>
            </div>
            <div className="card-body p-4 pt-2">
                {children}
            </div>
        </motion.div>
    );

    return (
        <div className="container-fluid py-4 fade-in">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold text-dark">System Settings</h2>
                    <p className="text-muted">Manage your preferences and system configurations</p>
                </div>
                <button
                    className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2 group"
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm"></span> Saving...
                        </>
                    ) : (
                        <>
                            <Save size={18} /> Save Changes
                        </>
                    )}
                </button>
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    {/* General Settings */}
                    <Section title="General Preferences" icon={Globe}>
                        <div className="row g-4 align-items-center mb-3">
                            <div className="col-md-8">
                                <label className="fw-bold text-dark mb-1">System Language</label>
                                <p className="text-muted small mb-0">Select your preferred language interface</p>
                            </div>
                            <div className="col-md-4">
                                <select className="form-select bg-light border-0">
                                    <option>English (US)</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                </select>
                            </div>
                        </div>
                        <hr className="text-muted opacity-10" />
                        <div className="row g-4 align-items-center">
                            <div className="col-md-8">
                                <label className="fw-bold text-dark mb-1">Time Zone</label>
                                <p className="text-muted small mb-0">Set your local time zone for reports</p>
                            </div>
                            <div className="col-md-4">
                                <select className="form-select bg-light border-0">
                                    <option>(GMT-05:00) Eastern Time</option>
                                    <option>(GMT+00:00) UTC</option>
                                    <option>(GMT+05:30) IST</option>
                                </select>
                            </div>
                        </div>
                        <hr className="text-muted opacity-10" />
                        <div className="row g-4 align-items-center">
                            <div className="col-md-8">
                                <label className="fw-bold text-dark mb-1">Currency</label>
                                <p className="text-muted small mb-0">Select your preferred currency for billing and reports</p>
                            </div>
                            <div className="col-md-4">
                                <select className="form-select bg-light border-0" defaultValue="INR">
                                    <option value="INR">₹ Rupees (INR)</option>
                                    <option value="USD">$ Dollars (USD)</option>
                                    <option value="EUR">€ Euro (EUR)</option>
                                    <option value="GBP">£ Pound (GBP)</option>
                                </select>
                            </div>
                        </div>
                    </Section>

                    {/* Notification Settings */}
                    <Section title="Notifications" icon={Bell}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <label className="fw-bold text-dark d-block">Email Alerts</label>
                                <small className="text-muted">Receive updates via email</small>
                            </div>
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={notifications.email}
                                    onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                                    style={{ transform: 'scale(1.2)' }}
                                />
                            </div>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <label className="fw-bold text-dark d-block">Browser Push Notifications</label>
                                <small className="text-muted">Get real-time alerts on dashboard</small>
                            </div>
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={notifications.browser}
                                    onChange={(e) => setNotifications({ ...notifications, browser: e.target.checked })}
                                    style={{ transform: 'scale(1.2)' }}
                                />
                            </div>
                        </div>
                    </Section>

                    {/* Security Settings */}
                    <Section title="Security & Access" icon={Shield}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <label className="fw-bold text-dark d-block">Two-Factor Authentication (2FA)</label>
                                <small className="text-muted">Require OTP for login from new devices</small>
                            </div>
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={security.twoFactor}
                                    onChange={(e) => setSecurity({ ...security, twoFactor: e.target.checked })}
                                    style={{ transform: 'scale(1.2)' }}
                                />
                            </div>
                        </div>
                        <div className="row g-4 align-items-center">
                            <div className="col-md-8">
                                <label className="fw-bold text-dark mb-1">Session Timeout</label>
                                <p className="text-muted small mb-0">Auto-logout after inactivity</p>
                            </div>
                            <div className="col-md-4">
                                <select
                                    className="form-select bg-light border-0"
                                    value={security.sessionTimeout}
                                    onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                                >
                                    <option value="15m">15 Minutes</option>
                                    <option value="30m">30 Minutes</option>
                                    <option value="1h">1 Hour</option>
                                </select>
                            </div>
                        </div>
                    </Section>
                </div>

                <div className="col-lg-4">
                    {/* User Profile Summary */}
                    <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px', backgroundImage: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)' }}>
                        <div className="card-body p-4 text-center text-white">
                            <div className="avatar bg-white text-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 fw-bold shadow-lg" style={{ width: 64, height: 64, fontSize: '1.5rem' }}>
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <h5 className="fw-bold mb-1">{user?.name}</h5>
                            <p className="opacity-75 mb-3">{user?.role?.toUpperCase()}</p>
                            <div className="d-flex justify-content-center gap-2">
                                <span className="badge bg-white bg-opacity-20 backdrop-blur-sm px-3 py-2 rounded-pill font-monospace">ID: {user?.user_id || 'UNKNOWN'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Database Status */}
                    <div className="card border-0 shadow-sm bg-white" style={{ borderRadius: '16px' }}>
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div className="p-2 bg-success bg-opacity-10 text-success rounded-3">
                                    <Database size={20} />
                                </div>
                                <h6 className="fw-bold mb-0">System Status</h6>
                            </div>

                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="small fw-bold text-muted">Database Connection</span>
                                <span className="badge bg-success bg-opacity-10 text-success px-3 py-1 rounded-pill">Active</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="small fw-bold text-muted">API Latency</span>
                                <span className="small fw-bold text-dark">45ms</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="small fw-bold text-muted">Last Backup</span>
                                <span className="small fw-bold text-dark">Today, 04:00 AM</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
