import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Users, Clock, Database, ArrowUpRight, Zap, Copy, Check, TicketPercent } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CSPTools } from '../components/SecurityRoles';

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

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, metrics } = useAuth();

    // Tenant Logic
    const getTenantId = () => {
        if (!user?.tenantUrl) return 'N/A';
        try {
            const url = new URL(user.tenantUrl);
            const pathSegments = url.pathname.split('/').filter(Boolean);
            return pathSegments[pathSegments.length - 1] || 'Unknown';
        } catch (e) {
            return 'Unknown';
        }
    };

    const tenantId = getTenantId();
    const userName = user?.userData?.response?.userlist?.[0]?.displayName || 'Administrator';
    const userId = user?.userId || 'N/A';
    const isPMO = user?.loginType === 'PMO';

    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        if (userId === 'N/A') return;
        navigator.clipboard.writeText(userId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const stats = [
        {
            title: "Active Tenant",
            value: tenantId,
            icon: Database,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            desc: "Current Environment"
        },
        {
            title: "Total Logins",
            value: metrics?.loginCount || 0,
            icon: Users,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
            desc: "Session History"
        },
        {
            title: "Deployments",
            value: metrics?.deploymentCount || 0,
            icon: ArrowUpRight,
            color: "text-infor-red",
            bg: "bg-red-500/10",
            desc: "Successful Uploads"
        }
    ];

    // User Activity State
    const [activeUsers, setActiveUsers] = React.useState([]);

    React.useEffect(() => {
        const fetchActivity = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://velops-backend.onrender.com';
                const response = await fetch(`${apiUrl}/api/users/activity`);
                const data = await response.json();
                if (data.users) {
                    setActiveUsers(data.users);
                }
            } catch (error) {
                console.error("Failed to fetch user activity", error);
            }
        };

        fetchActivity();
        const interval = setInterval(fetchActivity, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    // Helper for "time ago"
    const timeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 font-sans"
        >
            {/* Welcome Section */}
            <motion.div variants={item} className="glass-panel rounded-3xl p-10 relative overflow-hidden group border-none shadow-2xl">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-700">
                    <Activity size={300} className="text-white" />
                </div>
                <div className="relative z-10 flex flex-col gap-4">
                    <div>
                        <span className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-bold uppercase tracking-widest border border-white/10 backdrop-blur-md">
                            Dashboard
                        </span>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-lg">
                        Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">{userName}</span>
                    </h1>
                    <p className="text-slate-300 text-lg font-medium max-w-2xl leading-relaxed">
                        You are connected to <span className="text-white font-bold">{tenantId}</span>. Manage your security roles, deployments, and ION workflows with precision.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-slate-400 text-sm font-medium">User ID:</span>
                        <code className="bg-white/10 px-2 py-1 rounded text-xs text-white font-mono">{userId}</code>
                        <button
                            onClick={handleCopy}
                            className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-colors border border-white/5"
                            title="Copy User ID"
                        >
                            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                    </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#1e1b4b99] to-infor-red/20 -z-10 bg-size-200 animate-gradient-xy"></div>
            </motion.div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        variants={item}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="glass-panel rounded-2xl p-6 flex flex-col justify-between h-48 transition-all duration-300 hover:shadow-2xl hover:shadow-black/40 cursor-pointer border border-white/5 bg-slate-900/40"
                    >
                        <div className="flex justify-between items-start">
                            <div className={`p-4 rounded-xl ${stat.bg} backdrop-blur-sm border border-white/5`}>
                                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                            </div>
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider bg-white/5 px-2 py-1 rounded-md backdrop-blur-sm border border-white/5">
                                Live
                            </span>
                        </div>
                        <div>
                            <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-1">{stat.title}</h3>
                            <p className="text-2xl font-black text-white tracking-tighter truncate" title={stat.value}>{stat.value}</p>
                            <p className="text-xs text-slate-500 mt-2 font-medium">{stat.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Bottom Section: Quick Actions / System / User Activity */}
            <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* User Activity Widget (New) */}
                <div className="glass-panel rounded-3xl p-8 min-h-[280px] shadow-xl bg-slate-900/40 border border-white/5 order-last lg:order-first">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 border border-indigo-500/20">
                            <Users className="w-5 h-5" />
                        </span>
                        Active Users
                    </h2>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        {activeUsers.length === 0 ? (
                            <p className="text-slate-500 text-sm italic">No recent activity.</p>
                        ) : (
                            activeUsers.map((u, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                                        {u.displayName[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-semibold truncate">{u.displayName}</p>
                                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                                    </div>
                                    <span className="text-xs text-slate-500 whitespace-nowrap">{timeAgo(u.lastLogin)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="glass-panel rounded-3xl p-8 min-h-[280px] shadow-xl bg-slate-900/40 border border-white/5">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="p-2 bg-infor-red/20 rounded-lg text-infor-red border border-infor-red/20">
                            <Zap className="w-5 h-5" />
                        </span>
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        <div
                            onClick={() => navigate('/dashboard/roles')}
                            className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group flex items-center gap-4"
                        >
                            <div className="p-2 bg-blue-500/20 w-fit rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-white font-bold">Check Roles</p>
                                <p className="text-xs text-slate-400">Validate permissions</p>
                            </div>
                        </div>
                        {isPMO ? (
                            <div
                                onClick={() => navigate('/dashboard/jira')}
                                className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group flex items-center gap-4"
                            >
                                <div className="p-2 bg-orange-500/20 w-fit rounded-lg text-orange-400 group-hover:scale-110 transition-transform">
                                    <TicketPercent className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-white font-bold">Jira Ticket</p>
                                    <p className="text-xs text-slate-400">Create or view tickets</p>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => navigate('/dashboard/ion')}
                                className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group flex items-center gap-4"
                            >
                                <div className="p-2 bg-purple-500/20 w-fit rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-white font-bold">ION History</p>
                                    <p className="text-xs text-slate-400">View recent workflows</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* CSP Tools Status */}
                <div className="glass-panel rounded-3xl p-6 min-h-[280px] shadow-xl bg-slate-900/40 border border-white/5 flex flex-col">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 border border-emerald-500/20">
                            <ShieldCheck className="w-5 h-5" />
                        </span>
                        CSP Tools
                    </h2>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[400px]">
                        <CSPTools className="grid grid-cols-1 gap-2" compact={true} />
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
