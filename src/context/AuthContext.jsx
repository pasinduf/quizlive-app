import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("auth_token");
            if (token) {
                try {
                    const { data } = await api.get('/auth/me');
                    setAdmin(data);
                } catch (err) {
                    console.error('Auth verification failed:', err);
                    localStorage.removeItem('auth_token');
                    setAdmin(null);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (username, password) => {
        const { data } = await api.post('/auth/login', { username, password });
        localStorage.setItem("auth_token", data.token);
        setAdmin(data.admin);
        return data;
    };

    const logout = () => {
        localStorage.removeItem("auth_token");
        setAdmin(null);
    };

    return (
        <AuthContext.Provider value={{ admin, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
