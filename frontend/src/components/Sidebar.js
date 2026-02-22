import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Stethoscope,
    UserCircle,
    Calendar,
    FileText,
    CreditCard,
    Activity,
    BedDouble,
    ScanFace,
    LogOut,
    UserCheck,
    ShieldCheck,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Gift,
    Scan,
    ClipboardList,
    Brain,
    ShieldAlert,
    Wallet,
    Boxes,
    BarChart3,
    Settings as SettingsIcon,
    Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ collapsed, toggleCollapsed }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    const role = user.role.toLowerCase();

    // Define sidebar configuration with sections and visibility rules
    const sidebarConfig = [
        {
            title: "Main",
            roles: ["all"],
            items: [
                { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['all'] },
                { path: '/staff-profile', label: 'Staff Profile', icon: UserCircle, roles: ['admin', 'staff', 'receptionist'] },
            ]
        },
        {
            title: "Patient Care",
            roles: ["admin", "doctor", "receptionist", "patient"],
            items: [
                { path: '/appointments', label: role === 'patient' ? 'My Appointments' : 'Appointments', icon: Calendar, roles: ['admin', 'receptionist', 'doctor', 'patient'] },
                { path: '/patients', label: 'Patients', icon: Activity, roles: ['admin', 'doctor', 'receptionist'] },
            ]
        },
        {
            title: "Medical Records",
            roles: ["admin", "doctor", "receptionist", "patient"],
            items: [
                { path: '/documents', label: 'Documents', icon: FileText, roles: ['admin', 'doctor', 'receptionist', 'patient'] },
                { path: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'doctor', 'patient'] },
            ]
        },
        {
            title: "🤖 AI Tools",
            roles: ["admin", "doctor", "staff"],
            items: [
                { path: '/ai-prediction', label: 'AI Diagnosis', icon: Brain, roles: ['admin', 'doctor'] },
                { path: '/xray-analysis', label: 'X-Ray Analysis', icon: Scan, roles: ['admin', 'doctor'] },
                { path: '/face-attendance', label: 'Face Attendance', icon: ScanFace, roles: ['admin', 'staff'] },
            ]
        },
        {
            title: "Financial",
            roles: ["admin", "receptionist", "patient"],
            items: [
                { path: '/billing', label: 'Billing', icon: CreditCard, roles: ['admin', 'receptionist', 'patient'] },
                { path: '/insurance', label: 'Insurance & Claims', icon: ShieldCheck, roles: ['admin', 'receptionist', 'patient'] },
                { path: '/donations', label: 'Donations', icon: Gift, roles: ['admin', 'patient'] },
            ]
        },
        {
            title: "Operations",
            roles: ["admin", "receptionist", "staff", "doctor"],
            items: [
                { path: '/ward-management', label: 'Ward Management', icon: BedDouble, roles: ['admin', 'receptionist', 'staff', 'doctor'] },
                { path: '/visitors', label: 'Visitor Logs', icon: UserCheck, roles: ['admin', 'receptionist', 'staff'] },
            ]
        },
        {
            title: "Security & Logs",
            roles: ["admin", "staff"],
            items: [
                { path: '/attendance-logs', label: 'Attendance Logs', icon: ClipboardList, roles: ['admin', 'staff'] },
                { path: '/monitoring', label: 'Monitoring & Logs', icon: Terminal, roles: ['admin'] },
            ]
        },
        {
            title: "Core Management",
            roles: ["admin"],
            items: [
                { path: '/users', label: 'Users', icon: Users, roles: ['admin'] },
                { path: '/doctors', label: 'Doctors', icon: Stethoscope, roles: ['admin'] },
                { path: '/staff', label: 'Staff', icon: UserCircle, roles: ['admin'] },
            ]
        },
        {
            title: "Administration",
            roles: ["admin"],
            items: [
                { path: '/settings', label: 'System Settings', icon: SettingsIcon, roles: ['admin'] },
            ]
        }
    ];

    // Filter configuration based on role
    const filteredConfig = sidebarConfig.map(section => ({
        ...section,
        items: section.items.filter(item =>
            item.roles.includes('all') || item.roles.includes(role)
        )
    })).filter(section => section.items.length > 0);

    return (
        <motion.div
            animate={{ width: collapsed ? '80px' : '280px' }}
            className="sidebar-container d-flex flex-column border-end shadow-sm"
            style={{
                height: '100vh',
                position: 'fixed',
                zIndex: 1000,
                background: '#0f172a', // Sidebar dark blue
                overflow: 'hidden'
            }}
        >
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between p-3 mb-2" style={{ height: '70px' }}>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="d-flex align-items-center gap-2 overflow-hidden"
                        >
                            <div className="bg-primary rounded-3 d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                                <Activity size={20} className="text-white" />
                            </div>
                            <span className="fw-bold fs-5 text-white tracking-tight">Medisphere</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={toggleCollapsed}
                    className="btn btn-link text-white-50 p-1 text-decoration-none hover-white"
                >
                    {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Nav Items */}
            <div className="flex-grow-1 overflow-y-auto overflow-x-hidden px-2 py-2 no-scrollbar">
                {filteredConfig.map((section, sIdx) => (
                    <div key={sIdx} className="mb-3">
                        {!collapsed && section.title !== "Main" && (
                            <div className="px-3 mb-2">
                                <span className="text-white-50 text-uppercase fw-bold tracking-wider" style={{ fontSize: '0.65rem' }}>
                                    {section.title}
                                </span>
                            </div>
                        )}
                        <ul className="nav nav-pills flex-column gap-1">
                            {section.items.map((item) => (
                                <li className="nav-item" key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `nav-link-custom ${isActive ? 'active' : ''} ${collapsed ? 'justify-content-center px-0' : ''}`
                                        }
                                        title={collapsed ? item.label : ''}
                                    >
                                        <item.icon size={20} strokeWidth={1.5} />
                                        {!collapsed && <span className="text-truncate">{item.label}</span>}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Footer / User Profile */}
            <div className="p-3 border-top border-secondary border-opacity-25 mt-auto">
                <div className={`d-flex align-items-center ${collapsed ? 'justify-content-center' : 'gap-3'}`}>
                    <div
                        className="rounded-circle bg-primary d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 40, height: 40, cursor: 'pointer' }}
                        onClick={() => navigate('/profile')}
                    >
                        <span className="fw-bold text-white font-monospace">{user.name.charAt(0)}</span>
                    </div>

                    {!collapsed && (
                        <div className="overflow-hidden">
                            <h6 className="m-0 text-white text-truncate fw-semibold" style={{ fontSize: '0.9rem' }}>{user.name}</h6>
                            <small className="text-white-50 text-capitalize" style={{ fontSize: '0.75rem' }}>{role}</small>
                        </div>
                    )}

                    {!collapsed && (
                        <button
                            onClick={handleLogout}
                            className="btn btn-link text-white-50 ms-auto p-0"
                            title="Sign Out"
                        >
                            <LogOut size={18} />
                        </button>
                    )}
                </div>
            </div>

        </motion.div>
    );
};

export default Sidebar;
