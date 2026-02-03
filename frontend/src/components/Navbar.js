import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, Menu, User, Settings, LogOut } from 'lucide-react';

const Navbar = ({ toggleSidebar, collapsed }) => {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar navbar-expand bg-white border-bottom shadow-sm sticky-top px-4" style={{ height: '70px', zIndex: 900 }}>
            {/* Left Side: Mobile Menu Toggle / Breadcrumb (Optional) */}
            <div className="d-flex align-items-center">

                {/* Search Bar */}
                <div className="position-relative d-none d-md-block ms-3" style={{ minWidth: '300px' }}>
                    <Search className="position-absolute ms-3 text-muted" size={18} style={{ top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="search"
                        className="form-control ps-5 bg-light border-0"
                        placeholder="Search for patients, appointments..."
                        style={{ borderRadius: '20px' }}
                    />
                </div>
            </div>

            {/* Right Side: Actions */}
            <ul className="navbar-nav ms-auto align-items-center gap-3">
                {/* Notifications */}
                <li className="nav-item position-relative">
                    <button className="btn btn-light rounded-circle p-2 position-relative text-muted">
                        <Bell size={20} />
                        <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                            <span className="visually-hidden">New alerts</span>
                        </span>
                    </button>
                </li>

                {/* Profile Dropdown */}
                <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle d-flex align-items-center gap-2" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: 36, height: 36 }}>
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="d-none d-lg-block fw-medium text-dark">{user?.name}</span>
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end border-0 shadow-lg p-2" aria-labelledby="navbarDropdown" style={{ borderRadius: '12px', minWidth: '200px' }}>
                        <li><h6 className="dropdown-header text-uppercase fs-7 fw-bold text-muted">Account</h6></li>
                        <li>
                            <button className="dropdown-item d-flex align-items-center gap-2 rounded-2 py-2">
                                <User size={16} /> Profile
                            </button>
                        </li>
                        <li>
                            <button className="dropdown-item d-flex align-items-center gap-2 rounded-2 py-2">
                                <Settings size={16} /> Settings
                            </button>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                            <button className="dropdown-item d-flex align-items-center gap-2 rounded-2 py-2 text-danger" onClick={logout}>
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
