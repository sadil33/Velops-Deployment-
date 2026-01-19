import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Workflow, Database, FileCode, Code, Upload, Loader2, CheckCircle2, XCircle, File, FileJson } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ION = () => {
    const [activeTab, setActiveTab] = useState('workflows');

    const tabs = [
        { id: 'workflows', label: 'Workflows', icon: Workflow },
        { id: 'dataflows', label: 'Dataflows', icon: Database },
        { id: 'connection-point', label: 'Connection Point', icon: Database },
        { id: 'business-rules', label: 'Business Rules', icon: FileCode },
        { id: 'scripting', label: 'Scripting', icon: Code },
        { id: 'object-schemas', label: 'Object Schemas', icon: FileJson }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 pl-2">
                <div className="p-3 bg-gradient-to-br from-infor-red to-[#b00029] text-white rounded-xl shadow-lg shadow-red-900/40">
                    <Cloud className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-md">ION</h2>
                    <p className="text-slate-400 font-medium">Manage workflows, dataflows, and integrations</p>
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
                                            ? 'bg-infor-red text-white shadow-lg shadow-red-900/30'
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

                {/* Tab Content */}
                <div className="p-6">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'workflows' && <WorkflowsTab />}
                        {activeTab === 'dataflows' && <DataflowsTab />}
                        {activeTab === 'connection-point' && <ConnectionPointTab />}
                        {activeTab === 'business-rules' && <BusinessRulesTab />}
                        {activeTab === 'scripting' && <ScriptingTab />}
                        {activeTab === 'object-schemas' && <ObjectSchemasTab />}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

const WorkflowsTab = () => {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState([]);

    // Activation state
    const [workflowNames, setWorkflowNames] = useState('');
    const [activating, setActivating] = useState(false);
    const [activationResult, setActivationResult] = useState(null);

    // Activation handler
    const handleActivate = async () => {
        if (!workflowNames.trim()) return;

        setActivating(true);
        setActivationResult(null);

        try {
            const workflowArray = workflowNames.split(',').map(name => name.trim());

            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ion-workflows-activate`,
                { workflows: workflowArray },
                {
                    params: {
                        tenantUrl: user.tenantUrl,
                        token: user.token
                    }
                }
            );

            setActivationResult({
                status: 'success',
                message: `Successfully activated ${workflowArray.length} workflow(s)`,
                workflows: workflowArray
            });
            setWorkflowNames('');
        } catch (error) {
            setActivationResult({
                status: 'error',
                message: error.response?.data?.error || error.message
            });
        } finally {
            setActivating(false);
        }
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        if (!acceptedFiles || acceptedFiles.length === 0) return;

        setUploading(true);
        setUploadResults([]);

        try {
            const results = await Promise.all(
                acceptedFiles.map(async (file) => {
                    try {
                        const formData = new FormData();
                        formData.append('file', file);

                        await axios.post(
                            'const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
                            // ... usage example: `${apiUrl}/api/...`/api/ion-workflow',
                            formData,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                                params: {
                                    tenantUrl: user.tenantUrl,
                                    token: user.token
                                }
                            }
                        );

                        return {
                            filename: file.name,
                            status: 'success',
                            message: 'Workflow deployed successfully'
                        };
                    } catch (error) {
                        return {
                            filename: file.name,
                            status: 'error',
                            message: error.response?.data?.error || error.message
                        };
                    }
                })
            );

            setUploadResults(results);
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    }, [user]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true
    });

    return (
        <div className="space-y-8">
            {/* Workflow Activation Section */}
            <div className="glass-panel rounded-2xl p-8 border border-white/10 bg-white/5">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Workflow className="w-5 h-5 text-infor-red" />
                    Activate Workflows
                </h3>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={workflowNames}
                        onChange={(e) => setWorkflowNames(e.target.value)}
                        placeholder="Enter workflow names (comma-separated, e.g., Workflow1,Workflow2)"
                        className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:border-infor-red focus:ring-1 focus:ring-infor-red outline-none transition-all placeholder:text-slate-500"
                        disabled={activating}
                    />
                    <button
                        onClick={handleActivate}
                        disabled={activating || !workflowNames.trim()}
                        className={`
                            px-6 py-3 rounded-xl font-bold transition-all
                            ${activating || !workflowNames.trim()
                                ? 'bg-white/10 text-slate-500 cursor-not-allowed'
                                : 'bg-infor-red text-white hover:bg-[#b00029] shadow-lg hover:shadow-red-900/40'
                            }
                        `}
                    >
                        {activating ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Activating...
                            </span>
                        ) : (
                            'Activate'
                        )}
                    </button>
                </div>

                {/* Activation Result */}
                <AnimatePresence>
                    {activationResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`
                                mt-4 p-4 rounded-xl border
                                ${activationResult.status === 'success'
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-red-50 border-red-200'
                                }
                            `}
                        >
                            <div className="flex items-center gap-2">
                                {activationResult.status === 'success' ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-600" />
                                )}
                                <p className={`font-semibold ${activationResult.status === 'success' ? 'text-green-800' : 'text-red-800'
                                    }`}>
                                    {activationResult.message}
                                </p>
                            </div>
                            {activationResult.workflows && (
                                <p className="text-xs text-green-600 mt-1">
                                    Workflows: {activationResult.workflows.join(', ')}
                                </p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Deploy Workflows Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Deploy Workflows</h3>
                </div>

                {/* Drop Zone */}
                <div
                    {...getRootProps()}
                    className={`
                    p-12 text-center cursor-pointer transition-all duration-300
                    border-2 border-dashed rounded-2xl
                    ${isDragActive
                            ? 'border-infor-red bg-red-500/10 scale-[1.01]'
                            : 'border-white/10 hover:border-infor-red/50 hover:bg-white/5'
                        }
                    ${uploading ? 'opacity-50 pointer-events-none' : ''}
                `}
                >
                    <input {...getInputProps()} />

                    <motion.div
                        animate={{
                            scale: isDragActive ? 1.1 : 1,
                            rotate: isDragActive ? 5 : 0
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="flex flex-col items-center gap-4"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
                                <p className="text-lg font-semibold text-purple-600">Deploying workflows...</p>
                            </>
                        ) : (
                            <>
                                <div className="w-20 h-20 bg-white/5 text-infor-red rounded-full flex items-center justify-center mb-2">
                                    <Upload className="w-10 h-10" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-slate-200">
                                        {isDragActive ? "Drop workflow files here..." : "Drag & drop workflow files"}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-2 font-medium">
                                        or click to browse (.txt files with JSON payloads)
                                    </p>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>

                {/* Results */}
                <AnimatePresence>
                    {uploadResults.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-3"
                        >
                            <h4 className="font-bold text-slate-800">Deployment Results</h4>
                            {uploadResults.map((result, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`
                                    flex items-center justify-between p-4 rounded-xl border backdrop-blur-sm
                                    ${result.status === 'success'
                                            ? 'bg-emerald-500/10 border-emerald-500/20'
                                            : 'bg-red-500/10 border-red-500/20'
                                        }
                                `}
                                >
                                    <div className="flex items-center gap-3">
                                        <File className={`w-5 h-5 ${result.status === 'success' ? 'text-green-600' : 'text-red-600'
                                            }`} />
                                        <div>
                                            <p className={`font-semibold ${result.status === 'success' ? 'text-green-800' : 'text-red-800'
                                                }`}>
                                                {result.filename}
                                            </p>
                                            <p className={`text-xs ${result.status === 'success' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {result.message}
                                            </p>
                                        </div>
                                    </div>
                                    {result.status === 'success' ? (
                                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                                    ) : (
                                        <XCircle className="w-6 h-6 text-red-600" />
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const DataflowsTab = () => {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState([]);

    // Activation state
    const [dataflowNames, setDataflowNames] = useState('');
    const [activating, setActivating] = useState(false);
    const [activationResult, setActivationResult] = useState(null);

    // Activation handler
    const handleActivate = async () => {
        if (!dataflowNames.trim()) return;

        setActivating(true);
        setActivationResult(null);

        try {
            const dataflowArray = dataflowNames.split(',').map(name => name.trim());

            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ion-dataflows-activate`,
                { dataflows: dataflowArray },
                {
                    params: {
                        tenantUrl: user.tenantUrl,
                        token: user.token
                    }
                }
            );

            setActivationResult({
                status: 'success',
                message: `Successfully activated ${dataflowArray.length} dataflow(s)`,
                dataflows: dataflowArray
            });
            setDataflowNames('');
        } catch (error) {
            setActivationResult({
                status: 'error',
                message: error.response?.data?.error || error.message
            });
        } finally {
            setActivating(false);
        }
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        if (!acceptedFiles || acceptedFiles.length === 0) return;

        setUploading(true);
        setUploadResults([]);

        try {
            const results = await Promise.all(
                acceptedFiles.map(async (file) => {
                    try {
                        const formData = new FormData();
                        formData.append('file', file);

                        await axios.post(
                            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ion-dataflows`,
                            formData,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                                params: {
                                    tenantUrl: user.tenantUrl,
                                    token: user.token
                                }
                            }
                        );

                        return {
                            filename: file.name,
                            status: 'success',
                            message: 'Dataflow deployed successfully'
                        };
                    } catch (error) {
                        return {
                            filename: file.name,
                            status: 'error',
                            message: error.response?.data?.error || error.message
                        };
                    }
                })
            );

            setUploadResults(results);
        } catch (error) {
            console.error('Dataflows upload error:', error);
        } finally {
            setUploading(false);
        }
    }, [user]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true
    });

    return (
        <div className="space-y-8">
            {/* Dataflow Activation Section */}
            <div className="glass-panel rounded-2xl p-8 border border-white/10 bg-white/5">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-infor-red" />
                    Activate Dataflows
                </h3>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={dataflowNames}
                        onChange={(e) => setDataflowNames(e.target.value)}
                        placeholder="Enter dataflow names (comma-separated, e.g., CSWMS_IMS,dataflow2)"
                        className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:border-infor-red focus:ring-1 focus:ring-infor-red outline-none transition-all placeholder:text-slate-500"
                        disabled={activating}
                    />
                    <button
                        onClick={handleActivate}
                        disabled={activating || !dataflowNames.trim()}
                        className={`
                            px-6 py-3 rounded-xl font-bold transition-all
                            ${activating || !dataflowNames.trim()
                                ? 'bg-white/10 text-slate-500 cursor-not-allowed'
                                : 'bg-infor-red text-white hover:bg-[#b00029] shadow-lg hover:shadow-red-900/40'
                            }
                        `}
                    >
                        {activating ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Activating...
                            </span>
                        ) : (
                            'Activate'
                        )}
                    </button>
                </div>

                {/* Activation Result */}
                <AnimatePresence>
                    {activationResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`
                                mt-4 p-4 rounded-xl border
                                ${activationResult.status === 'success'
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-red-50 border-red-200'
                                }
                            `}
                        >
                            <div className="flex items-center gap-2">
                                {activationResult.status === 'success' ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-600" />
                                )}
                                <p className={`font-semibold ${activationResult.status === 'success' ? 'text-green-800' : 'text-red-800'
                                    }`}>
                                    {activationResult.message}
                                </p>
                            </div>
                            {activationResult.dataflows && (
                                <p className="text-xs text-green-600 mt-1">
                                    Dataflows: {activationResult.dataflows.join(', ')}
                                </p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Deploy Dataflows Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800">Deploy Dataflows</h3>
                </div>

                {/* Drop Zone */}
                <div
                    {...getRootProps()}
                    className={`
                        relative overflow-hidden rounded-2xl border-2 border-dashed p-12 transition-all cursor-pointer
                        ${isDragActive
                            ? 'border-infor-red bg-red-500/10 scale-[1.01]'
                            : 'border-white/10 bg-white/5 hover:border-infor-red/50 hover:bg-white/10'
                        }
                    `}
                >
                    <input {...getInputProps()} />
                    <motion.div
                        animate={{
                            scale: isDragActive ? 1.1 : 1,
                            rotate: isDragActive ? 5 : 0
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="flex flex-col items-center gap-4"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-16 h-16 text-infor-red animate-spin" />
                                <p className="text-lg font-semibold text-infor-red">Deploying dataflows...</p>
                            </>
                        ) : (
                            <>
                                <div className="w-20 h-20 bg-white/5 text-infor-red rounded-full flex items-center justify-center mb-2">
                                    <Database className="w-10 h-10" />
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-slate-200">
                                        {isDragActive ? 'Drop files here...' : 'Drag & drop dataflow files here'}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-2 font-medium">or click to browse</p>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>

                {/* Upload Results */}
                <AnimatePresence>
                    {uploadResults.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                        >
                            {uploadResults.map((result, index) => (
                                <motion.div
                                    key={result.filename}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`
                                        p-4 rounded-xl border flex items-center gap-3 backdrop-blur-sm
                                        ${result.status === 'success'
                                            ? 'bg-emerald-500/10 border-emerald-500/20'
                                            : 'bg-red-500/10 border-red-500/20'
                                        }
                                    `}
                                >
                                    {result.status === 'success' ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 truncate">{result.filename}</p>
                                        <p className={`text-sm ${result.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                            {result.message}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};


const ConnectionPointTab = () => {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState([]);

    const onDrop = useCallback(async (acceptedFiles) => {
        if (!acceptedFiles || acceptedFiles.length === 0) return;

        setUploading(true);
        setUploadResults([]);

        try {
            const results = await Promise.all(
                acceptedFiles.map(async (file) => {
                    try {
                        const formData = new FormData();
                        formData.append('file', file);

                        await axios.post(
                            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ion-connectionpoints`,
                            formData,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                                params: {
                                    tenantUrl: user.tenantUrl,
                                    token: user.token
                                }
                            }
                        );

                        return {
                            filename: file.name,
                            status: 'success',
                            message: 'Connection point deployed successfully'
                        };
                    } catch (error) {
                        return {
                            filename: file.name,
                            status: 'error',
                            message: error.response?.data?.error || error.message
                        };
                    }
                })
            );

            setUploadResults(results);
        } catch (error) {
            console.error('Connection points upload error:', error);
        } finally {
            setUploading(false);
        }
    }, [user]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Deploy Connection Points</h3>
            </div>

            {/* Drop Zone */}
            <div
                {...getRootProps()}
                className={`
                    p-12 text-center cursor-pointer transition-all duration-300
                    border-2 border-dashed rounded-2xl
                    ${isDragActive
                        ? 'border-infor-red bg-red-500/10 scale-[1.01]'
                        : 'border-white/10 hover:border-infor-red/50 hover:bg-white/5'
                    }
                    ${uploading ? 'opacity-50 pointer-events-none' : ''}
                `}
            >
                <input {...getInputProps()} />

                <motion.div
                    animate={{
                        scale: isDragActive ? 1.1 : 1,
                        rotate: isDragActive ? 5 : 0
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="flex flex-col items-center gap-4"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-16 h-16 text-teal-500 animate-spin" />
                            <p className="text-lg font-semibold text-teal-600">Deploying connection points...</p>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-white/5 text-infor-red rounded-full flex items-center justify-center mb-2">
                                <Upload className="w-10 h-10" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-200">
                                    {isDragActive ? "Drop connection point files here..." : "Drag & drop connection point files"}
                                </p>
                                <p className="text-sm text-slate-500 mt-2 font-medium">
                                    or click to browse (supports all file types)
                                </p>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>

            {/* Results */}
            <AnimatePresence>
                {uploadResults.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-3"
                    >
                        <h4 className="font-bold text-slate-800">Deployment Results</h4>
                        {uploadResults.map((result, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`
                                    flex items-center justify-between p-4 rounded-xl border backdrop-blur-sm
                                    ${result.status === 'success'
                                        ? 'bg-emerald-500/10 border-emerald-500/20'
                                        : 'bg-red-500/10 border-red-500/20'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <File className={`w-5 h-5 ${result.status === 'success' ? 'text-green-600' : 'text-red-600'
                                        }`} />
                                    <div>
                                        <p className={`font-semibold ${result.status === 'success' ? 'text-green-800' : 'text-red-800'
                                            }`}>
                                            {result.filename}
                                        </p>
                                        <p className={`text-xs ${result.status === 'success' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {result.message}
                                        </p>
                                    </div>
                                </div>
                                {result.status === 'success' ? (
                                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                                ) : (
                                    <XCircle className="w-6 h-6 text-red-600" />
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const BusinessRulesTab = () => {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState([]);

    // Approval state
    const [ruleNames, setRuleNames] = useState('');
    const [approving, setApproving] = useState(false);
    const [approvalResult, setApprovalResult] = useState(null);

    // Approval handler
    const handleApprove = async () => {
        if (!ruleNames.trim()) return;

        setApproving(true);
        setApprovalResult(null);

        try {
            // Convert comma-separated names to array
            const ruleArray = ruleNames.split(',').map(name => name.trim());

            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ion-businessrules-approve`,
                { rules: ruleArray },
                {
                    params: {
                        tenantUrl: user.tenantUrl,
                        token: user.token
                    }
                }
            );

            setApprovalResult({
                status: 'success',
                message: `Successfully submitted and approved ${ruleArray.length} business rule(s)`,
                rules: ruleArray
            });
            setRuleNames(''); // Clear input on success
        } catch (error) {
            setApprovalResult({
                status: 'error',
                message: error.response?.data?.error || error.message
            });
        } finally {
            setApproving(false);
        }
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        if (!acceptedFiles || acceptedFiles.length === 0) return;

        setUploading(true);
        setUploadResults([]);

        try {
            const results = await Promise.all(
                acceptedFiles.map(async (file) => {
                    try {
                        const formData = new FormData();
                        formData.append('file', file);

                        await axios.post(
                            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ion-businessrules`,
                            formData,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                                params: {
                                    tenantUrl: user.tenantUrl,
                                    token: user.token
                                }
                            }
                        );

                        return {
                            filename: file.name,
                            status: 'success',
                            message: 'Business rule deployed successfully'
                        };
                    } catch (error) {
                        return {
                            filename: file.name,
                            status: 'error',
                            message: error.response?.data?.error || error.message
                        };
                    }
                })
            );

            setUploadResults(results);
        } catch (error) {
            console.error('Business rules upload error:', error);
        } finally {
            setUploading(false);
        }
    }, [user]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true
    });

    return (
        <div className="space-y-8">
            {/* Business Rules Approval Section */}
            <div className="glass-panel rounded-2xl p-8 border border-white/10 bg-white/5">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-infor-red" />
                    Approve Business Rules
                </h3>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={ruleNames}
                        onChange={(e) => setRuleNames(e.target.value)}
                        placeholder="Enter business rule names (comma-separated, e.g., rule1,rule2)"
                        className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:border-infor-red focus:ring-1 focus:ring-infor-red outline-none transition-all placeholder:text-slate-500"
                        disabled={approving}
                    />
                    <button
                        onClick={handleApprove}
                        disabled={approving || !ruleNames.trim()}
                        className={`
                            px-6 py-3 rounded-xl font-bold transition-all
                            ${approving || !ruleNames.trim()
                                ? 'bg-white/10 text-slate-500 cursor-not-allowed'
                                : 'bg-infor-red text-white hover:bg-[#b00029] shadow-lg hover:shadow-red-900/40'
                            }
                        `}
                    >
                        {approving ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Approving...
                            </span>
                        ) : (
                            'Approve'
                        )}
                    </button>
                </div>

                {/* Approval Result */}
                <AnimatePresence>
                    {approvalResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`
                                mt-4 p-4 rounded-xl border
                                ${approvalResult.status === 'success'
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-red-50 border-red-200'
                                }
                            `}
                        >
                            <div className="flex items-center gap-2">
                                {approvalResult.status === 'success' ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-600" />
                                )}
                                <p className={`font-semibold ${approvalResult.status === 'success' ? 'text-green-800' : 'text-red-800'
                                    }`}>
                                    {approvalResult.message}
                                </p>
                            </div>
                            {approvalResult.rules && (
                                <p className="text-xs text-green-600 mt-1">
                                    Rules: {approvalResult.rules.join(', ')}
                                </p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Deploy Business Rules Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Deploy Business Rules</h3>
                </div>

                {/* Drop Zone */}
                <div
                    {...getRootProps()}
                    className={`
                    p-12 text-center cursor-pointer transition-all duration-300
                    border-2 border-dashed rounded-2xl
                    ${isDragActive
                            ? 'border-infor-red bg-red-500/10 scale-[1.01]'
                            : 'border-white/10 hover:border-infor-red/50 hover:bg-white/5'
                        }
                    ${uploading ? 'opacity-50 pointer-events-none' : ''}
                `}
                >
                    <input {...getInputProps()} />

                    <motion.div
                        animate={{
                            scale: isDragActive ? 1.1 : 1,
                            rotate: isDragActive ? 5 : 0
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="flex flex-col items-center gap-4"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-16 h-16 text-infor-red animate-spin" />
                                <p className="text-lg font-semibold text-infor-red">Deploying business rules...</p>
                            </>
                        ) : (
                            <>
                                <div className="w-20 h-20 bg-white/5 text-infor-red rounded-full flex items-center justify-center mb-2">
                                    <Upload className="w-10 h-10" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-slate-200">
                                        {isDragActive ? "Drop business rule files here..." : "Drag & drop business rule files"}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-2 font-medium">
                                        or click to browse (supports all file types)
                                    </p>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>

                {/* Results */}
                <AnimatePresence>
                    {uploadResults.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-3"
                        >
                            <h4 className="font-bold text-slate-800">Deployment Results</h4>
                            {uploadResults.map((result, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`
                                    flex items-center justify-between p-4 rounded-xl border backdrop-blur-sm
                                    ${result.status === 'success'
                                            ? 'bg-emerald-500/10 border-emerald-500/20'
                                            : 'bg-red-500/10 border-red-500/20'
                                        }
                                `}
                                >
                                    <div className="flex items-center gap-3">
                                        <File className={`w-5 h-5 ${result.status === 'success' ? 'text-green-600' : 'text-red-600'
                                            }`} />
                                        <div>
                                            <p className={`font-semibold ${result.status === 'success' ? 'text-green-800' : 'text-red-800'
                                                }`}>
                                                {result.filename}
                                            </p>
                                            <p className={`text-xs ${result.status === 'success' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {result.message}
                                            </p>
                                        </div>
                                    </div>
                                    {result.status === 'success' ? (
                                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                                    ) : (
                                        <XCircle className="w-6 h-6 text-red-600" />
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const ScriptingTab = () => {
    const { user } = useAuth();

    // Libraries state
    const [uploadingLibraries, setUploadingLibraries] = useState(false);
    const [libraryResults, setLibraryResults] = useState([]);

    // Scripts state
    const [uploadingScripts, setUploadingScripts] = useState(false);
    const [scriptResults, setScriptResults] = useState([]);

    // Approval state
    const [scriptNames, setScriptNames] = useState('');
    const [approving, setApproving] = useState(false);
    const [approvalResult, setApprovalResult] = useState(null);

    // Approval handler
    const handleApprove = async () => {
        if (!scriptNames.trim()) return;

        setApproving(true);
        setApprovalResult(null);

        try {
            // Convert comma-separated names to array and capitalize first letter of each
            const scriptArray = scriptNames.split(',').map(name => {
                const trimmed = name.trim();
                return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
            });

            const response = await axios.put(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ion-scripts-approve`,
                scriptArray,  // Send array directly, not {scripts: scriptArray}
                {
                    params: {
                        tenantUrl: user.tenantUrl,
                        token: user.token
                    }
                }
            );

            setApprovalResult({
                status: 'success',
                message: `Successfully approved ${scriptArray.length} script(s)`,
                scripts: scriptArray
            });
            setScriptNames(''); // Clear input on success
        } catch (error) {
            setApprovalResult({
                status: 'error',
                message: error.response?.data?.error || error.message
            });
        } finally {
            setApproving(false);
        }
    };

    // Libraries upload handler
    const onDropLibraries = useCallback(async (acceptedFiles) => {
        if (!acceptedFiles || acceptedFiles.length === 0) return;

        setUploadingLibraries(true);
        setLibraryResults([]);

        try {
            const results = await Promise.all(
                acceptedFiles.map(async (file) => {
                    try {
                        const formData = new FormData();
                        formData.append('file', file);

                        await axios.post(
                            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ion-libraries`,
                            formData,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                                params: {
                                    tenantUrl: user.tenantUrl,
                                    token: user.token
                                }
                            }
                        );

                        return {
                            filename: file.name,
                            status: 'success',
                            message: 'Library deployed successfully'
                        };
                    } catch (error) {
                        return {
                            filename: file.name,
                            status: 'error',
                            message: error.response?.data?.error || error.message
                        };
                    }
                })
            );

            setLibraryResults(results);
        } catch (error) {
            console.error('Libraries upload error:', error);
        } finally {
            setUploadingLibraries(false);
        }
    }, [user]);

    // Scripts upload handler
    const onDropScripts = useCallback(async (acceptedFiles) => {
        if (!acceptedFiles || acceptedFiles.length === 0) return;

        setUploadingScripts(true);
        setScriptResults([]);

        try {
            const results = await Promise.all(
                acceptedFiles.map(async (file) => {
                    try {
                        const formData = new FormData();
                        formData.append('file', file);

                        await axios.post(
                            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ion-scripts`,
                            formData,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                                params: {
                                    tenantUrl: user.tenantUrl,
                                    token: user.token
                                }
                            }
                        );

                        return {
                            filename: file.name,
                            status: 'success',
                            message: 'Script deployed successfully'
                        };
                    } catch (error) {
                        return {
                            filename: file.name,
                            status: 'error',
                            message: error.response?.data?.error || error.message
                        };
                    }
                })
            );

            setScriptResults(results);
        } catch (error) {
            console.error('Scripts upload error:', error);
        } finally {
            setUploadingScripts(false);
        }
    }, [user]);

    const { getRootProps: getLibrariesRootProps, getInputProps: getLibrariesInputProps, isDragActive: isLibrariesDragActive } = useDropzone({
        onDrop: onDropLibraries,
        multiple: true
    });

    const { getRootProps: getScriptsRootProps, getInputProps: getScriptsInputProps, isDragActive: isScriptsDragActive } = useDropzone({
        onDrop: onDropScripts,
        multiple: true
    });

    return (
        <div className="space-y-8">
            {/* Script Approval Section */}
            <div className="glass-panel rounded-2xl p-8 border border-white/10 bg-white/5">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Code className="w-5 h-5 text-infor-red" />
                    Approve Scripts
                </h3>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={scriptNames}
                        onChange={(e) => setScriptNames(e.target.value)}
                        placeholder="Enter script names (comma-separated, e.g., statuscheck,statuscheck1)"
                        className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:border-infor-red focus:ring-1 focus:ring-infor-red outline-none transition-all placeholder:text-slate-500"
                        disabled={approving}
                    />
                    <button
                        onClick={handleApprove}
                        disabled={approving || !scriptNames.trim()}
                        className={`
                            px-6 py-3 rounded-xl font-bold transition-all
                            ${approving || !scriptNames.trim()
                                ? 'bg-white/10 text-slate-500 cursor-not-allowed'
                                : 'bg-infor-red text-white hover:bg-[#b00029] shadow-lg hover:shadow-red-900/40'
                            }
                        `}
                    >
                        {approving ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Approving...
                            </span>
                        ) : (
                            'Approve'
                        )}
                    </button>
                </div>

                {/* Approval Result */}
                <AnimatePresence>
                    {approvalResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`
                                mt-4 p-4 rounded-xl border
                                ${approvalResult.status === 'success'
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-red-50 border-red-200'
                                }
                            `}
                        >
                            <div className="flex items-center gap-2">
                                {approvalResult.status === 'success' ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-600" />
                                )}
                                <p className={`font-semibold ${approvalResult.status === 'success' ? 'text-green-800' : 'text-red-800'
                                    }`}>
                                    {approvalResult.message}
                                </p>
                            </div>
                            {approvalResult.scripts && (
                                <p className="text-xs text-green-600 mt-1">
                                    Scripts: {approvalResult.scripts.join(', ')}
                                </p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Python Libraries Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Deploy Python Libraries</h3>
                </div>

                {/* Libraries Drop Zone */}
                <div
                    {...getLibrariesRootProps()}
                    className={`
                        p-12 text-center cursor-pointer transition-all duration-300
                        border-2 border-dashed rounded-2xl
                        ${isLibrariesDragActive
                            ? 'border-infor-red bg-red-500/10 scale-[1.01]'
                            : 'border-white/10 hover:border-infor-red/50 hover:bg-white/5'
                        }
                        ${uploadingLibraries ? 'opacity-50 pointer-events-none' : ''}
                    `}
                >
                    <input {...getLibrariesInputProps()} />

                    <motion.div
                        animate={{
                            scale: isLibrariesDragActive ? 1.1 : 1,
                            rotate: isLibrariesDragActive ? 5 : 0
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="flex flex-col items-center gap-4"
                    >
                        {uploadingLibraries ? (
                            <>
                                <Loader2 className="w-16 h-16 text-infor-red animate-spin" />
                                <p className="text-lg font-semibold text-infor-red">Deploying libraries...</p>
                            </>
                        ) : (
                            <>
                                <div className="w-20 h-20 bg-white/5 text-infor-red rounded-full flex items-center justify-center mb-2">
                                    <Upload className="w-10 h-10" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-slate-200">
                                        {isLibrariesDragActive ? "Drop library files here..." : "Drag & drop library files"}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-2 font-medium">
                                        or click to browse (.txt files with JSON payloads)
                                    </p>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>

                {/* Libraries Results */}
                <AnimatePresence>
                    {libraryResults.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-3"
                        >
                            <h4 className="font-bold text-slate-800">Deployment Results</h4>
                            {libraryResults.map((result, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`
                                        flex items-center justify-between p-4 rounded-xl border
                                        ${result.status === 'success'
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-red-50 border-red-200'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <File className={`w-5 h-5 ${result.status === 'success' ? 'text-green-600' : 'text-red-600'
                                            }`} />
                                        <div>
                                            <p className={`font-semibold ${result.status === 'success' ? 'text-green-800' : 'text-red-800'
                                                }`}>
                                                {result.filename}
                                            </p>
                                            <p className={`text-xs ${result.status === 'success' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {result.message}
                                            </p>
                                        </div>
                                    </div>
                                    {result.status === 'success' ? (
                                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                                    ) : (
                                        <XCircle className="w-6 h-6 text-red-600" />
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200"></div>

            {/* Python Scripts Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Deploy Python Scripts</h3>
                </div>

                {/* Scripts Drop Zone */}
                <div
                    {...getScriptsRootProps()}
                    className={`
                        p-12 text-center cursor-pointer transition-all duration-300
                        border-2 border-dashed rounded-2xl
                        ${isScriptsDragActive
                            ? 'border-infor-red bg-red-500/10 scale-[1.01]'
                            : 'border-white/10 hover:border-infor-red/50 hover:bg-white/5'
                        }
                        ${uploadingScripts ? 'opacity-50 pointer-events-none' : ''}
                    `}
                >
                    <input {...getScriptsInputProps()} />

                    <motion.div
                        animate={{
                            scale: isScriptsDragActive ? 1.1 : 1,
                            rotate: isScriptsDragActive ? 5 : 0
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="flex flex-col items-center gap-4"
                    >
                        {uploadingScripts ? (
                            <>
                                <Loader2 className="w-16 h-16 text-infor-red animate-spin" />
                                <p className="text-lg font-semibold text-infor-red">Deploying scripts...</p>
                            </>
                        ) : (
                            <>
                                <div className="w-20 h-20 bg-white/5 text-infor-red rounded-full flex items-center justify-center mb-2">
                                    <Upload className="w-10 h-10" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-slate-200">
                                        {isScriptsDragActive ? "Drop script files here..." : "Drag & drop script files"}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-2 font-medium">
                                        or click to browse (.txt files with JSON payloads)
                                    </p>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>

                {/* Scripts Results */}
                <AnimatePresence>
                    {scriptResults.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-3"
                        >
                            <h4 className="font-bold text-slate-800">Deployment Results</h4>
                            {scriptResults.map((result, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`
                                        flex items-center justify-between p-4 rounded-xl border
                                        ${result.status === 'success'
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-red-50 border-red-200'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <File className={`w-5 h-5 ${result.status === 'success' ? 'text-green-600' : 'text-red-600'
                                            }`} />
                                        <div>
                                            <p className={`font-semibold ${result.status === 'success' ? 'text-green-800' : 'text-red-800'
                                                }`}>
                                                {result.filename}
                                            </p>
                                            <p className={`text-xs ${result.status === 'success' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {result.message}
                                            </p>
                                        </div>
                                    </div>
                                    {result.status === 'success' ? (
                                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                                    ) : (
                                        <XCircle className="w-6 h-6 text-red-600" />
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};




const ObjectSchemasTab = () => {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState([]);

    const onDrop = useCallback(async (acceptedFiles) => {
        if (!acceptedFiles || acceptedFiles.length === 0) return;

        setUploading(true);
        setUploadResults([]);

        // Get user name for query parameter
        const userName = user?.userData?.response?.userlist?.[0]?.displayName || 'Unknown';

        try {
            const results = await Promise.all(
                acceptedFiles.map(async (file) => {
                    try {
                        const formData = new FormData();
                        formData.append('file', file);

                        await axios.post(
                            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ion-object-schemas`,
                            formData,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                                params: {
                                    tenantUrl: user.tenantUrl,
                                    token: user.token,
                                    user: userName
                                }
                            }
                        );

                        return {
                            filename: file.name,
                            status: 'success',
                            message: 'Object schema deployed successfully'
                        };
                    } catch (error) {
                        return {
                            filename: file.name,
                            status: 'error',
                            message: error.response?.data?.error || error.message
                        };
                    }
                })
            );

            setUploadResults(results);
        } catch (error) {
            console.error('Object schemas upload error:', error);
        } finally {
            setUploading(false);
        }
    }, [user]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Deploy Object Schemas</h3>
            </div>

            {/* Drop Zone */}
            <div
                {...getRootProps()}
                className={`
                    p-12 text-center cursor-pointer transition-all duration-300
                    border-2 border-dashed rounded-2xl
                    ${isDragActive
                        ? 'border-infor-red bg-red-500/10 scale-[1.01]'
                        : 'border-white/10 hover:border-infor-red/50 hover:bg-white/5'
                    }
                    ${uploading ? 'opacity-50 pointer-events-none' : ''}
                `}
            >
                <input {...getInputProps()} />

                <motion.div
                    animate={{
                        scale: isDragActive ? 1.1 : 1,
                        rotate: isDragActive ? 5 : 0
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="flex flex-col items-center gap-4"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-16 h-16 text-infor-red animate-spin" />
                            <p className="text-lg font-semibold text-infor-red">Deploying object schemas...</p>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-white/5 text-infor-red rounded-full flex items-center justify-center mb-2">
                                <FileJson className="w-10 h-10" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-200">
                                    {isDragActive ? "Drop schema files here..." : "Drag & drop object schema files"}
                                </p>
                                <p className="text-sm text-slate-500 mt-2 font-medium">
                                    or click to browse (supports multiple files)
                                </p>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>

            {/* Results */}
            <AnimatePresence>
                {uploadResults.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-3"
                    >
                        <h4 className="font-bold text-slate-800">Deployment Results</h4>
                        {uploadResults.map((result, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`
                                    flex items-center justify-between p-4 rounded-xl border backdrop-blur-sm
                                    ${result.status === 'success'
                                        ? 'bg-emerald-500/10 border-emerald-500/20'
                                        : 'bg-red-500/10 border-red-500/20'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <File className={`w-5 h-5 ${result.status === 'success' ? 'text-green-600' : 'text-red-600'
                                        }`} />
                                    <div>
                                        <p className={`font-semibold ${result.status === 'success' ? 'text-green-800' : 'text-red-800'
                                            }`}>
                                            {result.filename}
                                        </p>
                                        <p className={`text-xs ${result.status === 'success' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {result.message}
                                        </p>
                                    </div>
                                </div>
                                {result.status === 'success' ? (
                                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                                ) : (
                                    <XCircle className="w-6 h-6 text-red-600" />
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ION;
