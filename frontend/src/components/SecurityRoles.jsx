import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/api';
import { Shield, Loader2, CheckCircle2, XCircle, FileText } from 'lucide-react';

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

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                setLoading(true);
                const apiUrl = API_BASE_URL;
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
                console.error(err);
                setError('Failed to fetch security roles.');
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
                                <h2 className="text-2xl font-bold text-slate-800">Requirements Analysis</h2>
                                <p className="text-slate-500 font-medium">Comparison against uploaded requirements</p>
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
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 hover:bg-emerald-500/20' // Present
                                        : 'bg-rose-500/10 border-rose-500/20 text-rose-800 hover:bg-rose-500/20'     // Missing
                                        }`}
                                >
                                    <span className="font-bold text-sm truncate pr-2" title={reqRole}>{reqRole}</span>
                                    {isPresent ? (
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-white/50 px-2 py-1 rounded-lg">
                                            <span>Match</span>
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-white/50 px-2 py-1 rounded-lg">
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
                <div className="flex items-center gap-4 pl-2">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/30">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Active Roles</h2>
                        <p className="text-slate-400 font-semibold">Total: {groups.length} roles assigned</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((group, index) => (
                        <motion.div
                            key={index}
                            variants={item}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="glass-panel p-6 rounded-2xl border border-white/20 bg-white/5 shadow-lg hover:shadow-2xl hover:shadow-infor-red/20 transition-all duration-300 flex items-start justify-between group cursor-default hover:border-infor-red/40"
                        >
                            <div className="w-full">
                                <h3 className="font-extrabold text-white text-xl group-hover:text-infor-red transition-colors truncate mb-3">
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
