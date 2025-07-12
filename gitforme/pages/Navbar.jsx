import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../src/context/AuthContext';
useAuth
const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <nav>
            <Link to="/">Home</Link>
            <div className="auth-links">
                {isAuthenticated ? (
                    <>
                        <span>Welcome, {user.username}!</span>
                        <button onClick={logout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/signup">Signup</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
