import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Users, UserCog, Calendar, CreditCard,
    Settings, LogOut, ChevronLeft, ChevronRight, Activity,
    Stethoscope, BedDouble, FileText, Shield, UserPlus, Search,
    Brain, ScanLine, UserCheck, Gift, Eye, ClipboardList, UserRound, ClipboardCheck
} from 'lucide-react';

const Sidebar = ({ collapsed, toggleCollapsed }) => {
    const { user, logout } = useAuth();

    const isAdmin = user?.role === 'admin';
    const isStaff = ['admin', 'staff', 'receptionist'].includes(user?.role);
    const isDoctor = user?.role === 'doctor';
    const isPatient = user?.role === 'patient';

    // AI TOOLS Section - For Staff & Doctors
    const aiToolsSection = [
        { to: '/ai-prediction', label: 'AI Diagnosis', icon: Brain },
        { to: '/xray-analysis', label: 'X-Ray Analysis', icon: ScanLine },
        { to: '/face-attendance', label: 'Face Attendance', icon: UserCheck },
    ];

    // MAIN MENU Section
    const mainNavItems = [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        ...(isPatient ? [
            { to: '/appointments', label: 'My Appointments', icon: Calendar },
            { to: '/billing', label: 'My Bills', icon: CreditCard },
            { to: '/reports', label: 'My Reports', icon: FileText },
        ] : []),
        ...(isDoctor ? [
            { to: '/appointments', label: 'Assessments', icon: Stethoscope },
            { to: '/consultation', label: 'Consultation', icon: ClipboardList },
        ] : []),
        ...(isStaff ? [
            { to: '/patients', label: 'Patients', icon: Users },
            { to: '/doctors', label: 'Doctors', icon: UserCog },
            { to: '/appointments', label: 'Appointments', icon: Calendar },
            { to: '/ward-management', label: 'Ward Management', icon: BedDouble },
            { to: '/visitors', label: 'Visitors', icon: Eye },
            { to: '/reports', label: 'Reports', icon: FileText },
        ] : []),
    ];

    // FINANCIAL Section
    const financialSection = [
        ...(isStaff ? [
            { to: '/billing', label: 'Billing', icon: CreditCard },
            { to: '/insurance', label: 'Insurance', icon: Shield },
            { to: '/donations', label: 'Donations', icon: Gift },
        ] : []),
    ];

    // ADMIN Section
    const adminSection = [
        ...(isAdmin ? [
            { to: '/users', label: 'All Users', icon: UserPlus },
            { to: '/staff', label: 'Staff', icon: UserRound },
            { to: '/attendance-logs', label: 'Attendance Logs', icon: ClipboardCheck },
            { to: '/settings', label: 'Settings', icon: Settings },
        ] : []),
    ];

    const renderNavItem = (item) => (
        <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : undefined}
        >
            <item.icon size={20} />
            {!collapsed && <span>{item.label}</span>}
        </NavLink>
    );

    const renderSection = (title, items) => {
        if (items.length === 0) return null;
        return (
            <div className="mb-3">
                {!collapsed && <div className="sidebar-section-title">{title}</div>}
                {items.map(renderNavItem)}
            </div>
        );
    };

    return (
        <motion.aside
            className="sidebar-container d-flex flex-column"
            animate={{ width: collapsed ? 80 : 280 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
            {/* Logo/Header */}
            <div className="p-3 d-flex align-items-center gap-2" style={{ borderBottom: '1px solid var(--border-dark)' }}>
                <Link to="/dashboard" className="d-flex align-items-center gap-2 text-decoration-none">
                    <div
                        className="d-flex align-items-center justify-content-center rounded-xl"
                        style={{
                            width: 40,
                            height: 40,
                            background: 'linear-gradient(135deg, #1a3a4a 0%, #5eaab5 100%)',
                            boxShadow: '0 4px 12px rgba(26, 58, 74, 0.25)'
                        }}
                    >
                        <Activity size={22} className="text-white" />
                    </div>
                    {!collapsed && (
                        <span className="fw-bold" style={{ fontSize: '1.125rem', color: 'var(--text-main)' }}>
                            MediSphere
                        </span>
                    )}
                </Link>
                {!collapsed && (
                    <button
                        onClick={toggleCollapsed}
                        className="btn-icon ms-auto"
                        style={{ width: 32, height: 32 }}
                    >
                        <ChevronLeft size={16} />
                    </button>
                )}
            </div>

            {/* Search */}
            {!collapsed && (
                <div className="p-3">
                    <div className="position-relative">
                        <Search size={16} className="position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="search"
                            className="search-bar"
                            placeholder="Search..."
                            style={{ paddingLeft: '38px' }}
                        />
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-grow-1 py-2 px-3 overflow-auto">
                {/* Main Navigation */}
                {renderSection('MAIN MENU', mainNavItems)}

                {/* AI Tools Section - Staff & Doctors */}
                {(isStaff || isDoctor) && renderSection('AI TOOLS', aiToolsSection)}

                {/* Financial Section - Staff only */}
                {renderSection('FINANCIAL', financialSection)}

                {/* Admin Section - Admin only */}
                {renderSection('ADMIN', adminSection)}
            </nav>

            {/* Footer - User Info */}
            <div className="p-3" style={{ borderTop: '1px solid var(--border-dark)' }}>
                <div className="d-flex align-items-center gap-2">
                    <div
                        className="avatar avatar-primary"
                        style={{
                            width: 40,
                            height: 40,
                            fontSize: '0.875rem',
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)'
                        }}
                    >
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    {!collapsed && (
                        <div className="flex-grow-1">
                            <div className="fw-semibold small" style={{ color: 'var(--text-main)', lineHeight: 1.2 }}>
                                {user?.name}
                            </div>
                            <div className="small text-capitalize" style={{ color: 'var(--text-muted)', lineHeight: 1.2 }}>
                                {user?.role}
                            </div>
                        </div>
                    )}
                    {!collapsed && (
                        <div className="d-flex gap-1">
                            <Link to="/profile" className="btn-icon" style={{ width: 32, height: 32 }} title="Profile">
                                <Settings size={16} />
                            </Link>
                            <button
                                className="btn-icon"
                                style={{ width: 32, height: 32 }}
                                title="Logout"
                                onClick={logout}
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    )}
                </div>
                {collapsed && (
                    <div className="d-flex flex-column gap-2 mt-2">
                        <button
                            onClick={toggleCollapsed}
                            className="btn-icon w-100"
                            style={{ height: 40 }}
                        >
                            <ChevronRight size={18} />
                        </button>
                        <button
                            onClick={logout}
                            className="btn-icon w-100"
                            style={{ height: 40 }}
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                )}
            </div>
        </motion.aside>
    );
};

export default Sidebar;
