import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, FileText, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

const NotificationDropdown = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const data = await api.get(`notifications/list.php?user_id=${user.user_id}&limit=10`);

            if (Array.isArray(data)) {
                setNotifications(data);
                const unread = data.filter(n => n.status === 'Unread').length;
                setUnreadCount(unread);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.post('notifications/mark_read.php', { notification_id: id });

            // Optimistic update
            setNotifications(prev => prev.map(n =>
                n.notification_id === id ? { ...n, status: 'Read' } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));

        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'AI_Result': return <FileText size={16} className="text-primary" />;
            case 'Alert': return <AlertTriangle size={16} className="text-danger" />;
            case 'Reminder': return <Bell size={16} className="text-warning" />;
            default: return <Info size={16} className="text-info" />;
        }
    };

    return (
        <div className="position-relative" ref={dropdownRef}>
            <button
                className="btn btn-light rounded-circle p-2 position-relative text-secondary hover-bg-gray transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light shadow-sm"
                        style={{ fontSize: '0.65rem', padding: '0.25em 0.5em' }}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="dropdown-menu show p-0 border-0 shadow-lg"
                        style={{
                            position: 'absolute',
                            right: 0,
                            top: '120%',
                            width: '320px',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            zIndex: 1050
                        }}
                    >
                        <div className="p-3 bg-white border-bottom d-flex align-items-center justify-content-between">
                            <h6 className="m-0 fw-bold text-dark">Notifications</h6>
                            <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2">
                                {unreadCount} New
                            </span>
                        </div>

                        <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: '400px', backgroundColor: '#f8f9fa' }}>
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-muted">
                                    <Bell size={32} className="opacity-25 mb-2 mx-auto d-block" />
                                    <small>No notifications yet</small>
                                </div>
                            ) : (
                                <div className="list-group list-group-flush">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.notification_id}
                                            className={`list-group-item border-0 p-3 d-flex gap-3 align-items-start transition-colors ${notif.status === 'Unread' ? 'bg-white' : 'bg-transparent'
                                                }`}
                                            onClick={() => { if (notif.status === 'Unread') markAsRead(notif.notification_id); }}
                                            style={{ cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                        >
                                            <div className={`rounded-circle p-2 flex-shrink-0 ${notif.status === 'Unread' ? 'bg-primary bg-opacity-10' : 'bg-secondary bg-opacity-10'
                                                }`}>
                                                {getIcon(notif.type)}
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-start mb-1">
                                                    <span className={`small fw-bold ${notif.status === 'Unread' ? 'text-dark' : 'text-muted'}`}>
                                                        {notif.type.replace('_', ' ')}
                                                    </span>
                                                    <small className="text-muted" style={{ fontSize: '0.65rem' }}>
                                                        {new Date(notif.created_at).toLocaleDateString()}
                                                    </small>
                                                </div>
                                                <p className="mb-0 small text-secondary lh-sm">
                                                    {notif.message}
                                                </p>
                                            </div>
                                            {notif.status === 'Unread' && (
                                                <div className="mt-1">
                                                    <div className="spinner-grow spinner-grow-sm text-primary" style={{ width: '6px', height: '6px' }} role="status"></div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-2 bg-white border-top text-center">
                            <button className="btn btn-link btn-sm text-decoration-none text-muted" style={{ fontSize: '0.8rem' }}>
                                View All Notifications
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;
