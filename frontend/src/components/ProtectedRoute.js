import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary"></div></div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes('all') && !allowedRoles.includes(user.role.toLowerCase())) {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

export default ProtectedRoute;
