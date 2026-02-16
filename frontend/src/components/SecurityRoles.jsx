import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Shield, Loader2, CheckCircle2, XCircle, FileText, Search, X, Bot, Wrench, Zap, Database, Brain } from 'lucide-react';

// Security Roles Component
const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const tabContent = {
    hidden: { opacity: 0, x: -20 },
    show: {
        opacity: 1,
        x: 0,
        transition: {
            staggerChildren: 0.1
        }
    },
    exit: { opacity: 0, x: 20 }
};

export const CSPTools = ({ className, compact }) => {
    const { user } = useAuth();
    const [status, setStatus] = useState({ loading: true, provisioned: false, error: null });
    const [ionStatus, setIonStatus] = useState({ loading: true, provisioned: false, error: null });
    const [dataFabricStatus, setDataFabricStatus] = useState({ loading: true, provisioned: false, error: null });
    const [inforAiStatus, setInforAiStatus] = useState({ loading: true, provisioned: false, error: null });
    const [ifsStatus, setIfsStatus] = useState({ loading: true, provisioned: false, error: null });
    const [reviewCenterStatus, setReviewCenterStatus] = useState({ loading: true, provisioned: false, error: null });
    const [rpaManagementStatus, setRpaManagementStatus] = useState({ loading: true, provisioned: false, error: null });

    const loadedUserRef = useRef(null);
    const loadedIonUserRef = useRef(null);
    const loadedDataFabricUserRef = useRef(null);
    const loadedInforAiUserRef = useRef(null);
    const loadedIfsUserRef = useRef(null);
    const loadedReviewCenterUserRef = useRef(null);
    const loadedRpaManagementUserRef = useRef(null);

    useEffect(() => {
        const checkProvisioning = async () => {
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/csp/genai/check`,
                    {
                        tenantUrl: user.tenantUrl,
                        token: user.token
                    }
                );

                if (response.data?.isProvisioned) {
                    setStatus({ loading: false, provisioned: true, error: null });
                } else {
                    setStatus({ loading: false, provisioned: false, error: null });
                }
            } catch (err) {
                console.error("CSP Tools Check Error:", err);
                setStatus({ loading: false, provisioned: false, error: err.response?.data?.error || err.message || 'Check failed' });
            }
        };

        const checkIonProvisioning = async () => {
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/csp/ion/check`,
                    {
                        tenantUrl: user.tenantUrl,
                        token: user.token
                    }
                );

                if (response.data?.isProvisioned) {
                    setIonStatus({ loading: false, provisioned: true, error: null });
                } else {
                    setIonStatus({ loading: false, provisioned: false, error: null });
                }
            } catch (err) {
                console.error("CSP Ion Check Error:", err);
                setIonStatus({ loading: false, provisioned: false, error: err.response?.data?.error || err.message || 'Check failed' });
            }
        };

        const checkDataFabricProvisioning = async () => {
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/csp/datafabric/check`,
                    {
                        tenantUrl: user.tenantUrl,
                        token: user.token
                    }
                );

                if (response.data?.isProvisioned) {
                    setDataFabricStatus({ loading: false, provisioned: true, error: null });
                } else {
                    setDataFabricStatus({ loading: false, provisioned: false, error: null });
                }
            } catch (err) {
                console.error("CSP Data-Fabric Check Error:", err);
                setDataFabricStatus({ loading: false, provisioned: false, error: err.response?.data?.error || err.message || 'Check failed' });
            }
        };

        const checkInforAiProvisioning = async () => {
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/csp/inforai/check`,
                    {
                        tenantUrl: user.tenantUrl,
                        token: user.token
                    }
                );

                if (response.data?.isProvisioned) {
                    setInforAiStatus({ loading: false, provisioned: true, error: null });
                } else {
                    setInforAiStatus({ loading: false, provisioned: false, error: null });
                }
            } catch (err) {
                console.error("CSP Infor-AI Check Error:", err);
                setInforAiStatus({ loading: false, provisioned: false, error: err.response?.data?.error || err.message || 'Check failed' });
            }
        };

        const checkIfsProvisioning = async () => {
            try {
                // Using the proxy to check ifsservice availability via user check
                const response = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/proxy`,
                    {
                        tenantUrl: user.tenantUrl,
                        endpoint: 'ifsservice/usermgt/v2/users/me',
                        token: user.token,
                        method: 'GET'
                    }
                );

                if (response.status === 200) {
                    setIfsStatus({ loading: false, provisioned: true, error: null });
                } else {
                    setIfsStatus({ loading: false, provisioned: false, error: null });
                }
            } catch (err) {
                console.error("CSP IFS Check Error:", err);
                setIfsStatus({ loading: false, provisioned: false, error: err.response?.data?.error || err.message || 'Check failed' });
            }
        };

        const checkReviewCenterProvisioning = async () => {
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/proxy`,
                    {
                        tenantUrl: user.tenantUrl,
                        endpoint: 'RPA/rpaactuatorsvc/api/v1/rpa/exception/usecasetypes?page=0&size=20',
                        token: user.token,
                        method: 'GET'
                    }
                );

                if (response.status === 200) {
                    setReviewCenterStatus({ loading: false, provisioned: true, error: null });
                } else {
                    setReviewCenterStatus({ loading: false, provisioned: false, error: null });
                }
            } catch (err) {
                console.error("CSP Review-Center Check Error:", err);
                setReviewCenterStatus({ loading: false, provisioned: false, error: err.response?.data?.error || err.message || 'Check failed' });
            }
        };

        const checkRpaManagementProvisioning = async () => {
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/proxy`,
                    {
                        tenantUrl: user.tenantUrl,
                        endpoint: 'RPA/api/v1/rpa/process?environment=default',
                        token: user.token,
                        method: 'GET'
                    }
                );

                if (response.status === 200) {
                    setRpaManagementStatus({ loading: false, provisioned: true, error: null });
                } else {
                    setRpaManagementStatus({ loading: false, provisioned: false, error: null });
                }
            } catch (err) {
                console.error("CSP RPA-Management Check Error:", err);
                setRpaManagementStatus({ loading: false, provisioned: false, error: err.response?.data?.error || err.message || 'Check failed' });
            }
        };

        if (user && user.token && user.tenantUrl) {
            // Check GenAI
            if (loadedUserRef.current !== user.token) {
                loadedUserRef.current = user.token;
                checkProvisioning();
            }

            // Check Ion
            if (loadedIonUserRef.current !== user.token) {
                loadedIonUserRef.current = user.token;
                checkIonProvisioning();
            }

            // Check DataFabric
            if (loadedDataFabricUserRef.current !== user.token) {
                loadedDataFabricUserRef.current = user.token;
                checkDataFabricProvisioning();
            }

            // Check InforAI
            if (loadedInforAiUserRef.current !== user.token) {
                loadedInforAiUserRef.current = user.token;
                checkInforAiProvisioning();
            }

            // Check IFS
            if (loadedIfsUserRef.current !== user.token) {
                loadedIfsUserRef.current = user.token;
                checkIfsProvisioning();
            }

            // Check Review Center
            if (loadedReviewCenterUserRef.current !== user.token) {
                loadedReviewCenterUserRef.current = user.token;
                checkReviewCenterProvisioning();
            }

            // Check RPA Management
            if (loadedRpaManagementUserRef.current !== user.token) {
                loadedRpaManagementUserRef.current = user.token;
                checkRpaManagementProvisioning();
            }
        }
    }, [user]);

    if (status.loading && ionStatus.loading && dataFabricStatus.loading && inforAiStatus.loading && ifsStatus.loading && reviewCenterStatus.loading && rpaManagementStatus.loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
                <Loader2 className="w-10 h-10 text-infor-red animate-spin mb-4" />
                <p className="text-slate-400">Checking provisioning status...</p>
            </div>
        );
    }

    // Color Mapping
    const colorMap = {
        'IFS-Services': { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/20', glow: 'shadow-blue-500/10' },
        'Gen-AI Services': { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/10' },
        'Ion-Services': { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/20', glow: 'shadow-purple-500/10' },
        'Data-Fabric': { bg: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-500/20', glow: 'shadow-cyan-500/10' },
        'Infor-AI': { bg: 'bg-indigo-500', text: 'text-indigo-400', border: 'border-indigo-500/20', glow: 'shadow-indigo-500/10' },
        'Review-Center': { bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/20', glow: 'shadow-rose-500/10' },
        'RPA-Management': { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/20', glow: 'shadow-amber-500/10' },
    };

    // Helper to render responsive cards
    const CSPCard = ({ title, description, status, Icon, code }) => {
        const colors = colorMap[title] || { bg: 'bg-slate-500', text: 'text-slate-400', border: 'border-white/10', glow: 'shadow-white/5' };

        return (
            <div className={`${compact ? 'p-3 rounded-xl border' : 'p-6 rounded-2xl border'} backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${status.provisioned
                    ? `bg-slate-900/60 ${colors.border} shadow-lg ${colors.glow} hover:${colors.border}`
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}>
                <div className="flex items-center justify-between mb-3">
                    <div className={`transition-all duration-300 ${compact ? 'p-2 rounded-lg' : 'p-3 rounded-xl'} ${status.provisioned ? `${colors.bg}/20 text-white` : 'bg-white/5 text-slate-400 group-hover:bg-white/10'
                        }`}>
                        <Icon className={`${compact ? 'w-4 h-4' : 'w-6 h-6'} ${status.provisioned ? colors.text : 'text-slate-400'}`} />
                    </div>
                    {status.loading ? (
                        <Loader2 className={`${compact ? 'w-3 h-3' : 'w-5 h-5'} text-slate-400 animate-spin`} />
                    ) : status.provisioned ? (
                        <div className={`${compact ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'} ${colors.bg}/10 border ${colors.border} rounded-lg ${colors.text} font-bold uppercase tracking-wider flex items-center gap-1.5`}>
                            {compact ? 'Active' : 'Provisioned'}
                            <CheckCircle2 className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
                        </div>
                    ) : (
                        <div className={`${compact ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'} bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5`}>
                            Missing
                            <XCircle className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
                        </div>
                    )}
                </div>

                <h3 className={`${compact ? 'text-sm' : 'text-lg'} font-bold text-white mb-1 group-hover:text-white transition-colors`}>{title}</h3>

                {!compact && (
                    <p className="text-slate-400 text-sm leading-relaxed mb-3">
                        {description} <code className="bg-white/5 px-1.5 py-0.5 rounded text-slate-300 border border-white/5 font-mono text-xs">{code}</code>.
                    </p>
                )}

                {compact && status.provisioned && (
                    <div className={`h-1 w-full rounded-full ${colors.bg}/20 mt-2 overflow-hidden`}>
                        <div className={`h-full w-full ${colors.bg} animate-pulse`}></div>
                    </div>
                )}

                {!status.provisioned && status.error && (
                    <div className={`mt-2 p-2 bg-red-500/5 border border-red-500/10 rounded-lg text-xs text-red-300 leading-tight flex gap-2 items-start`}>
                        <XCircle className="w-3 h-3 mt-0.5 shrink-0" />
                        {status.error}
                    </div>
                )}
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={className || "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}
        >
            <CSPCard title="IFS-Services" description="Core services check via" code="ifsservice" status={ifsStatus} Icon={Shield} />
            <CSPCard title="Gen-AI Services" description="Generative capabilities via" code="chatsvc" status={status} Icon={Bot} />
            <CSPCard title="Ion-Services" description="Messaging service via" code="IONSERVICES" status={ionStatus} Icon={Zap} />
            <CSPCard title="Data-Fabric" description="Data Lake services via" code="DATAFABRIC" status={dataFabricStatus} Icon={Database} />
            <CSPCard title="Infor-AI" description="Coleman AI models via" code="COLEMANAI" status={inforAiStatus} Icon={Brain} />
            <CSPCard title="Review-Center" description="RPA Review Center via" code="RPA/actuatorsvc" status={reviewCenterStatus} Icon={FileText} />
            <CSPCard title="RPA-Management" description="RPA Process Services via" code="RPA/api" status={rpaManagementStatus} Icon={Wrench} />
        </motion.div>
    );
};

