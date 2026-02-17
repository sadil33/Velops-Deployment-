import { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Shield, Upload, Cloud, LogOut, User, BrainCircuit, Ticket, Bot, FileSearch, MessageSquare } from 'lucide-react';
import Dashboard from '../pages/Dashboard';
import SecurityRoles from './SecurityRoles';
import ChatWithDocument from '../pages/ChatWithDocument';
import IDMDeployment from '../pages/IDMDeployment';
import ION from '../pages/ION';
import ArtificialIntelligence from '../pages/ArtificialIntelligence';
import RPA from '../pages/RPA';
import IDP from '../pages/IDP';
import JiraTickets from '../pages/JiraTickets';

const SidebarLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Determine current view from URL
    // URL structure: /dashboard/roles, /dashboard/idm-deployment, /dashboard/ion, or /dashboard (index)
    const currentPath = location.pathname;
    const isRoles = currentPath.includes('/roles');
    const isIDM = currentPath.includes('/idm-deployment');
    const isION = currentPath.includes('/ion');
    const isAI = currentPath.includes('/ai');
    const isRPA = currentPath.includes('/rpa');
    const isIDP = currentPath.includes('/idp');
    const isJira = currentPath.includes('/jira');
    const isChat = currentPath.includes('/chat');
    const isDashboard = !isRoles && !isIDM && !isION && !isAI && !isJira && !isRPA && !isIDP && !isChat;

    // Redirect unauthorized users accessing restricted routes
    useEffect(() => {
        const isRestrictedRoute = isIDM || isION || isAI || isRPA || isIDP;
        if (isRestrictedRoute && user?.loginType !== 'Velops') {
            navigate('/dashboard', { replace: true });
        }
    }, [isIDM, isION, isAI, isRPA, isIDP, user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen animated-bg flex transition-all duration-500 ease-in-out font-sans">
            {/* Sidebar */}
            <aside className="w-64 glass-sidebar fixed h-full z-20 hidden md:flex flex-col shadow-2xl backdrop-blur-xl border-r border-slate-700/50">
                <div className="p-8 border-b border-slate-700/50">
                    <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-sm flex items-center gap-1">
                        <span className="text-infor-red">Infor</span>
                        <span className="text-white">Portal</span>
                    </h1>
                </div>

                <nav className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar">
                    {/* Dashboard - Visible to All */}
                    <NavLink
                        to="/dashboard"
                        end
                        className={({ isActive }) => `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-medium group ${isActive
                            ? 'bg-gradient-to-r from-infor-red to-[#b00029] text-white shadow-lg shadow-red-900/30 translate-x-1'
                            : 'text-slate-400 hover:bg-white/10 hover:text-white hover:translate-x-1 hover:shadow-md'
                            }`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </NavLink>

                    {/* Security Roles - Visible to All */}
                    <NavLink
                        to="/dashboard/roles"
                        className={({ isActive }) => `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-medium group ${isActive
                            ? 'bg-gradient-to-r from-infor-red to-[#b00029] text-white shadow-lg shadow-red-900/30 translate-x-1'
                            : 'text-slate-400 hover:bg-white/10 hover:text-white hover:translate-x-1 hover:shadow-md'
                            }`}
                    >
                        <Shield className="w-5 h-5" />
                        Security Roles
                    </NavLink>

                    {/* Chat with Document - Visible to All */}
                    <NavLink
                        to="/dashboard/chat"
                        className={({ isActive }) => `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-medium group ${isActive
                            ? 'bg-gradient-to-r from-infor-red to-[#b00029] text-white shadow-lg shadow-red-900/30 translate-x-1'
                            : 'text-slate-400 hover:bg-white/10 hover:text-white hover:translate-x-1 hover:shadow-md'
                            }`}
                    >
                        <MessageSquare className="w-5 h-5" />
                        Chat Assistant
                    </NavLink>

                    {/* Jira Tickets - Visible to All */}
                    <NavLink
                        to="/dashboard/jira"
                        className={({ isActive }) => `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-medium group ${isActive
                            ? 'bg-gradient-to-r from-infor-red to-[#b00029] text-white shadow-lg shadow-red-900/30 translate-x-1'
                            : 'text-slate-400 hover:bg-white/10 hover:text-white hover:translate-x-1 hover:shadow-md'
                            }`}
                    >
                        <Ticket className="w-5 h-5" />
                        Jira Tickets
                    </NavLink>

                    {/* Restricted Routes - Only for Velops Login */}
                    {user?.loginType === 'Velops' && (
                        <>
                            <NavLink
                                to="/dashboard/idm-deployment"
                                className={({ isActive }) => `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-medium group ${isActive
                                    ? 'bg-gradient-to-r from-infor-red to-[#b00029] text-white shadow-lg shadow-red-900/30 translate-x-1'
                                    : 'text-slate-400 hover:bg-white/10 hover:text-white hover:translate-x-1 hover:shadow-md'
                                    }`}
                            >
                                <Upload className="w-5 h-5" />
                                IDM Deployment
                            </NavLink>

                            <NavLink
                                to="/dashboard/ion"
                                className={({ isActive }) => `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-medium group ${isActive
                                    ? 'bg-gradient-to-r from-infor-red to-[#b00029] text-white shadow-lg shadow-red-900/30 translate-x-1'
                                    : 'text-slate-400 hover:bg-white/10 hover:text-white hover:translate-x-1 hover:shadow-md'
                                    }`}
                            >
                                <Cloud className="w-5 h-5" />
                                ION
                            </NavLink>

                            <NavLink
                                to="/dashboard/ai"
                                className={({ isActive }) => `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-medium group ${isActive
                                    ? 'bg-gradient-to-r from-infor-red to-[#b00029] text-white shadow-lg shadow-red-900/30 translate-x-1'
                                    : 'text-slate-400 hover:bg-white/10 hover:text-white hover:translate-x-1 hover:shadow-md'
                                    }`}
                            >
                                <BrainCircuit className="w-5 h-5" />
                                Artificial Intelligence
                            </NavLink>

                            <NavLink
                                to="/dashboard/rpa"
                                className={({ isActive }) => `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-medium group ${isActive
                                    ? 'bg-gradient-to-r from-infor-red to-[#b00029] text-white shadow-lg shadow-red-900/30 translate-x-1'
                                    : 'text-slate-400 hover:bg-white/10 hover:text-white hover:translate-x-1 hover:shadow-md'
                                    }`}
                            >
                                <Bot className="w-5 h-5" />
                                RPA
                            </NavLink>

                            <NavLink
                                to="/dashboard/idp"
                                className={({ isActive }) => `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-medium group ${isActive
                                    ? 'bg-gradient-to-r from-infor-red to-[#b00029] text-white shadow-lg shadow-red-900/30 translate-x-1'
                                    : 'text-slate-400 hover:bg-white/10 hover:text-white hover:translate-x-1 hover:shadow-md'
                                    }`}
                            >
                                <FileSearch className="w-5 h-5" />
                                IDP
                            </NavLink>
                        </>
                    )}
                </nav>

                <div className="p-6 border-t border-slate-700/50 bg-slate-900/30 backdrop-blur-md">
                    <div className="flex items-center gap-4 px-2 py-2 mb-4">
                        <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-slate-600">
                            {user?.userData?.response?.userlist?.[0]?.givenName?.[0] || <User className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">{user?.userData?.response?.userlist?.[0]?.displayName || 'User'}</p>
                            <p className="text-xs text-slate-400 truncate">
                                {user?.userData?.response?.userlist?.[0]?.emails?.[0]?.value ||
                                    user?.userData?.response?.userlist?.[0]?.userName ||
                                    'No Email'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-slate-800/80 hover:bg-infor-red rounded-xl transition-all shadow-lg hover:shadow-red-900/40 backdrop-blur-sm border border-slate-700 hover:border-transparent"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8 overflow-y-auto h-screen custom-scrollbar bg-slate-900/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Render Dashboard Index */}
                    {isDashboard && <Dashboard />}

                    {/* Render Security Roles - Mounts/Unmounts normally to fetch fresh data */}
                    {isRoles && <SecurityRoles />}

                    {/* Keep-Alive Components: Always mounted (if permitted), visibility toggled */}
                    {user?.loginType === 'Velops' && (
                        <>
                            <div style={{ display: isIDM ? 'block' : 'none' }}>
                                <IDMDeployment />
                            </div>

                            <div style={{ display: isION ? 'block' : 'none' }}>
                                <ION />
                            </div>

                            <div style={{ display: isAI ? 'block' : 'none' }}>
                                <ArtificialIntelligence />
                            </div>

                            <div style={{ display: isRPA ? 'block' : 'none' }}>
                                <RPA />
                            </div>

                            <div style={{ display: isIDP ? 'block' : 'none' }}>
                                <IDP />
                            </div>
                        </>
                    )}

                    <div style={{ display: isJira ? 'block' : 'none' }}>
                        <JiraTickets />
                    </div>

                    <div style={{ display: isChat ? 'block' : 'none' }}>
                        <ChatWithDocument />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SidebarLayout;
