import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCurrentUser,loginUser, registerUser } from '../services/api';

const AuthContext = createContext(null);
const STORAGE_KEY = 'mystic-india-auth';

export function AuthProvider({ children }) {
    const [auth, setAuth] = useState(null);
    const [loading,setLoading]=useState(true);

    useEffect(() => {
        async function restoreSession(){
            const savedAuth = localStorage.getItem(STORAGE_KEY)
            if(!savedAuth) {
                setLoading(false)
                return;
            }
            try{
                const parsedAuth =JSON.parse(savedAuth);
                if(!parsedAuth.token){
                    localStorage.removeItem(STORAGE_KEY);
                    return;
                }
                const user =await fetchCurrentUser(parsedAuth.token);
                setAuth({
                    token:parsedAuth.token,
                    user,
                });
            }
            catch(error){
                localStorage.removeItem(STORAGE_KEY);
                setAuth(null);
            }
            finally{
                setLoading(false)
            }
        }
        restoreSession();
        }
    , []);

    const saveAuth = (nextAuth) => {
        setAuth(nextAuth);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
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

    const logout = () => {
        setAuth(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    const value = useMemo(
        () => ({
            token: auth?.token || null,
            user: auth?.user || null,
            isAdmin: auth?.user?.role === 'admin',
            loading,
            login,
            register,
            logout,
        }),
        [auth,loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }
    return context;
}
