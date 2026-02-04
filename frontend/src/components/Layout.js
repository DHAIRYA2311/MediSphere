import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { motion } from 'framer-motion';
import QuickAppointmentModal from './QuickAppointmentModal';
import { useEffect } from 'react';

const Layout = ({ children }) => {
    const { user } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [isQuickBookOpen, setIsQuickBookOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            // F4 Key for Quick Appointment - Only for staff/admin/receptionist
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

    if (!user) {
        return <>{children}</>;
    }

    const toggleCollapsed = () => setCollapsed(!collapsed);

    return (
        <div className="d-flex bg-light min-vh-100">
            {/* Sidebar */}
            <Sidebar collapsed={collapsed} toggleCollapsed={toggleCollapsed} />

            {/* Main Content Wrapper */}
            <motion.div
                className="d-flex flex-column flex-grow-1"
                animate={{ marginLeft: collapsed ? '80px' : '280px' }}
                style={{
                    minHeight: '100vh',
                    transition: 'margin-left 0.3s ease' // Fallback for motion if needed, but motion should handle it
                }}
            >
                {/* Navbar */}
                <Navbar toggleSidebar={toggleCollapsed} collapsed={collapsed} />

                {/* Page Content */}
                <div className="p-4" style={{ maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
                    {children}
                </div>
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
