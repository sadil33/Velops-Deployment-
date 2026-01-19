import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Helper to get initial stored value
const getStoredCount = (key) => {
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored, 10) : 0;
};

export const AuthProvider = ({ children }) => {
    // User session: { tenantUrl, token, userData }
    const [user, setUser] = useState(null);

    // Requirements: Array of strings (Role names extracted from file)
    const [requirements, setRequirements] = useState([]);

    // Persisted Metrics
    const [loginCount, setLoginCount] = useState(() => getStoredCount('infor_login_count'));
    const [deploymentCount, setDeploymentCount] = useState(() => getStoredCount('infor_deployment_count'));

    const login = async (tenantUrl, token, userData) => {
        setUser({ tenantUrl, token, userData });

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
            const tenantId = tenantUrl ? new URL(tenantUrl).pathname.split('/').filter(Boolean).pop() : 'Unknown';

            const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
            await axios.post(`${apiUrl}/api/users/activity`, {
                username,
                displayName,
                email,
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
