import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Shield, Loader2, CheckCircle2, XCircle, FileText, Search, X } from 'lucide-react';

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

const SecurityRoles = () => {
    const { user, requirements } = useAuth(); // requirements from file upload
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                setLoading(true);
                const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
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

        fetchRoles();
    }, [user]);

    // Comparison Logic
    // Create a map of user's active roles (normalize to lowercase for case-insensitive matching)
    const activeRoleNames = new Set(groups.map(g => g.display?.trim().toLowerCase()));
    const hasRequirements = requirements && requirements.length > 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 min-h-[50vh]">
                <Loader2 className="w-12 h-12 text-white animate-spin drop-shadow-lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 glass-panel text-red-600 rounded-3xl border border-red-200/50 shadow-xl">
                <div className="flex items-center gap-3">
                    <XCircle className="w-6 h-6" />
                    <span className="font-semibold text-lg">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >

            {/* SECTION 1: REQUIREMENTS ANALYSIS (If file uploaded) */}
            {hasRequirements && (
                <motion.div
                    variants={item}
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
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' // Present: Light Green Text
                                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'     // Missing: Light Red Text
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
            <motion.div variants={item} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/30">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tight">Active Roles</h2>
                            <p className="text-slate-400 font-semibold">Total: {groups.length} roles assigned</p>
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
        </motion.div>
    );
};

export default SecurityRoles;
