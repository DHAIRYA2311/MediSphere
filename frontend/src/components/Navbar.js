import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, User, LogOut, ChevronRight, Home } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ toggleSidebar, collapsed }) => {
    const { user, logout } = useAuth();
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

    return (
        <nav
            className="navbar navbar-expand bg-glass sticky-top px-4"
            style={{
                height: '72px',
                zIndex: 900,
                borderBottom: '1px solid var(--border-color)'
            }}
        >
            {/* Left Side: Breadcrumb */}
            <div className="d-flex align-items-center">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb mb-0 d-flex align-items-center">
                        <li className="breadcrumb-item">
                            <Link to="/dashboard" className="text-decoration-none d-flex align-items-center" style={{ color: 'var(--text-muted)' }}>
                                <Home size={16} />
                            </Link>
                        </li>
                        {breadcrumb.map((item, index) => (
                            <li key={index} className={`breadcrumb-item ${item.isLast ? 'active' : ''}`}>
                                {item.isLast ? (
                                    <span className="fw-semibold" style={{ color: 'var(--text-main)' }}>{item.label}</span>
                                ) : (
                                    <Link to={item.path} className="text-decoration-none" style={{ color: 'var(--text-muted)' }}>
                                        {item.label}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>
            </div>

            {/* Right Side: Actions */}
            <ul className="navbar-nav ms-auto align-items-center gap-2">
                {/* Search */}
                <li className="nav-item d-none d-lg-block">
                    <div className="position-relative">
                        <Search
                            size={16}
                            className="position-absolute"
                            style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                        />
                        <input
                            type="search"
                            className="search-bar"
                            placeholder="Search..."
                            style={{ width: '240px', paddingLeft: '40px' }}
                        />
                    </div>
                </li>

                {/* Notifications */}
                <li className="nav-item">
                    <NotificationDropdown />
                </li>

                {/* Profile Dropdown */}
                <li className="nav-item dropdown">
                    <a
                        className="nav-link dropdown-toggle d-flex align-items-center gap-2 p-1 rounded-xl"
                        href="#"
                        id="navbarDropdown"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        style={{ background: 'var(--bg-hover)', paddingRight: '12px' }}
                    >
                        <div className="avatar avatar-primary" style={{ width: 36, height: 36 }}>
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="d-none d-md-block text-start">
                            <span className="d-block fw-semibold" style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.2 }}>
                                {user?.name}
                            </span>
                            <span className="d-block text-capitalize" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>
                                {user?.role}
                            </span>
                        </div>
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown" style={{ minWidth: '200px' }}>
                        <li className="px-3 py-2">
                            <p className="mb-0 small fw-semibold" style={{ color: 'var(--text-main)' }}>{user?.name}</p>
                            <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                            <Link to="/profile" className="dropdown-item d-flex align-items-center gap-2">
                                <User size={16} /> Profile
                            </Link>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                            <button className="dropdown-item d-flex align-items-center gap-2 text-danger" onClick={logout}>
                                <LogOut size={16} /> Sign Out
                            </button>
                        </li>
                    </ul>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
