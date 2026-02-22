import React, { useState } from 'react';
import {
    Brain,
    ShieldCheck,
    Bell,
    Bot,
    Cpu,
    ShieldAlert,
    RefreshCcw,
    ToggleLeft,
    ToggleRight,
    Lock,
    Timer,
    Users,
    Mail,
    Phone,
    MessageSquare,
    ChevronRight,
    Search,
    Monitor
} from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('ai');

    // Mock State for Settings (In real app, this would come from API/Context)
    const [settings, setSettings] = useState({
        ai: {
            diseasePrediction: true,
            xrayAnalysis: true,
            chatbot: true,
            faceRecognition: true,
            alertThreshold: 75,
        },
        security: {
            jwtExpiry: 24,
            passwordPolicy: 'High',
            twoFactor: false,
            sessionTimeout: 30,
            loginAttempts: 5
        },
        notifications: {
            email: true,
            sms: false,
            whatsapp: true,
            reminderTiming: 60
        }
    });

    const tabs = [
        { id: 'ai', label: 'AI & Services', icon: Brain },
        { id: 'security', label: 'Security', icon: ShieldCheck },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    const toggleSetting = (category, field) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: !prev[category][field]
            }
        }));
    };

    const StatusBadge = ({ running }) => (
        <span className={`badge rounded-pill ${running ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} px-3 py-2`}>
            {running ? '● Running' : '○ Stopped'}
        </span>
    );

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">System Settings</h2>
                    <p className="text-secondary mb-0">Configure your enterprise-grade medical infrastructure</p>
                </div>
            </div>

            <div className="row g-4">
                {/* Tabs Sidebar */}
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-2 rounded-4">
                        <div className="nav flex-column gap-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`btn d-flex align-items-center gap-3 p-3 rounded-3 text-start transition-all ${activeTab === tab.id
                                            ? 'btn-primary shadow'
                                            : 'btn-light border-0'
                                        }`}
                                >
                                    <tab.icon size={20} />
                                    <span className="fw-semibold">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="col-md-9">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'ai' && (
                            <div className="space-y-4">
                                {/* AI Status Panel */}
                                <div className="card border-0 shadow-sm rounded-4 mb-4">
                                    <div className="card-header bg-transparent border-0 p-4">
                                        <h5 className="fw-bold mb-0">AI Services Status</h5>
                                    </div>
                                    <div className="card-body p-0">
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle mb-0">
                                                <thead className="bg-light">
                                                    <tr>
                                                        <th className="px-4 py-3 border-0">Service Name</th>
                                                        <th className="py-3 border-0">Status</th>
                                                        <th className="py-3 border-0">Version</th>
                                                        <th className="py-3 border-0 text-end px-4">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {[
                                                        { id: 'diseasePrediction', name: 'Disease Prediction Service', version: 'v1.4.2' },
                                                        { id: 'xrayAnalysis', name: 'X-Ray Analysis Engine', version: 'v2.1.0' },
                                                        { id: 'chatbot', name: 'Chatbot NLP Engine', version: 'v3.0.1' },
                                                        { id: 'faceRecognition', name: 'Face Attendance System', version: 'v1.2.5' }
                                                    ].map((service) => (
                                                        <tr key={service.id}>
                                                            <td className="px-4 py-3">
                                                                <div className="fw-bold text-dark">{service.name}</div>
                                                                <small className="text-secondary">Last restart: 2 hours ago</small>
                                                            </td>
                                                            <td><StatusBadge running={settings.ai[service.id]} /></td>
                                                            <td><code className="bg-light px-2 py-1 rounded text-primary">{service.version}</code></td>
                                                            <td className="text-end px-4">
                                                                <div className="d-flex gap-2 justify-content-end">
                                                                    <button className="btn btn-sm btn-light border" title="Restart Service">
                                                                        <RefreshCcw size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => toggleSetting('ai', service.id)}
                                                                        className={`btn btn-sm ${settings.ai[service.id] ? 'btn-danger' : 'btn-success'}`}
                                                                    >
                                                                        {settings.ai[service.id] ? 'Stop' : 'Start'}
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Resource Monitoring */}
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className="card border-0 shadow-sm rounded-4 p-4">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h6 className="fw-bold m-0"><Cpu size={18} className="me-2 text-primary" />CPU Usage</h6>
                                                <span className="text-primary fw-bold">24%</span>
                                            </div>
                                            <div className="progress" style={{ height: '8px' }}>
                                                <div className="progress-bar" style={{ width: '24%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="card border-0 shadow-sm rounded-4 p-4">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h6 className="fw-bold m-0"><Monitor size={18} className="me-2 text-info" />Memory (RAM)</h6>
                                                <span className="text-info fw-bold">4.2 / 16 GB</span>
                                            </div>
                                            <div className="progress" style={{ height: '8px' }}>
                                                <div className="progress-bar bg-info" style={{ width: '26%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="card border-0 shadow-sm rounded-4 p-4">
                                <h5 className="fw-bold mb-4">System Security Policy</h5>
                                <div className="space-y-4">
                                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 mb-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-white p-2 rounded-2 shadow-sm"><Timer size={20} className="text-primary" /></div>
                                            <div>
                                                <h6 className="mb-0 fw-bold">JWT Token Expiry</h6>
                                                <small className="text-secondary">Maximum session lifetime for users</small>
                                            </div>
                                        </div>
                                        <select className="form-select border-0 shadow-sm w-auto" value={settings.security.jwtExpiry}>
                                            <option value={12}>12 Hours</option>
                                            <option value={24}>24 Hours</option>
                                            <option value={48}>48 Hours</option>
                                        </select>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 mb-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-white p-2 rounded-2 shadow-sm"><Lock size={20} className="text-primary" /></div>
                                            <div>
                                                <h6 className="mb-0 fw-bold">Password Policy</h6>
                                                <small className="text-secondary">Enforce complexity requirements</small>
                                            </div>
                                        </div>
                                        <select className="form-select border-0 shadow-sm w-auto" value={settings.security.passwordPolicy}>
                                            <option value="Low">Basic (8 chars)</option>
                                            <option value="Medium">Medium (Alphanumeric)</option>
                                            <option value="High">High (Special Chars)</option>
                                        </select>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 mb-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-white p-2 rounded-2 shadow-sm"><ShieldAlert size={20} className="text-primary" /></div>
                                            <div>
                                                <h6 className="mb-0 fw-bold">Login Attempt Limit</h6>
                                                <small className="text-secondary">Max attempts before account lockout</small>
                                            </div>
                                        </div>
                                        <input type="number" className="form-control border-0 shadow-sm w-auto text-center" value={settings.security.loginAttempts} style={{ width: '80px' }} />
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-white p-2 rounded-2 shadow-sm"><Users size={20} className="text-primary" /></div>
                                            <div>
                                                <h6 className="mb-0 fw-bold">Role-based Permissions</h6>
                                                <small className="text-secondary">Manage access control for all modules</small>
                                            </div>
                                        </div>
                                        <button className="btn btn-outline-primary rounded-pill px-4">Manage Roles</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="card border-0 shadow-sm rounded-4 p-4">
                                <h5 className="fw-bold mb-4">Communication Channels</h5>
                                <div className="row g-3">
                                    {[
                                        { id: 'email', label: 'Email Notifications', icon: Mail, subtitle: 'Reports & Appointments' },
                                        { id: 'sms', label: 'SMS Alerts', icon: Phone, subtitle: 'Urgent System Alerts' },
                                        { id: 'whatsapp', label: 'WhatsApp Bot', icon: MessageSquare, subtitle: 'User Interactions' }
                                    ].map((channel) => (
                                        <div key={channel.id} className="col-md-4">
                                            <div className={`p-4 rounded-4 border transition-all ${settings.notifications[channel.id] ? 'border-primary bg-primary-subtle' : 'bg-light'}`}>
                                                <channel.icon size={24} className={`mb-3 ${settings.notifications[channel.id] ? 'text-primary' : 'text-secondary'}`} />
                                                <h6 className="fw-bold mb-1">{channel.label}</h6>
                                                <p className="small text-secondary mb-3">{channel.subtitle}</p>
                                                <div className="form-check form-switch ps-0">
                                                    <button
                                                        onClick={() => toggleSetting('notifications', channel.id)}
                                                        className={`btn btn-sm rounded-pill px-3 ${settings.notifications[channel.id] ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                    >
                                                        {settings.notifications[channel.id] ? 'Enabled' : 'Disabled'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <hr className="my-5" />

                                <h5 className="fw-bold mb-4">Alert Thresholds</h5>
                                <div className="p-3 bg-light rounded-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h6 className="mb-0 fw-bold">AI Pathological Alert Confidence</h6>
                                        <span className="badge bg-primary px-3">{settings.ai.alertThreshold}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        className="form-range"
                                        min="50" max="95"
                                        value={settings.ai.alertThreshold}
                                        onChange={(e) => setSettings(prev => ({ ...prev, ai: { ...prev.ai, alertThreshold: e.target.value } }))}
                                    />
                                    <small className="text-secondary">Alert doctors automatically if AI prediction exceeds this threshold</small>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
