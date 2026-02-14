import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiLogOut, FiUser, FiHome, FiClock, FiFileText } from 'react-icons/fi';
import { useState } from 'react';

export default function Navbar() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">📄</span>
                    <span className="brand-text">ResumeATS</span>
                    <span className="brand-pro">Pro</span>
                </Link>

                <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>

                <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                    {user ? (
                        <>
                            <Link
                                to="/dashboard"
                                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                                onClick={() => setMenuOpen(false)}
                            >
                                <FiHome /> Dashboard
                            </Link>
                            <Link
                                to="/analyze"
                                className={`nav-link ${isActive('/analyze') ? 'active' : ''}`}
                                onClick={() => setMenuOpen(false)}
                            >
                                <FiFileText /> Analyze
                            </Link>
                            <Link
                                to="/history"
                                className={`nav-link ${isActive('/history') ? 'active' : ''}`}
                                onClick={() => setMenuOpen(false)}
                            >
                                <FiClock /> History
                            </Link>
                            <div className="nav-divider" />
                            <div className="nav-user">
                                <FiUser />
                                <span>{user.email}</span>
                            </div>
                            <button className="nav-btn logout-btn" onClick={handleSignOut}>
                                <FiLogOut /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="nav-btn login-btn"
                                onClick={() => setMenuOpen(false)}
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="nav-btn signup-btn"
                                onClick={() => setMenuOpen(false)}
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
