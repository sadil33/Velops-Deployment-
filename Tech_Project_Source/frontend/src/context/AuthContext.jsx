import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Helper to get initial stored value
const getStoredCount = (key) => {
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored, 10) : 0;
};

// Helper to get stored user session
const getStoredUser = () => {
    try {
        const stored = localStorage.getItem('infor_session');
        return stored ? JSON.parse(stored) : null;
    } catch (e) {
        console.error("Failed to parse stored session", e);
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    // User session: { tenantUrl, token, userData }
    // Initialize from localStorage to persist across refreshes
    const [user, setUser] = useState(getStoredUser);

    // Requirements: Array of strings (Role names extracted from file)
    const [requirements, setRequirements] = useState([]);

    // Persisted Metrics
    const [loginCount, setLoginCount] = useState(() => getStoredCount('infor_login_count'));
    const [deploymentCount, setDeploymentCount] = useState(() => getStoredCount('infor_deployment_count'));

    const login = async (tenantUrl, token, userData, loginType = 'PMO') => {
        const userId = userData?.response?.userlist?.[0]?.id || userData?.response?.userlist?.[0]?.GUID || 'Unknown';
        const sessionData = { tenantUrl, token, userData, userId, loginType };
        setUser(sessionData);
        // Persist session
        localStorage.setItem('infor_session', JSON.stringify(sessionData));

        // Increment login count
        const newCount = loginCount + 1;
        setLoginCount(newCount);
        localStorage.setItem('infor_login_count', newCount.toString());

        // Track User Activity on Backend
        try {
            // Extract user details defensively
            const username = userData?.response?.userlist?.[0]?.userName || 'Unknown';
            const displayName = userData?.response?.userlist?.[0]?.displayName || username;
            const email = userData?.response?.userlist?.[0]?.emails?.[0]?.value || '';
            const userId = userData?.response?.userlist?.[0]?.id || userData?.response?.userlist?.[0]?.GUID || 'Unknown';
            const tenantId = tenantUrl ? new URL(tenantUrl).pathname.split('/').filter(Boolean).pop() : 'Unknown';

            const apiUrl = import.meta.env.VITE_API_BASE_URL || '';
            await axios.post(`${apiUrl}/api/users/activity`, {
                username,
                displayName,
                email,
                userId,
                tenantId
            });
            console.log('[Auth] User activity recorded');
        } catch (error) {
            console.warn('[Auth] Failed to record user activity:', error);
        }
    };

    const logout = () => {
        setUser(null);
        setRequirements([]);
        localStorage.removeItem('infor_session');
        localStorage.removeItem('infor_extracted_roles');
        localStorage.removeItem('infor_chat_history');
    };

    const incrementDeployments = () => {
        const newCount = deploymentCount + 1;
        setDeploymentCount(newCount);
        localStorage.setItem('infor_deployment_count', newCount.toString());
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            requirements,
            setRequirements,
            metrics: { loginCount, deploymentCount },
            incrementDeployments
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
