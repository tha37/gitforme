    import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
    import axios from 'axios';

    const AuthContext = createContext(null);

    export const useAuth = () => {
        return useContext(AuthContext);
    };

    export const AuthProvider = ({ children }) => {
        const [user, setUser] = useState(null);
        const [isAuthenticated, setIsAuthenticated] = useState(false);
        const [isLoading, setIsLoading] = useState(true);

        useEffect(() => {
            const verifyUser = async () => {
                try {
                    const { data } = await axios.post(
                        'http://localhost:3000/api/auth/verifyUser',
                        {},
                        { withCredentials: true }
                    );
                    console.log("Data from /verifyUser:", data); // Add this line

                    // --- KEY CHANGE IS HERE ---
                    if (data && data.status) {
                        // Check if user data is nested. If not, use the top-level object.
                        const userData = data.user || data; 
                        
                        setUser(userData);
                        setIsAuthenticated(true);
                    } else {
                        // Ensure state is cleared if verification fails
                        setUser(null);
                        setIsAuthenticated(false);
                    }


                } 
                catch (error) {
                    // This catch block is important for when the cookie is invalid or expired
                    console.error("Verification on load failed:", error);
                    setUser(null);
                    setIsAuthenticated(false);
                } finally {
                    setIsLoading(false);
                }
            };
            verifyUser();
        }, []);

        const login = (userData) => {
            setUser(userData);
            setIsAuthenticated(true);
        };

        const logout = async () => {
            try {
                await axios.post('http://localhost:3000/api/auth/logout', {}, { withCredentials: true });
            } catch (error) {
                console.error("Logout failed:", error);
            } finally {
                setUser(null);
                setIsAuthenticated(false);
            }
        };
        
        // Memoizing the value prevents unnecessary re-renders in consumer components
        const value = useMemo(() => ({
            user,
            isAuthenticated,
            isLoading,
            login,
            logout,
        }), [user, isAuthenticated, isLoading]);

        return (
            <AuthContext.Provider value={value}>
                {/* This prevents UI flicker and rendering protected content before auth is confirmed */}
                {!isLoading && children}
            </AuthContext.Provider>
        );
    };