const SecurityRoles = () => {
    const { user, requirements } = useAuth(); // requirements from file upload
    const [activeTab, setActiveTab] = useState('roles');
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_BASE_URL ?? '';
            const res = await axios.post(`${apiUrl}/api/proxy`, {
                tenantUrl: user.tenantUrl,
                endpoint: 'ifsservice/usermgt/v2/users/me',
                token: user.token,
                method: 'GET'
            });

            const userList = res.data?.response?.userlist;
            if (userList && userList.length > 0) {
                setGroups(userList[0].groups || []);
            } else {
                setGroups([]);
            }

        } catch (err) {
            console.error("Security Roles Fetch Error:", err);
            const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch security roles.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const loadedUserRef = useRef(null);

    useEffect(() => {
        // Prevent double-call in StrictMode or if user reference changes but content is same
        if (user && user.token && user.tenantUrl) {
            // Simple check: if we already fetched for this specific user token, don't auto-fetch again
            // unless it's a manual refresh.
            if (loadedUserRef.current === user.token) {
                return;
            }

            loadedUserRef.current = user.token;
            fetchRoles();
        }
    }, [user]);

    const handleRefresh = () => {
        fetchRoles();
    };

    // Comparison Logic
    const activeRoleNames = new Set(groups.map(g => g.display?.trim().toLowerCase()));
    const hasRequirements = requirements && requirements.length > 0;

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            {/* Tabs Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => setActiveTab('roles')}
                    className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'roles'
                        ? 'bg-infor-red text-white shadow-lg shadow-infor-red/20 ring-1 ring-white/20'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    <Shield className="w-4 h-4" />
                    Security Roles
                </button>
                <button
                    onClick={() => setActiveTab('csp-tools')}
                    className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'csp-tools'
                        ? 'bg-infor-red text-white shadow-lg shadow-infor-red/20 ring-1 ring-white/20'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    <Wrench className="w-4 h-4" />
                    CSP Tools
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'roles' ? (
                    <motion.div
                        key="roles"
                        variants={tabContent}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        className="space-y-8"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center p-12 min-h-[50vh]">
                                <Loader2 className="w-12 h-12 text-white animate-spin drop-shadow-lg" />
                            </div>
                        ) : error ? (
                            <div className="p-8 glass-panel text-red-600 rounded-3xl border border-red-200/50 shadow-xl">
                                <div className="flex items-center gap-3">
                                    <XCircle className="w-6 h-6" />
                                    <span className="font-semibold text-lg">{error}</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* SECTION 1: REQUIREMENTS ANALYSIS */}
                                {hasRequirements && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="glass-panel rounded-3xl overflow-hidden shadow-2xl"
                                    >
                                        <div className="p-8 border-b border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className="p-4 bg-purple-500/20 text-purple-600 rounded-2xl shadow-inner border border-purple-500/30">
                                                    <FileText className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-bold text-white">Requirements Analysis</h2>
                                                    <p className="text-slate-300 font-medium">Comparison against uploaded requirements</p>
                                                </div>
                                            </div>
                                            <div className="text-sm font-bold px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg">
                                                {requirements.length} Required Roles
                                            </div>
                                        </div>

                                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {requirements.map((reqRole, idx) => {
                                                const isPresent = activeRoleNames.has(reqRole.trim().toLowerCase());
                                                return (
                                                    <motion.div
                                                        key={idx}
                                                        whileHover={{ scale: 1.02 }}
                                                        className={`flex items-center justify-between p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 ${isPresent
                                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                                                            }`}
                                                    >
                                                        <span className="font-bold text-sm truncate pr-2" title={reqRole}>{reqRole}</span>
                                                        {isPresent ? (
                                                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-lg border border-emerald-500/20">
                                                                <span>Match</span>
                                                                <CheckCircle2 className="w-4 h-4" />
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300 bg-rose-500/20 px-3 py-1 rounded-lg border border-rose-500/20">
                                                                <span>Missing</span>
                                                                <XCircle className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}

                                {/* SECTION 2: ALL ACTIVE ROLES */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="space-y-6"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-2">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/30">
                                                <Shield className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-black text-white tracking-tight">Active Roles</h2>
                                                <div className="flex items-center gap-4">
                                                    <p className="text-slate-400 font-semibold">Total: {groups.length} roles assigned</p>
                                                    <button
                                                        onClick={handleRefresh}
                                                        className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-colors border border-white/5 hover:border-white/20"
                                                        title="Refresh Roles"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}>
                                                            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                                            <path d="M3 3v5h5" />
                                                            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                                                            <path d="M16 21h5v-5" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Search Box */}
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Search roles..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="bg-slate-900/50 text-white pl-10 pr-10 py-3 rounded-xl border border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none w-full md:w-72 transition-all placeholder:text-slate-500 backdrop-blur-sm"
                                            />
                                            {searchTerm && (
                                                <button
                                                    onClick={() => setSearchTerm('')}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {groups
                                            .filter(group => {
                                                if (!searchTerm) return true;
                                                return (group?.display || '').toLowerCase().includes(searchTerm.toLowerCase());
                                            })
                                            .map((group, index) => (
                                                <motion.div
                                                    key={group.display || index}
                                                    layout
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 20 }}
                                                    whileHover={{ y: -5, scale: 1.02 }}
                                                    className="glass-panel p-6 rounded-2xl border border-white/20 bg-white/5 shadow-lg hover:shadow-2xl hover:shadow-infor-red/20 transition-all duration-300 flex items-start justify-between group cursor-default hover:border-infor-red/40"
                                                >
                                                    <div className="w-full">
                                                        <h3 className="font-extrabold text-white text-xl group-hover:text-infor-red transition-colors truncate mb-3" title={group.display}>
                                                            {group.display}
                                                        </h3>
                                                        <div className="flex justify-between items-center w-full">
                                                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider bg-white/10 px-3 py-1 rounded-lg border border-white/5">
                                                                {group.type || 'Group'}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active</span>
                                                                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="csp-tools"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <CSPTools />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SecurityRoles;
