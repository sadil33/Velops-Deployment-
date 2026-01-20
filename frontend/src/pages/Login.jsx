import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
    const [tenantUrl, setTenantUrl] = useState('');
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleConnect = async () => {
        if (!tenantUrl || !token) {
            setError('Please provide both Tenant URL and Access Token');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Validate connection by fetching "me" endpoint
            // We always default to the 'me' endpoint for validation login
            const endpoint = 'ifsservice/usermgt/v2/users/me';

            const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
            const res = await axios.post(`${apiUrl}/api/proxy`, {
                tenantUrl,
                endpoint,
                token,
                method: 'GET'
            });

            // If successful, store in context and redirect
            login(tenantUrl, token, res.data);
            navigate('/prerequisites');

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || err.message || 'Connection failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen animated-bg flex items-center justify-center p-4 selection:bg-infor-red selection:text-white">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-md w-full relative"
            >
                {/* Decorative glow */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-infor-red/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-700"></div>

                <div className="text-center mb-10 relative z-10">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="inline-flex items-center justify-center gap-2 mb-4 bg-white/5 backdrop-blur-md text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-white/10 shadow-lg"
                    >
                        <ShieldCheck className="w-3 h-3 text-infor-red" />
                        <span>Secure Gateway</span>
                    </motion.div>
                    <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-2xl mb-2 flex justify-center gap-1">
                        <span className="text-infor-red">Infor</span>
                        <span>Portal</span>
                    </h1>
                    <p className="text-slate-400 font-medium text-lg">Connect to your enterprise tenant</p>
                </div>

                <div className="glass-panel rounded-3xl shadow-2xl shadow-black/50 p-8 flex flex-col gap-6 backdrop-blur-3xl border border-white/10 relative z-10 bg-slate-900/60">
                    <div className="space-y-4">
                        <Input
                            label="Tenant URL"
                            placeholder="https://mingle-ionapi.inforcloudsuite.com/TENANTID/"
                            value={tenantUrl}
                            onChange={(e) => setTenantUrl(e.target.value)}
                        />

                        <Input
                            label="Access Token"
                            placeholder="Type your secure token..."
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            type="password"
                        />
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-white text-sm bg-infor-red/80 p-4 rounded-xl border border-red-500/50 backdrop-blur-sm shadow-lg font-medium"
                        >
                            {error}
                        </motion.div>
                    )}

                    <Button onClick={handleConnect} loading={loading}>
                        Connect Securely
                    </Button>

                    <div className="text-center">
                        <p className="text-xs text-slate-500 font-medium">Protected by Enterprise Grade Security</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
