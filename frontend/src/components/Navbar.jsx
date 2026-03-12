import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
    const { admin, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Hide navbar on login page
    if (location.pathname === '/') return null;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="app-navbar">
            <div className="navbar-brand">
                Team Dashboard
            </div>
            {admin && (
                <div className="navbar-right">
                    <span className="navbar-admin">
                        Welcome, {admin.emp_name}
                    </span>
                    <button
                        className="btn btn-outline-light btn-sm"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
}