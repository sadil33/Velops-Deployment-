import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Cpu, Hash, ClipboardCheck, Search, Play, FileText, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';

// Helper for copying to clipboard
const copyToClipboard = (text, setCopiedState) => {
    navigator.clipboard.writeText(text).then(() => {
        setCopiedState(true);
        setTimeout(() => setCopiedState(false), 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
};

// Extracted Components
const ProcessIDTab = () => {
    const { user } = useAuth();
    const [processes, setProcesses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProcess, setSelectedProcess] = useState(null);
    const [copied, setCopied] = useState(false);

    const fetchProcesses = async () => {
        if (!user) {
            setError("User validation failed. Please log in.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/proxy`,
                {
                    tenantUrl: user.tenantUrl,
                    token: user.token,
                    endpoint: 'RPA/api/v1/rpa/process?environment=default',
                    method: 'GET'
                }
            );

            if (response.data && response.data.processes) {
                setProcesses(response.data.processes);
            } else {
                setProcesses([]);
            }
        } catch (err) {
            console.error("Failed to fetch processes:", err);
            setError(err.message || 'Failed to fetch processes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchProcesses();
        }
    }, [user]);

    const filteredProcesses = processes.filter(p =>
        (p.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (p.id?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="glass-panel p-8 rounded-2xl border border-white/10 bg-white/5">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-red-400" />
                    Search by Process Name or ID
                </h3>
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Enter Process Name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all placeholder:text-slate-500"
                    />
                    <button
                        onClick={() => user && fetchProcesses()}
                        disabled={!user || loading}
                        className={`px-6 py-3 font-bold rounded-xl transition-all border border-white/10 flex items-center gap-2 ${!user || loading
                            ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                            : 'bg-white/5 hover:bg-white/10 text-white'
                            }`}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredProcesses.length > 0 ? (
                        filteredProcesses.map((proc, idx) => (
                            <div
                                key={proc.id || idx}
                                onClick={() => setSelectedProcess(proc)}
                                className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-mono text-slate-500 truncate max-w-[150px]" title={proc.id}>{proc.id || 'No ID'}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${proc.current_version ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                        v{proc.current_version || '0.0.0'}
                                    </span>
                                </div>
                                <h4 className="font-bold text-slate-200 mb-1 group-hover:text-red-400 transition-colors line-clamp-2" title={proc.name}>
                                    {proc.name || 'Unnamed Process'}
                                </h4>
                                <p className="text-xs text-slate-400">Type: {proc.type || 'Web'}</p>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            {user ? 'No processes found matching your criteria.' : 'Please log in to view processes.'}
                        </div>
                    )}
                </div>
            )}

            {/* Process Details Modal */}
            <AnimatePresence>
                {selectedProcess && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedProcess(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[70vh] overflow-hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-start shrink-0">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{selectedProcess.name || 'Unknown Process'}</h3>
                                    <p className="text-sm text-slate-400 font-mono">{selectedProcess.id || 'No ID'}</p>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(selectedProcess.id, setCopied)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white relative"
                                    title="Copy Process ID"
                                >
                                    {copied ? <ClipboardCheck className="w-5 h-5 text-green-400" /> : <FileText className="w-5 h-5" />}
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 grow">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-xs text-slate-500 uppercase mb-1">Current Version</p>
                                        <p className="text-lg font-bold text-green-400">{selectedProcess.current_version || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-xs text-slate-500 uppercase mb-1">Type</p>
                                        <p className="text-lg font-bold text-white">{selectedProcess.type || 'Unknown'}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-xs text-slate-500 uppercase mb-1">Exception Handler</p>
                                        <p className={`text-lg font-bold ${selectedProcess.exception_handler ? 'text-blue-400' : 'text-slate-400'}`}>
                                            {selectedProcess.exception_handler ? 'Enabled' : 'Disabled'}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-xs text-slate-500 uppercase mb-1">Total Versions</p>
                                        <p className="text-lg font-bold text-white">{selectedProcess.versions?.length || 0}</p>
                                    </div>
                                </div>

                                {Array.isArray(selectedProcess.versions) && selectedProcess.versions.length > 0 && (
                                    <div>
                                        <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                                            <Hash className="w-4 h-4 text-red-400" />
                                            Version History
                                        </h4>
                                        <div className="rounded-xl border border-white/10 overflow-hidden">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-white/5 text-slate-400 text-xs uppercase">
                                                    <tr>
                                                        <th className="p-3">Version</th>
                                                        <th className="p-3">Status</th>
                                                        <th className="p-3">Created At</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {selectedProcess.versions.map((ver, idx) => (
                                                        <tr key={ver.version_id || idx} className="hover:bg-white/5 transition-colors">
                                                            <td className="p-3 text-white font-mono">{ver.version || 'N/A'}</td>
                                                            <td className="p-3">
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ver.status === 'finalized' ? 'bg-green-500/20 text-green-400' :
                                                                    ver.status === 'draft' ? 'bg-amber-500/20 text-amber-400' :
                                                                        'bg-slate-500/20 text-slate-400'
                                                                    }`}>
                                                                    {ver.status || 'Unknown'}
                                                                </span>
                                                            </td>
                                                            <td className="p-3 text-slate-400 max-w-[150px] truncate">
                                                                {ver.createdAt ? new Date(ver.createdAt).toLocaleString() : '-'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end shrink-0">
                                <button
                                    onClick={() => setSelectedProcess(null)}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ... (imports remain matching existing file)

// ... (ProcessIDTab remains unchanged, no updates needed there for now)

const JobIDTab = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'completed', 'failed', 'running'
    const [selectedJob, setSelectedJob] = useState(null);
    const [copied, setCopied] = useState(false);

    const fetchJobs = async () => {
        if (!user) return;

        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/proxy`,
                {
                    tenantUrl: user.tenantUrl,
                    token: user.token,
                    endpoint: 'RPA/api/v1/rpa/jobs?environment=default',
                    method: 'GET'
                }
            );

            if (Array.isArray(response.data)) {
                setJobs(response.data);
            } else if (response.data && response.data.jobs) {
                setJobs(response.data.jobs);
            } else {
                setJobs([]);
            }
        } catch (err) {
            console.error("Failed to fetch jobs:", err);
            setError(err.message || 'Failed to fetch jobs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && jobs.length === 0) { // Only fetch if no jobs loaded to preserve data on tab switch
            fetchJobs();
        }
    }, [user]);

    const filteredJobs = jobs.filter(j => {
        const matchesSearch = (j.job_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (j.id?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (j.process_name?.toLowerCase() || '').includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || (j.status?.toLowerCase() === statusFilter);

        return matchesSearch && matchesStatus;
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="glass-panel p-8 rounded-2xl border border-white/10 bg-white/5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Hash className="w-5 h-5 text-red-400" />
                        Search Jobs
                    </h3>

                    {/* Status Filters */}
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        {['all', 'completed', 'failed', 'not-started', 'disabled'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${statusFilter === status
                                    ? status === 'completed' ? 'bg-green-500 text-white shadow-lg shadow-green-900/40'
                                        : status === 'failed' ? 'bg-red-500 text-white shadow-lg shadow-red-900/40'
                                            : status === 'not-started' ? 'bg-slate-500 text-white shadow-lg shadow-slate-900/40'
                                                : status === 'disabled' ? 'bg-slate-700 text-slate-300 shadow-lg shadow-slate-900/40'
                                                    : 'bg-slate-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {status === 'all' ? 'All Jobs' : status.replace('-', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Enter Job Name, ID, or Process..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all placeholder:text-slate-500"
                    />
                    <button
                        onClick={() => user && fetchJobs()}
                        disabled={!user || loading}
                        className={`px-6 py-3 font-bold rounded-xl transition-all border border-white/10 flex items-center gap-2 ${!user || loading
                            ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/40'
                            }`}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {loading && jobs.length === 0 ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                </div>
            ) : (
                <div className="rounded-2xl border border-white/10 overflow-hidden max-h-[600px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-slate-400 text-xs uppercase sticky top-0 backdrop-blur-md z-10">
                            <tr>
                                <th className="p-4 font-semibold">Job ID</th>
                                <th className="p-4 font-semibold">Job Name</th>
                                <th className="p-4 font-semibold">Process</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold">Type</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredJobs.length > 0 ? (
                                filteredJobs.map((job, idx) => (
                                    <tr
                                        key={job.id || idx}
                                        onClick={() => setSelectedJob(job)}
                                        className="hover:bg-white/5 transition-colors cursor-pointer"
                                    >
                                        <td className="p-4 text-slate-300 font-mono text-xs truncate max-w-[150px]" title={job.id}>
                                            {job.id || 'N/A'}
                                        </td>
                                        <td className="p-4 text-white text-sm truncate max-w-[200px]" title={job.job_name}>
                                            {job.job_name || '-'}
                                        </td>
                                        <td className="p-4 text-white text-sm line-clamp-1 max-w-[200px]" title={job.process_name}>
                                            {job.process_name || 'Unknown Process'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${job.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                job.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                                                    job.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-slate-500/20 text-slate-400'
                                                }`}>
                                                {job.status || 'UNKNOWN'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-400 text-xs uppercase">
                                            {job.type || '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500">
                                        {user ? 'No jobs found matching your criteria.' : 'Please log in to view jobs.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Job Details Modal - Same as before */}
            <AnimatePresence>
                {selectedJob && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedJob(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[70vh] flex flex-col"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-start shrink-0 gap-4">
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-xl font-bold text-white mb-1">Job Details</h3>
                                    <p className="text-sm text-slate-400 font-mono truncate" title={selectedJob.id}>{selectedJob.id}</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={() => copyToClipboard(selectedJob.id, setCopied)}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                        title="Copy ID"
                                    >
                                        {copied ? <ClipboardCheck className="w-5 h-5 text-green-400" /> : <FileText className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 grow">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-xs text-slate-500 uppercase mb-1">Process Name</p>
                                        <p className="text-sm font-bold text-white line-clamp-2" title={selectedJob.process_name}>{selectedJob.process_name || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-xs text-slate-500 uppercase mb-1">Process Version</p>
                                        <p className="text-lg font-bold text-white">{selectedJob.process_version || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-xs text-slate-500 uppercase mb-1">Status</p>
                                        <p className={`text-lg font-bold uppercase ${selectedJob.status === 'completed' ? 'text-green-400' :
                                            selectedJob.status === 'failed' ? 'text-red-400' :
                                                'text-slate-400'
                                            }`}>
                                            {selectedJob.status}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-xs text-slate-500 uppercase mb-1">Created By</p>
                                        <p className="text-sm font-bold text-white truncate" title={selectedJob.created_by}>{selectedJob.created_by || 'System'}</p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-slate-400 overflow-x-auto">
                                    <pre>{JSON.stringify(selectedJob, null, 2)}</pre>
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end shrink-0">
                                <button
                                    onClick={() => setSelectedJob(null)}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const ReviewCenterTab = () => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
    >
        {/* ... (Review Center content remains unchanged) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-500/20 border border-red-500/20">
                <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Pending Review</h3>
                <p className="text-4xl font-black text-white">12</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Processed Today</h3>
                <p className="text-4xl font-black text-slate-200">145</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Exceptions</h3>
                <p className="text-4xl font-black text-slate-200">3</p>
            </div>
        </div>
        {/* ... rest of ReviewCenter ... */}
    </motion.div>
);

const RPA = () => {
    const [activeTab, setActiveTab] = useState('process-id');

    const tabs = [
        { id: 'process-id', label: 'Process ID', icon: Cpu },
        { id: 'job-id', label: 'Job ID', icon: Hash },
        { id: 'review-center', label: 'Review Center', icon: ClipboardCheck },
    ];

    return (
        <div className="space-y-8 font-sans">
            <div className="flex items-center gap-4 pl-2">
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-700 text-white rounded-xl shadow-lg shadow-red-500/30">
                    <Bot className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-md">Robotic Process Automation</h2>
                    <p className="text-slate-400 font-medium">Process execution and monitoring dashboard</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl bg-slate-900/60 border border-white/10">
                <div className="border-b border-white/10 bg-white/5 backdrop-blur-md p-2">
                    <div className="flex gap-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold text-sm
                                        ${activeTab === tab.id
                                            ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                                            : 'text-slate-400 hover:text-white hover:bg-white/10'
                                        }
                                    `}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-8 min-h-[500px]">
                    {/* Persist tabs using display toggling instead of unmounting */}
                    <div className={activeTab === 'process-id' ? 'block' : 'hidden'}>
                        <ProcessIDTab />
                    </div>
                    <div className={activeTab === 'job-id' ? 'block' : 'hidden'}>
                        <JobIDTab />
                    </div>
                    <div className={activeTab === 'review-center' ? 'block' : 'hidden'}>
                        <ReviewCenterTab />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RPA;
