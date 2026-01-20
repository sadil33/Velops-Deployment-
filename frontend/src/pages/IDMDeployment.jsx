import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/api';
import { Upload, File, CheckCircle2, XCircle, Loader2, Settings, Package, Database } from 'lucide-react';

const IDMDeployment = () => {
    const [activeTab, setActiveTab] = useState('import-config');

    const tabs = [
        { id: 'import-config', label: 'Import Configuration', icon: Database },
        { id: 'deploy-item', label: 'Deploy Item', icon: Package },
    ];

    return (
        <div className="space-y-8 font-sans">
            <div className="flex items-center gap-4 pl-2">
                <div className="p-3 bg-gradient-to-br from-infor-red to-[#b00029] text-white rounded-xl shadow-lg shadow-red-900/40">
                    <Upload className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-md">IDM Deployment</h2>
                    <p className="text-slate-400 font-medium">Manage IDM configurations and deployments</p>
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
                <div className="p-8">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'import-config' && <ImportConfigTab />}
                        {activeTab === 'deploy-item' && <DeployItemTab />}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

const ImportConfigTab = () => {
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
                            `${API_BASE_URL}/api/idm-config-import`,
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
                            message: 'Configuration imported successfully'
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
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
            >
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Database className="w-5 h-5 text-blue-400" />
                        Import Configuration
                    </h3>
                    <p className="text-slate-400">Upload configuration files (e.g., .xml) to import into IDM</p>
                </div>

                <div
                    {...getRootProps()}
                    className={`
                        border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
                        ${isDragActive
                            ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
                            : 'border-white/10 hover:border-blue-400/50 hover:bg-white/5'
                        }
                    `}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-4">
                        <div className={`p-4 rounded-full transition-colors ${isDragActive ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-slate-400'}`}>
                            <Upload className="w-8 h-8" />
                        </div>
                        {uploading ? (
                            <div className="text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
                                <p className="text-slate-300 font-medium">Importing configurations...</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-lg font-bold text-slate-200">
                                    {isDragActive ? "Drop config files here" : "Click to upload or drag and drop"}
                                </p>
                                <p className="text-sm text-slate-500 mt-2 font-medium">
                                    Supports multiple XML files
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Results */}
            <AnimatePresence>
                {uploadResults.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-3"
                    >
                        <h4 className="font-bold text-white">Import Results</h4>
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
                                    <File className={`w-5 h-5 ${result.status === 'success' ? 'text-emerald-400' : 'text-red-400'}`} />
                                    <div>
                                        <p className={`font-bold ${result.status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {result.filename}
                                        </p>
                                        <p className={`text-xs ${result.status === 'success' ? 'text-emerald-500/80' : 'text-red-500/80'}`}>
                                            {result.message}
                                        </p>
                                    </div>
                                </div>
                                {result.status === 'success' ? (
                                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                ) : (
                                    <XCircle className="w-6 h-6 text-red-400" />
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const DeployItemTab = () => {
    const { user, incrementDeployments } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState([]);
    const [config, setConfig] = useState({
        version: 'claude-3-7-sonnet-20250219-v1:0',
        model: 'CLAUDE',
        fileType: '-',
        entityName: 'GenAIPromptTest'
    });

    const onDrop = useCallback(async (acceptedFiles) => {
        if (!acceptedFiles || acceptedFiles.length === 0) return;

        setUploading(true);
        setUploadResults([]);

        try {
            let successCount = 0;
            const results = await Promise.all(
                acceptedFiles.map(async (file) => {
                    try {
                        const formData = new FormData();
                        formData.append('file', file);

                        await axios.post(
                            `${API_BASE_URL}/api/idm-deploy`,
                            formData,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                                params: {
                                    tenantUrl: user.tenantUrl,
                                    token: user.token,
                                    version: config.version,
                                    model: config.model,
                                    fileType: config.fileType,
                                    entityName: config.entityName
                                }
                            }
                        );
                        successCount++;
                        return {
                            filename: file.name,
                            status: 'success',
                            message: 'Deployed successfully'
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

            if (successCount > 0) {
                incrementDeployments();
            }

            setUploadResults(results);
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    }, [user, config, incrementDeployments]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true
    });

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                        <Settings className="w-5 h-5 text-infor-red" />
                        Deployment Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Entity Name
                            </label>
                            <input
                                type="text"
                                value={config.entityName}
                                onChange={(e) => setConfig({ ...config, entityName: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:border-infor-red focus:ring-1 focus:ring-infor-red outline-none transition-all placeholder:text-slate-600"
                                placeholder="Enter Entity Name"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Version
                            </label>
                            <input
                                type="text"
                                value={config.version}
                                onChange={(e) => setConfig({ ...config, version: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:border-infor-red focus:ring-1 focus:ring-infor-red outline-none transition-all placeholder:text-slate-600"
                                placeholder="Version ID"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Model
                            </label>
                            <input
                                type="text"
                                value={config.model}
                                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:border-infor-red focus:ring-1 focus:ring-infor-red outline-none transition-all placeholder:text-slate-600"
                                placeholder="CLAUDE"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                File Type
                            </label>
                            <input
                                type="text"
                                value={config.fileType}
                                onChange={(e) => setConfig({ ...config, fileType: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:border-infor-red focus:ring-1 focus:ring-infor-red outline-none transition-all placeholder:text-slate-600"
                                placeholder="-"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
            >
                <div className="mb-2">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Upload className="w-5 h-5 text-infor-red" />
                        Upload Files
                    </h3>
                    <p className="text-slate-400">Drag and drop files to deploy</p>
                </div>

                <div
                    {...getRootProps()}
                    className={`
                        border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
                        ${isDragActive
                            ? 'border-infor-red bg-red-500/10 scale-[1.01]'
                            : 'border-white/10 hover:border-infor-red/50 hover:bg-white/5'
                        }
                    `}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-4">
                        <div className={`p-4 rounded-full transition-colors ${isDragActive ? 'bg-red-500/20 text-infor-red' : 'bg-white/5 text-slate-400'}`}>
                            <Upload className="w-8 h-8" />
                        </div>
                        {uploading ? (
                            <div className="text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-infor-red mx-auto mb-3" />
                                <p className="text-slate-300 font-medium">Deploying files...</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-lg font-bold text-slate-200">
                                    {isDragActive ? "Drop files here" : "Click to upload or drag and drop"}
                                </p>
                                <p className="text-sm text-slate-500 mt-2 font-medium">
                                    Supports multiple files
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Results */}
            <AnimatePresence>
                {uploadResults.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-3"
                    >
                        <h4 className="font-bold text-white">Deployment Results</h4>
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
                                    <File className={`w-5 h-5 ${result.status === 'success' ? 'text-emerald-400' : 'text-red-400'}`} />
                                    <div>
                                        <p className={`font-bold ${result.status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {result.filename}
                                        </p>
                                        <p className={`text-xs ${result.status === 'success' ? 'text-emerald-500/80' : 'text-red-500/80'}`}>
                                            {result.message}
                                        </p>
                                    </div>
                                </div>
                                {result.status === 'success' ? (
                                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                ) : (
                                    <XCircle className="w-6 h-6 text-red-400" />
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default IDMDeployment;
