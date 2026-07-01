import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { fetchCurrentUser, loginUser, registerUser } from '../services/api';

const AuthContext = createContext(null);
const STORAGE_KEY = 'mystic-india-auth';

function getTokenExpiry(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [auth, setAuth] = useState(null);
    const [loading, setLoading] = useState(true);
    const timerRef = useRef(null);

    const clearAuth = () => {
        clearTimeout(timerRef.current);
        setAuth(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    const scheduleAutoLogout = (token) => {
        clearTimeout(timerRef.current);
        const expiry = getTokenExpiry(token);
        if (!expiry) return;
        const delay = expiry - Date.now();
        if (delay <= 0) { clearAuth(); return; }
        timerRef.current = setTimeout(clearAuth, delay);
    };

    useEffect(() => {
        async function restoreSession() {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) { setLoading(false); return; }
            try {
                const parsed = JSON.parse(saved);
                if (!parsed.token) { localStorage.removeItem(STORAGE_KEY); return; }

                const expiry = getTokenExpiry(parsed.token);
                if (expiry && Date.now() >= expiry) {
                    localStorage.removeItem(STORAGE_KEY);
                    return;
                }

                const user = await fetchCurrentUser(parsed.token);
                setAuth({ token: parsed.token, user });
                scheduleAutoLogout(parsed.token);
            } catch {
                localStorage.removeItem(STORAGE_KEY);
                setAuth(null);
            } finally {
                setLoading(false);
            }
        }

        restoreSession();

        window.addEventListener('auth:logout', clearAuth);
        return () => {
            window.removeEventListener('auth:logout', clearAuth);
            clearTimeout(timerRef.current);
        };
    }, []);

    const saveAuth = (nextAuth) => {
        setAuth(nextAuth);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
        scheduleAutoLogout(nextAuth.token);
    };

    const login = async (payload) => {
        const data = await loginUser(payload);
        saveAuth(data);
        return data;
    };

    const register = async (payload) => {
        const data = await registerUser(payload);
        saveAuth(data);
        return data;
    };

    const value = useMemo(
        () => ({
            token: auth?.token || null,
            user: auth?.user || null,
            isAdmin: auth?.user?.role === 'admin',
            loading,
            login,
            register,
            logout: clearAuth,
        }),
        [auth, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used inside AuthProvider');
    return context;
}
