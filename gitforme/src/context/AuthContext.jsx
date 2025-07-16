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
                      const apiServerUrl = import.meta.env.VITE_API_URL;
                    const { data } = await axios.post(
                        `${apiServerUrl}/api/auth/verifyUser`,
                        {},
                        { withCredentials: true }
                    );
                    console.log("Data from /verifyUser:", data); 

                    if (data && data.status) {
                        const userData = data.user || data; 
                        
                        setUser(userData);
                        setIsAuthenticated(true);
                    } else {
                        setUser(null);
                        setIsAuthenticated(false);
                    }


                } 
                catch (error) {
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
                const apiServerUrl = import.meta.env.VITE_API_URL;
                await axios.post(`${apiServerUrl}/api/auth/logout`, {}, { withCredentials: true });
            } catch (error) {
                console.error("Logout failed:", error);
            } finally {
                setUser(null);
                setIsAuthenticated(false);
            }
        };
        
        const value = useMemo(() => ({
            user,
            isAuthenticated,
            isLoading,
            login,
            logout,
        }), [user, isAuthenticated, isLoading]);

        return (
            <AuthContext.Provider value={value}>
                {!isLoading && children}
            </AuthContext.Provider>
        );
    };
