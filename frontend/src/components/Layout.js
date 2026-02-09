import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';
import QuickAppointmentModal from './QuickAppointmentModal';
import { Bell, Mail, Search, Home, ChevronRight } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const Layout = ({ children }) => {
    const { user } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [isQuickBookOpen, setIsQuickBookOpen] = useState(false);
    const location = useLocation();

    // Generate breadcrumb from path
    const getBreadcrumb = () => {
        const path = location.pathname;
        const segments = path.split('/').filter(Boolean);

        if (segments.length === 0) return [{ label: 'Dashboard', path: '/dashboard' }];

        return segments.map((segment, index) => ({
            label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
            path: '/' + segments.slice(0, index + 1).join('/'),
            isLast: index === segments.length - 1
        }));
    };

    const breadcrumb = getBreadcrumb();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F4') {
                e.preventDefault();
                if (user && ['admin', 'staff', 'receptionist'].includes(user.role)) {
                    setIsQuickBookOpen(prev => !prev);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [user]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 992) {
                setCollapsed(true);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!user) {
        return <>{children || <Outlet />}</>;
    }

    const toggleCollapsed = () => setCollapsed(!collapsed);

    return (
        <div className="d-flex min-vh-100">
            {/* Sidebar */}
            <Sidebar collapsed={collapsed} toggleCollapsed={toggleCollapsed} />

            {/* Main Content Wrapper */}
            <motion.div
                className="d-flex flex-column flex-grow-1"
                animate={{ marginLeft: collapsed ? '80px' : '280px' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ minHeight: '100vh' }}
            >
                {/* Simple Top Bar with Breadcrumb */}
                <header className="d-flex align-items-center justify-content-between px-4 py-3">
                    {/* Breadcrumb */}
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0 d-flex align-items-center" style={{ fontSize: '0.9375rem' }}>
                            <li className="breadcrumb-item">
                                <Link to="/dashboard" className="text-decoration-none d-flex align-items-center" style={{ color: 'var(--text-muted)' }}>
                                    <Home size={16} />
                                </Link>
                            </li>
                            <li className="breadcrumb-item">
                                <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                            </li>
                            {breadcrumb.map((item, index) => (
                                <li key={index} className={`breadcrumb-item ${item.isLast ? '' : ''}`}>
                                    {item.isLast ? (
                                        <span className="fw-semibold" style={{ color: 'var(--text-main)' }}>{item.label}</span>
                                    ) : (
                                        <>
                                            <Link to={item.path} className="text-decoration-none" style={{ color: 'var(--text-muted)' }}>
                                                {item.label}
                                            </Link>
                                            <ChevronRight size={14} className="mx-2" style={{ color: 'var(--text-muted)' }} />
                                        </>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </nav>

                    {/* Right Side Actions */}
                    <div className="d-flex align-items-center gap-3">
                        {/* Search */}
                        <div className="position-relative d-none d-md-block">
                            <Search size={16} className="position-absolute" style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="search"
                                className="search-bar"
                                placeholder="Search..."
                                style={{ width: '200px', paddingLeft: '40px' }}
                            />
                        </div>

                        {/* Notifications */}
                        <NotificationDropdown />

                        {/* User Profile */}
                        <div className="d-flex align-items-center gap-2 p-2 rounded-xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-dark)' }}>
                            <div className="avatar avatar-primary" style={{ width: 36, height: 36, fontSize: '0.8rem' }}>
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="d-none d-md-block">
                                <div className="fw-semibold small" style={{ color: 'var(--text-main)', lineHeight: 1.2 }}>
                                    {user?.name}
                                </div>
                                <div className="small text-capitalize" style={{ color: 'var(--text-muted)', lineHeight: 1.2 }}>
                                    {user?.role}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area with Glassmorphism */}
                <main className="flex-grow-1 p-3">
                    <div className="main-content-glass" style={{ minHeight: 'calc(100vh - 100px)' }}>
                        {children || <Outlet />}
                    </div>
                </main>
            </motion.div>

            {/* Quick Actions Portal */}
            <QuickAppointmentModal
                isOpen={isQuickBookOpen}
                onClose={() => setIsQuickBookOpen(false)}
            />
        </div>
    );
};

export default Layout;
