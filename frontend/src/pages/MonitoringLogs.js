import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Terminal,
    Activity,
    Calendar,
    User,
    Download,
    Filter,
    Search,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';

const MonitoringLogs = () => {
    const [activeLogs, setActiveLogs] = useState('chatbot');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        bot_conversations: 0,
        uptime: '99.9%',
        active_sessions: 0,
        warn_events: 0
    });

    const [chatLogs, setChatLogs] = useState([]);
    const [systemLogs, setSystemLogs] = useState([]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const result = await api.get('notifications/get_monitoring_data.php');
            if (result.status === 'success') {
                setChatLogs(result.data.chatbot_logs || []);
                setSystemLogs(result.data.system_logs || []);
                setStats(result.data.stats || stats);
            }
        } catch (error) {
            console.error("Failed to fetch monitoring data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const refreshLogs = () => {
        fetchLogs();
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-end mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Monitoring & Logs</h2>
                    <p className="text-secondary mb-0">Real-time oversight of system interactions and service health</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={refreshLogs}>
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button className="btn btn-primary d-flex align-items-center gap-2">
                        <Download size={18} />
                        Export Data
                    </button>
                </div>
            </div>

            {/* Top Stats */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
                        <MessageSquare className="mx-auto mb-3 text-primary" size={32} />
                        <h3 className="fw-bold mb-1">{stats.bot_conversations}</h3>
                        <small className="text-secondary text-uppercase tracking-wider">Bot Conversations</small>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
                        <CheckCircle2 className="mx-auto mb-3 text-success" size={32} />
                        <h3 className="fw-bold mb-1">{stats.uptime}</h3>
                        <small className="text-secondary text-uppercase tracking-wider">Uptime Rate</small>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
                        <Shield className="mx-auto mb-3 text-info" size={32} />
                        <h3 className="fw-bold mb-1">{stats.active_sessions}</h3>
                        <small className="text-secondary text-uppercase tracking-wider">Active Patient Profiles</small>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
                        <AlertCircle className="mx-auto mb-3 text-warning" size={32} />
                        <h3 className="fw-bold mb-1">{stats.warn_events}</h3>
                        <small className="text-secondary text-uppercase tracking-wider">Pending Alerts</small>
                    </div>
                </div>
            </div>

            {/* Logs Table Section */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-white p-4 border-0">
                    <div className="d-flex flex-column flex-md-row justify-content-between gap-4">
                        <div className="nav nav-pills gap-2 bg-light p-1 rounded-3">
                            <button
                                onClick={() => setActiveLogs('chatbot')}
                                className={`nav-link border-0 fw-bold ${activeLogs === 'chatbot' ? 'bg-white shadow-sm text-primary' : 'text-secondary'}`}
                            >
                                <MessageSquare size={16} className="me-2" /> Chatbot Interactions
                            </button>
                            <button
                                onClick={() => setActiveLogs('system')}
                                className={`nav-link border-0 fw-bold ${activeLogs === 'system' ? 'bg-white shadow-sm text-primary' : 'text-secondary'}`}
                            >
                                <Terminal size={16} className="me-2" /> System Events
                            </button>
                        </div>
                        <div className="d-flex gap-2">
                            <div className="position-relative">
                                <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" size={18} />
                                <input
                                    type="text"
                                    className="form-control ps-5 rounded-pill border-0 bg-light"
                                    placeholder="Search logs..."
                                    style={{ width: '300px' }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button className="btn btn-light rounded-circle border-0"><Filter size={18} /></button>
                        </div>
                    </div>
                </div>

                <div className="card-body p-0">
                    <div className="table-responsive">
                        {activeLogs === 'chatbot' ? (
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="px-4 py-3 border-0">Timestamp</th>
                                        <th className="py-3 border-0">User / Patient</th>
                                        <th className="py-3 border-0">Message</th>
                                        <th className="py-3 border-0">Bot Response</th>
                                        <th className="py-3 border-0 text-end px-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chatLogs.map((log) => (
                                        <tr key={log.id}>
                                            <td className="px-4 py-3 small text-secondary">{log.time}</td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className={`p-1 rounded bg-opacity-10 ${log.patient_id ? 'bg-success text-success' : 'bg-primary text-primary'}`}>
                                                        <User size={14} />
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold small">{log.user}</div>
                                                        <small className="text-secondary opacity-75">{log.patient_id ? `ID: #${log.patient_id}` : 'Guest session'}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><p className="mb-0 small text-truncate" style={{ maxWidth: '250px' }}>{log.message}</p></td>
                                            <td><p className="mb-0 small text-truncate text-secondary" style={{ maxWidth: '300px' }}>{log.bot}</p></td>
                                            <td className="text-end px-4">
                                                <button className="btn btn-sm btn-light border">Details</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="px-4 py-3 border-0">Timestamp</th>
                                        <th className="py-3 border-0">Level</th>
                                        <th className="py-3 border-0">Module</th>
                                        <th className="py-3 border-0">Event Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {systemLogs.map((log, sIdx) => (
                                        <tr key={sIdx}>
                                            <td className="px-4 py-3 small text-secondary">{log.time}</td>
                                            <td>
                                                <span className={`badge ${log.level === 'ERROR' ? 'bg-danger text-white' :
                                                    log.level === 'WARN' ? 'bg-warning text-dark' : 'bg-info-subtle text-info'
                                                    } rounded-1 px-2 py-1`} style={{ fontSize: '0.65rem' }}>
                                                    {log.level}
                                                </span>
                                            </td>
                                            <td><code className="bg-light px-2 py-1 rounded text-dark small">{log.module}</code></td>
                                            <td><span className="small fw-medium">{log.event}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
                <div className="card-footer bg-white p-4 border-0 text-center">
                    <button className="btn btn-link text-decoration-none text-secondary small">View Older Logs <Calendar size={14} className="ms-1" /></button>
                </div>
            </div>

            <style>
                {`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                `}
            </style>
        </div>
    );
};

export default MonitoringLogs;
