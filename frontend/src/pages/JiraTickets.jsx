import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Ticket, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const JiraTickets = () => {
    const { user } = useAuth();
    const [jiraForm, setJiraForm] = useState({
        summary: '',
        description: '',
        priority: 'Major',
        issuetype: 'Task',
        projectKey: 'MTMS'
    });
    const [creatingJira, setCreatingJira] = useState(false);
    const [jiraResult, setJiraResult] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState('');

    const tenantName = user?.tenantUrl
        ? new URL(user.tenantUrl).pathname.split('/').filter(Boolean).pop()
        : 'Unknown-Tenant';

    const TEMPLATES = {
        'MTMS': {
            'GenAI-Passthrough': {
                summary: `Request to provision Gen AI and GENAI passthrough in ${tenantName} (from dashboard) tenant`,
                description: `Requesting the enablement of feature flags from multiple applications and provisioning of the GenAI in the listed tenant below:

${tenantName}:

https://mingle-portal.inforcloudsuite.com/${tenantName}/ 

GenAI: (Embedded Experience) - application provisioning with the following feature flags enabled:

PROMPTPLAYGROUND

PASSTHROUGH

See the provisioning recipe for details: 
Embedded Experience Provisioning Recipe - GenAI
https://infor.atlassian.net/wiki/spaces/CS/pages/1009329168/Embedded+Experience+Provisioning+Recipe+-+GenAI`
            },
            'IDP-Import&export': {
                summary: `Feature Enablement for IDP Import Export toggle in ${tenantName} tenant`,
                description: `Requesting the feature enablement of Infor Document Processor, IDP - Import & Export option in the listed tenants below:

${tenantName}

https://mingle-portal.inforcloudsuite.com/${tenantName}/ 

Please enable the toggle to Import Export documents in IDP.

IDDP_EXPORT_IMPORT =1`
            },
            'Review Center': {
                summary: `Enable new Review Center for ${tenantName} Tenant.`,
                description: `Please enable new review center in ${tenantName} Tenant.
https://mingle-portal.inforcloudsuite.com/${tenantName}/
Please set RPA_EXCEPTION_UI=2. 
Product : Mingle`
            }
        },
        'COLDEVSUP': {
            'Custom algorithm': {
                summary: `DEVMRKT_DEV: Custom algorithm is failing after deploying`,
                description: `These custom algorithms are failing in ${tenantName} tenant
Custom Algorithm Name : [INSERT_NAME]`
            },
            'Dataset': {
                summary: `DEVMRKT_DEV: Dataset is failing after deploying`,
                description: `These datasets are failing in ${tenantName} tenant
Dataset Name : [INSERT_NAME]`
            },
            'Quest': {
                summary: `DEVMRKT_DEV: Quest is failing after deploying`,
                description: `These quests are failing in ${tenantName} tenant
Quest Name : [INSERT_NAME]`
            }
        }
    };

    // Get current available templates based on project
    const availableTemplates = TEMPLATES[jiraForm.projectKey] || {};

    useEffect(() => {
        // Reset template when project changes
        setSelectedTemplate('');
    }, [jiraForm.projectKey]);

    useEffect(() => {
        if (selectedTemplate && availableTemplates[selectedTemplate]) {
            setJiraForm(prev => ({
                ...prev,
                summary: availableTemplates[selectedTemplate].summary,
                description: availableTemplates[selectedTemplate].description
            }));
        }
    }, [selectedTemplate, jiraForm.projectKey]); // Depend on projectKey to ensure correct template lookup fallback

    const handleJiraSubmit = async (e) => {
        e.preventDefault();
        setCreatingJira(true);
        setJiraResult(null);

        try {
            const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
            const response = await axios.post(`${apiUrl}/api/jira/tickets`, jiraForm);
            setJiraResult(response.data);
            setJiraForm({ summary: '', description: '', priority: 'Major', issuetype: 'Task', projectKey: 'MTMS' });
        } catch (error) {
            console.error("Jira Creation Failed:", error);
            setJiraResult({ success: false, error: error.response?.data?.error || "Failed to create ticket" });
        } finally {
            setCreatingJira(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 font-sans"
        >
            {/* Header */}
            <div className="glass-panel p-8 rounded-3xl border-none shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-700">
                    <Ticket size={300} className="text-white" />
                </div>
                <div className="relative z-10">
                    <span className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-bold uppercase tracking-widest border border-white/10 backdrop-blur-md">
                        Support
                    </span>
                    <h1 className="text-4xl font-black text-white mt-4 tracking-tight drop-shadow-lg">
                        Jira <span className="text-transparent bg-clip-text bg-gradient-to-r from-infor-red to-orange-500">Tickets</span>
                    </h1>
                    <p className="text-slate-300 text-lg font-medium max-w-2xl mt-2 leading-relaxed">
                        Create and track issues directly in our Jira project.
                    </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#1e1b4b99] to-infor-red/20 -z-10 bg-size-200 animate-gradient-xy"></div>
            </div>

            {/* Form Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-panel rounded-3xl p-8 bg-slate-900/40 border border-white/5">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Ticket className="w-5 h-5 text-infor-red" />
                        New Ticket
                    </h2>

                    {jiraResult && (
                        <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${jiraResult.success ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                            {jiraResult.success ? <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />}
                            <div>
                                <p className={`font-bold ${jiraResult.success ? 'text-green-400' : 'text-red-400'}`}>
                                    {jiraResult.success ? 'Ticket Created Successfully!' : 'Creation Failed'}
                                </p>
                                {jiraResult.success ? (
                                    <a href={jiraResult.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline mt-1 block">
                                        View Ticket: {jiraResult.issueKey}
                                    </a>
                                ) : (
                                    <p className="text-sm text-slate-400 mt-1">{jiraResult.error}</p>
                                )}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleJiraSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Project Key</label>
                                <div className="relative">
                                    <select
                                        value={jiraForm.projectKey}
                                        onChange={e => setJiraForm({ ...jiraForm, projectKey: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-infor-red/50 appearance-none transition-all hover:bg-black/50 cursor-pointer"
                                    >
                                        <option value="MTMS">MTMS</option>
                                        <option value="COLDEVSUP">COLDEVSUP</option>
                                        <option value="SAASCLOUD">SAASCLOUD</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                                </div>
                            </div>

                            {/* Template Dropdown - Conditional based on available templates */}
                            {Object.keys(availableTemplates).length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Template</label>
                                    <div className="relative">
                                        <select
                                            value={selectedTemplate}
                                            onChange={e => setSelectedTemplate(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-infor-red/50 appearance-none transition-all hover:bg-black/50 cursor-pointer"
                                        >
                                            <option value="">Select Template...</option>
                                            {Object.keys(availableTemplates).map(tmpl => (
                                                <option key={tmpl} value={tmpl}>{tmpl}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Summary *</label>
                            <input
                                required
                                type="text"
                                value={jiraForm.summary}
                                onChange={e => setJiraForm({ ...jiraForm, summary: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-infor-red/50 transition-all hover:bg-black/50"
                                placeholder="Brief summary of the issue"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
                            <textarea
                                required
                                rows={6}
                                value={jiraForm.description}
                                onChange={e => setJiraForm({ ...jiraForm, description: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-infor-red/50 resize-none transition-all hover:bg-black/50"
                                placeholder="Detailed description..."
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                                <div className="relative">
                                    <select
                                        value={jiraForm.priority}
                                        onChange={e => setJiraForm({ ...jiraForm, priority: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-infor-red/50 appearance-none transition-all hover:bg-black/50 cursor-pointer"
                                    >
                                        {['Blocker', 'Critical', 'Major', 'Minor', 'Trivial'].map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Issue Type</label>
                                <div className="relative">
                                    <select
                                        value={jiraForm.issuetype}
                                        onChange={e => setJiraForm({ ...jiraForm, issuetype: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-infor-red/50 appearance-none transition-all hover:bg-black/50 cursor-pointer"
                                    >
                                        {['Task', 'Bug', 'Story', 'Epic'].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                                </div>
                            </div>
                        </div>
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={creatingJira}
                                className="w-full md:w-auto px-8 py-3 bg-infor-red hover:bg-[#b00029] text-white font-bold rounded-xl transition-all shadow-lg shadow-infor-red/20 flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-105 active:scale-95"
                            >
                                {creatingJira ? <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <Send className="w-5 h-5" />}
                                {creatingJira ? 'Creating...' : 'Create Ticket'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="space-y-6">
                    <div className="glass-panel rounded-3xl p-6 bg-slate-900/40 border border-white/5">
                        <h3 className="text-white font-bold mb-4">Guidelines</h3>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li className="flex gap-2">
                                <span className="text-infor-red">•</span>
                                Provide clear and concise summaries.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-infor-red">•</span>
                                Include steps to reproduce for bugs.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-infor-red">•</span>
                                Attach logs or screenshots if available (via external links for now).
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default JiraTickets;
