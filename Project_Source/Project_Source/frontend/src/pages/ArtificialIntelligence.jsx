import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Sword, Code2, Upload, FileJson, BrainCircuit, Rocket, Zap, XCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import JSZip from 'jszip';
import { useAuth } from '../context/AuthContext';
import FileDropInput from '../components/FileDropInput';

const AITab = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`relative flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${active
            ? 'text-white bg-white/10 shadow-lg shadow-infor-red/20 ring-1 ring-white/20'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
    >
        <Icon className={`w-4 h-4 transition-colors ${active ? 'text-infor-red' : 'text-slate-400'}`} />
        {label}
        {active && (
            <motion.div
                layoutId="activeTabAI"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-infor-red/10 to-transparent"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
        )}
    </button>
);

const DatasetsTab = () => {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const [datasetNames, setDatasetNames] = useState('');
    const [loadingDatasets, setLoadingDatasets] = useState(false);
    const [loadResults, setLoadResults] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        if (!acceptedFiles?.length) return;
        setSelectedFiles(prev => [...prev, ...acceptedFiles]);
    }, []);

    const removeFile = (fileToRemove) => {
        setSelectedFiles(prev => prev.filter(f => f !== fileToRemove));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);
        setUploadResults([]);
        const results = [];
        const successfulNames = [];

        try {
            await Promise.all(selectedFiles.map(async (file) => {
                try {
                    const formData = new FormData();
                    formData.append('file', file);

                    await axios.post(
                        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ai/datasets/upload`,
                        formData,
                        {
                            headers: { 'Content-Type': 'multipart/form-data' },
                            params: {
                                tenantUrl: user.tenantUrl,
                                token: user.token,
                                username: user?.userData?.response?.userlist?.[0]?.displayName || 'Unknown'
                            }
                        }
                    );

                    results.push({
                        name: file.name,
                        success: true,
                        message: "Uploaded successfully"
                    });

                    // Capture name without extension
                    successfulNames.push(file.name.replace(/\.[^/.]+$/, ""));

                } catch (error) {
                    console.error(`Upload Failed for ${file.name}:`, error);
                    results.push({
                        name: file.name,
                        success: false,
                        message: error.response?.data?.error || "Upload failed"
                    });
                }
            }));

            setUploadResults(results);
            setSelectedFiles([]);

            // Auto-populate input field
            if (successfulNames.length > 0) {
                setDatasetNames(prev => {
                    const existing = prev ? prev.split(',').map(s => s.trim()).filter(Boolean) : [];
                    // Add only unique names
                    const newNames = successfulNames.filter(n => !existing.includes(n));
                    return [...existing, ...newNames].join(', ');
                });
            }

        } catch (error) {
            console.error("General Upload Error:", error);
        } finally {
            setUploading(false);
        }
    };

    const handleLoadDatasets = async () => {
        setLoadingDatasets(true);
        setLoadResults(null);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ai/datasets/load`,
                { datasetNames },
                {
                    params: {
                        tenantUrl: user.tenantUrl,
                        token: user.token
                    }
                }
            );
            setLoadResults(response.data);
            console.log("Load Results:", response.data);
        } catch (error) {
            console.error("Load Failed:", error);
        } finally {
            setLoadingDatasets(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ multiple: true, onDrop });

    return (
        <div className="space-y-6">


            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${isDragActive
                    ? 'border-infor-red bg-infor-red/10 scale-[1.02]'
                    : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}
            >
                <input {...getInputProps()} />
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Upload className={`w-8 h-8 ${isDragActive ? 'text-infor-red' : 'text-slate-400'}`} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                    Upload Datasets
                </h3>
                <p className="text-slate-400 max-w-sm mx-auto">
                    Drag & drop your .txt files here, or click to browse (Multiple allowed)
                </p>
            </div>

            {/* Selected Files Preview */}
            <AnimatePresence>
                {selectedFiles.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                    >
                        <h4 className="font-bold text-slate-300">Ready to Upload</h4>
                        <div className="grid gap-2">
                            {selectedFiles.map((file, idx) => (
                                <motion.div
                                    key={`${file.name}-${idx}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                                >
                                    <div className="flex items-center gap-3">
                                        <FileJson className="w-4 h-4 text-indigo-400" />
                                        <span className="text-sm text-slate-200">{file.name}</span>
                                        <span className="text-xs text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
                                    </div>
                                    <button
                                        onClick={() => removeFile(file)}
                                        className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-red-400 transition-colors"
                                    >
                                        <Zap className="w-4 h-4 rotate-45" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="px-6 py-2 bg-infor-red hover:bg-[#b00029] text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/40 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? (
                                    <>
                                        <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        Upload {selectedFiles.length} item(s)
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Result Notification for Uploads */}
            {uploadResults.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-400">Upload Results:</h4>
                    <div className="grid gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                        {uploadResults.map((result, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-3 rounded-xl border flex items-center justify-between ${result.success
                                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    {result.success ? <Database className="w-4 h-4" /> : <Sword className="w-4 h-4" />}
                                    <span className="font-medium text-sm">{result.name}</span>
                                </div>
                                <span className="text-xs opacity-80">{result.message}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Load Datasets Section */}
            <div className="pt-8 border-t border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-infor-red" />
                    Load Datasets
                </h3>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Dataset Names (comma separated)</label>
                        <FileDropInput
                            value={datasetNames}
                            onChange={setDatasetNames}
                            placeholder="e.g., SalesData, InventoryLog..."
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={handleLoadDatasets}
                            disabled={loadingDatasets || !datasetNames.trim()}
                            className="flex items-center gap-2 px-6 py-2.5 bg-infor-red hover:bg-[#b00029] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-lg shadow-infor-red/20"
                        >
                            {loadingDatasets ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Database className="w-4 h-4" />
                            )}
                            Load Datasets
                        </button>
                    </div>

                    {/* Load Results */}
                    {loadResults && (
                        <div className="space-y-3 mt-4">
                            <h4 className="text-sm font-medium text-slate-400">Load Results:</h4>
                            <div className="grid gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                                {loadResults.successful.map((item, i) => (
                                    <div key={`success-${i}`} className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                        <span className="text-green-400 font-medium text-sm flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            {item.name}
                                        </span>
                                        <span className="text-xs text-green-500/70">Loaded Successfully</span>
                                    </div>
                                ))}
                                {loadResults.failed.map((item, i) => (
                                    <div key={`fail-${i}`} className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                        <span className="text-red-400 font-medium text-sm flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                            {item.name}
                                        </span>
                                        <span className="text-xs text-red-500/70 truncate max-w-[200px]" title={item.message}>{item.message}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const QuestsTab = () => {
    const { user } = useAuth();
    console.log('[Debug] User Data:', user?.userData);
    const [uploading, setUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);

    // Training State
    const [trainNames, setTrainNames] = useState('');
    const [training, setTraining] = useState(false);
    const [trainResults, setTrainResults] = useState(null);

    // Deployment Handler
    const onDrop = useCallback((acceptedFiles) => {
        if (!acceptedFiles?.length) return;
        setSelectedFiles(prev => [...prev, ...acceptedFiles]);
    }, []);

    const removeFile = (fileToRemove) => {
        setSelectedFiles(prev => prev.filter(f => f !== fileToRemove));
    };

    const handleDeploy = async () => {
        if (selectedFiles.length === 0) return;
        setUploading(true);
        setUploadResults([]);

        const results = [];
        for (const file of selectedFiles) {
            try {
                const formData = new FormData();
                formData.append('file', file);

                // Pass username for description enrichment
                const username = user?.userData?.response?.userlist?.[0]?.displayName || 'Unknown';

                await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ai/quests`,
                    formData,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        params: {
                            tenantUrl: user.tenantUrl,
                            token: user.token,
                            username: username
                        }
                    }
                );

                results.push({
                    name: file.name,
                    status: 'success',
                    message: 'Quest deployed successfully'
                });
            } catch (error) {
                console.error(`Quest upload failed for ${file.name}:`, error);
                results.push({
                    name: file.name,
                    status: 'error',
                    message: error.response?.data?.error || error.message
                });
            }
        }

        setUploadResults(results);
        setSelectedFiles([]);

        // Auto-populate input field
        const successfulNames = results.filter(r => r.status === 'success').map(r => r.name.replace(/\.[^/.]+$/, ""));
        if (successfulNames.length > 0) {
            setTrainNames(prev => {
                const existing = prev ? prev.split(',').map(s => s.trim()).filter(Boolean) : [];
                const newNames = successfulNames.filter(n => !existing.includes(n));
                return [...existing, ...newNames].join(', ');
            });
        }

        setUploading(false);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/json': ['.json', '.txt'] }, // Accepting txt as per request for JSON payload
        multiple: true
    });

    // Training Handler
    const handleTrain = async () => {
        if (!trainNames.trim()) return;
        setTraining(true);
        setTrainResults(null);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ai/quests/train`,
                { questNames: trainNames },
                {
                    params: {
                        tenantUrl: user.tenantUrl,
                        token: user.token
                    }
                }
            );
            setTrainResults(response.data);
        } catch (error) {
            console.error("Training failed:", error);
            setTrainResults({ success: false, results: [] }); // Simple error state
        } finally {
            setTraining(false);
        }
    };


    return (
        <div className="space-y-8">
            {/* 1. Deploy Quests Section */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Upload className="w-5 h-5 text-infor-red" />
                    Deploy Quests
                </h3>

                <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${isDragActive ? 'border-infor-red bg-infor-red/10' : 'border-white/10 hover:border-white/20 bg-black/20'}`}>
                    <input {...getInputProps()} />
                    <div className="mb-4 flex justify-center"><Sword className="w-10 h-10 text-yellow-500" /></div>
                    <p className="text-lg font-medium text-white mb-2">{uploading ? 'Deploying...' : 'Drop Quest Files (.txt/json)'}</p>
                    <p className="text-sm text-slate-400">files will be parsed and deployed</p>
                </div>

                {/* Selected Files Preview */}
                <AnimatePresence>
                    {selectedFiles.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3"
                        >
                            <h4 className="font-bold text-slate-300">Ready to Deploy</h4>
                            <div className="grid gap-2">
                                {selectedFiles.map((file, idx) => (
                                    <motion.div
                                        key={`${file.name}-${idx}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileJson className="w-4 h-4 text-yellow-500" />
                                            <span className="text-sm text-slate-200">{file.name}</span>
                                            <span className="text-xs text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
                                        </div>
                                        <button
                                            onClick={() => removeFile(file)}
                                            className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-red-400 transition-colors"
                                        >
                                            <Zap className="w-4 h-4 rotate-45" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={handleDeploy}
                                    disabled={uploading}
                                    className="px-6 py-2 bg-infor-red hover:bg-[#b00029] text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/40 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                                            Deploying...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4" />
                                            Deploy {selectedFiles.length} item(s)
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Upload Results */}
                {uploadResults.length > 0 && (
                    <div className="grid gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                        {uploadResults.map((res, i) => (
                            <div key={i} className={`p-4 rounded-xl border flex justify-between items-center ${res.status === 'success' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                <span className={`font-bold ${res.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>{res.name}</span>
                                <span className="text-xs text-slate-400">{res.message}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 2. Train Quests Section */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-infor-red" />
                    Train Quests
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Quest Names (comma separated)</label>
                        <FileDropInput
                            value={trainNames}
                            onChange={setTrainNames}
                            placeholder="e.g. MyQuest1, MyQuest2..."
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={handleTrain}
                            disabled={training || !trainNames.trim()}
                            className="px-6 py-3 bg-infor-red hover:bg-[#b00029] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-infor-red/20 flex items-center gap-2"
                        >
                            {training ? <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <BrainCircuit className="w-5 h-5" />}
                            {training ? 'Starting Training...' : 'Train Quests'}
                        </button>
                    </div>
                </div>

                {/* Training Results */}
                {trainResults && (
                    <div className="mt-6 space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                        {trainResults.results && trainResults.results.map((res, i) => (
                            <div key={i} className={`p-4 rounded-xl border ${res.status === 'success' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                <div className="flex items-center justify-between">
                                    <h4 className={`font-bold ${res.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>{res.name}</h4>
                                    <span className="text-xs text-slate-400">{res.message || (res.status === 'success' ? 'Training Started' : 'Failed')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Active Quests Display (Previous Implementation Preserved/Modified) */}
            <div className="opacity-50 pointer-events-none filter grayscale">
                {/* Keeping the old UI just as visual filler or we can remove it. User asked to 'make changes in quests tab', implies replacing or upgrading. I will replace the old static list with just the new functionality for clarity as requested. */}
            </div>
        </div>
    );
};

const OptimizationTab = () => {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const onDrop = useCallback((acceptedFiles) => {
        if (!acceptedFiles?.length) return;
        setSelectedFiles(prev => [...prev, ...acceptedFiles]);
    }, []);

    const removeFile = (fileToRemove) => {
        setSelectedFiles(prev => prev.filter(f => f !== fileToRemove));
    };

    const handleDeploy = async () => {
        if (selectedFiles.length === 0) return;
        setUploading(true);
        setUploadResults([]);

        const results = [];
        for (const file of selectedFiles) {
            try {
                const formData = new FormData();
                formData.append('file', file);

                // Pass username for description enrichment
                const username = user?.userData?.response?.userlist?.[0]?.displayName || 'Unknown';

                await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ai/optimization/quests`,
                    formData,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        params: {
                            tenantUrl: user.tenantUrl,
                            token: user.token,
                            username: username
                        }
                    }
                );

                results.push({
                    name: file.name,
                    status: 'success',
                    message: 'Optimization Quest deployed successfully'
                });
            } catch (error) {
                console.error(`Optimization Quest upload failed for ${file.name}:`, error);
                results.push({
                    name: file.name,
                    status: 'error',
                    message: error.response?.data?.error || error.message
                });
            }
        }
        setUploadResults(results);
        setSelectedFiles([]);
        setUploading(false);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true
    });

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Upload className="w-5 h-5 text-infor-red" />
                    Deploy Optimization Quests
                </h3>

                <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${isDragActive ? 'border-infor-red bg-infor-red/10' : 'border-white/10 hover:border-white/20 bg-black/20'}`}>
                    <input {...getInputProps()} />
                    <div className="mb-4 flex justify-center"><Zap className="w-10 h-10 text-yellow-500" /></div>
                    <p className="text-lg font-medium text-white mb-2">{uploading ? 'Deploying...' : 'Drop Optimization Quest Files'}</p>
                    <p className="text-sm text-slate-400">Files will be parsed and deployed to Optimization engine</p>
                </div>

                {/* Selected Files Preview */}
                <AnimatePresence>
                    {selectedFiles.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3"
                        >
                            <h4 className="font-bold text-slate-300">Ready to Deploy</h4>
                            <div className="grid gap-2">
                                {selectedFiles.map((file, idx) => (
                                    <motion.div
                                        key={`${file.name}-${idx}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileJson className="w-4 h-4 text-yellow-500" />
                                            <span className="text-sm text-slate-200">{file.name}</span>
                                            <span className="text-xs text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
                                        </div>
                                        <button
                                            onClick={() => removeFile(file)}
                                            className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-red-400 transition-colors"
                                        >
                                            <Zap className="w-4 h-4 rotate-45" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={handleDeploy}
                                    disabled={uploading}
                                    className="px-6 py-2 bg-infor-red hover:bg-[#b00029] text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/40 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                                            Deploying...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4" />
                                            Deploy {selectedFiles.length} item(s)
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Upload Results */}
                {uploadResults.length > 0 && (
                    <div className="grid gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                        {uploadResults.map((res, i) => (
                            <div key={i} className={`p-4 rounded-xl border flex justify-between items-center ${res.status === 'success' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                <span className={`font-bold ${res.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>{res.name}</span>
                                <span className="text-xs text-slate-400">{res.message}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};


const CustomAlgorithmTab = () => {
    const { user } = useAuth();
    const [codeFiles, setCodeFiles] = useState([]);
    const [hyperparamFiles, setHyperparamFiles] = useState([]);

    const [pythonVersion, setPythonVersion] = useState('3.12');
    const [creating, setCreating] = useState(false);
    const [creationResults, setCreationResults] = useState([]);

    const [deployNames, setDeployNames] = useState('');
    const [deploying, setDeploying] = useState(false);
    const [deployResults, setDeployResults] = useState(null);

    const handleDeploy = async () => {
        setDeploying(true);
        setDeployResults(null);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ai/custom-algorithms/deploy`,
                { customAlgorithmNames: deployNames },
                {
                    params: {
                        tenantUrl: user.tenantUrl,
                        token: user.token
                    }
                }
            );
            setDeployResults(response.data);
        } catch (error) {
            console.error("Deploy Failed:", error);
        } finally {
            setDeploying(false);
        }
    };

    // Code Dropzone
    const onDropCode = (acceptedFiles) => setCodeFiles(previous => [...previous, ...acceptedFiles]);
    const { getRootProps: getCodeRoot, getInputProps: getCodeInput, isDragActive: isCodeDrag } = useDropzone({
        onDrop: onDropCode,
        accept: { 'application/zip': ['.zip'] }
    });

    const removeCodeFile = (fileToRemove) => {
        setCodeFiles(prev => prev.filter(f => f !== fileToRemove));
    };

    // Hyperparams Dropzone
    const onDropHyper = (acceptedFiles) => setHyperparamFiles(previous => [...previous, ...acceptedFiles]);
    const { getRootProps: getHyperRoot, getInputProps: getHyperInput, isDragActive: isHyperDrag } = useDropzone({
        onDrop: onDropHyper,
        accept: { 'text/csv': ['.csv'], 'application/vnd.ms-excel': ['.csv'] }
    });

    const removeHyperFile = (fileToRemove) => {
        setHyperparamFiles(prev => prev.filter(f => f !== fileToRemove));
    };

    const handleCreate = async () => {
        setCreating(true);
        setCreationResults([]);
        const results = [];

        try {
            // We iterate over CODE files (Zip), creating an algorithm for each
            for (const zipFile of codeFiles) {
                const algoName = zipFile.name.substring(0, zipFile.name.lastIndexOf('.')) || zipFile.name;
                const hyperFile = hyperparamFiles[0]; // Use the first hyperparam file as generic, or match if desired
                const hyperName = hyperFile ? hyperFile.name : 'Hyperparameters.csv';

                const logStart = { name: algoName, steps: [] };

                try {
                    // CALCULATE UNCOMPRESSED SIZE WITH JSZIP
                    let uncompressedSize = 0;
                    try {
                        const zip = new JSZip();
                        const loadedZip = await zip.loadAsync(zipFile);
                        loadedZip.forEach((relativePath, zipEntry) => {
                            uncompressedSize += zipEntry._data.uncompressedSize;
                        });
                        console.log(`[Debug] ${algoName}: Zip Size=${zipFile.size}, Uncompressed=${uncompressedSize}`);
                    } catch (zipError) {
                        console.error("Failed to read zip headers:", zipError);
                        // Fallback to file size if zip read fails
                        uncompressedSize = zipFile.size;
                    }

                    // 1. Create Algorithm Metadata
                    logStart.steps.push({ step: 'Metadata', status: 'pending' });
                    const metadataPayload = {
                        zipFileName: zipFile.name,
                        csvFileName: hyperName,
                        pythonVersion: pythonVersion
                    };

                    await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ai/custom-algorithms`, metadataPayload, {
                        params: {
                            tenantUrl: user.tenantUrl,
                            token: user.token,
                            username: user?.userData?.response?.userlist?.[0]?.displayName || 'Unknown' // Pass username
                        }
                    });
                    logStart.steps.find(s => s.step === 'Metadata').status = 'success';

                    // 2. Upload Code (Zip)
                    logStart.steps.push({ step: 'Code Upload', status: 'pending' });
                    const codeFormData = new FormData();
                    codeFormData.append('file', zipFile);

                    await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ai/custom-algorithms/upload-code`, codeFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        params: {
                            tenantUrl: user.tenantUrl,
                            token: user.token,
                            customAlgorithmName: algoName,
                            totalSize: uncompressedSize, // SEND UNCOMPRESSED SIZE
                            chunkSize: uncompressedSize, // Assuming 1 chunk = total uncompressed? Or should this be zip size? Actually usually chunk size is upload size. Warning: API might be tricky here. I will send uncompressed for both as requested.
                            chunkNumber: 1,
                            totalChunksNumber: 1,
                            fileName: zipFile.name,
                            encoding: 'identity'
                        }
                    });
                    logStart.steps.find(s => s.step === 'Code Upload').status = 'success';

                    // Add delay to prevent race conditions/locking
                    console.log("Waiting 5 seconds before uploading hyperparameters...");
                    await new Promise(resolve => setTimeout(resolve, 5000));

                    // 3. Upload Hyperparameters (CSV)
                    if (hyperFile) {
                        logStart.steps.push({ step: 'Hyperparams Upload', status: 'pending' });
                        const hyperFormData = new FormData();
                        hyperFormData.append('file', hyperFile);

                        await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ai/custom-algorithms/upload-hyperparams`, hyperFormData, {
                            headers: { 'Content-Type': 'multipart/form-data' },
                            params: {
                                tenantUrl: user.tenantUrl,
                                token: user.token,
                                customAlgorithmName: algoName,
                                mimeType: 'application/csv',
                                fileName: hyperFile.name
                            }
                        });
                        logStart.steps.find(s => s.step === 'Hyperparams Upload').status = 'success';
                    }

                    results.push({ ...logStart, success: true, message: 'Process Complete' });

                } catch (error) {
                    console.error(`Error processing ${algoName}:`, error);
                    const currentStep = logStart.steps.find(s => s.status === 'pending');
                    if (currentStep) currentStep.status = 'error';
                    results.push({ ...logStart, success: false, message: error.response?.data?.error || error.message });
                }

                // Update results incrementally
                setCreationResults([...results]);
            }

            // Auto-populate deploy input with successfully created algorithms
            const successfulAlgos = results.filter(r => r.success).map(r => r.name);
            if (successfulAlgos.length > 0) {
                setDeployNames(prev => {
                    const existing = prev ? prev.split(',').map(s => s.trim()).filter(Boolean) : [];
                    const newNames = successfulAlgos.filter(n => !existing.includes(n));
                    return [...existing, ...newNames].join(', ');
                });
            }

        } catch (error) {
            console.error("General Creation Error:", error);
        } finally {
            setCreating(false);
            // Don't clear files immediately on error, but maybe on success? 
            // The original logic didn't clear. I will leave it as is for now unless requested.
            // Actually, usually users want to clear after success.
            // But here we might have partial success. 
            // I'll leave clearing to the user or a separate "Clear" button if needed, but for now just replacing the display logic.
            // Actually, I should probably clear if all successful? 
            // I will keep behavior simple: just add removing capability.
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-infor-red" />
                        Create Custom Algorithm
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* 1. Code Dropzone */}
                        <div {...getCodeRoot()} className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${isCodeDrag ? 'border-infor-red bg-infor-red/10' : 'border-white/10 hover:border-white/20 bg-black/20'}`}>
                            <input {...getCodeInput()} />
                            <div className="mb-2 flex justify-center"><FileJson className="w-8 h-8 text-blue-400" /></div>
                            <p className="text-sm font-medium text-white mb-1">Algorithm Code (.zip)</p>
                            <p className="text-xs text-slate-400">Drag multiple files here</p>
                            {codeFiles.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2 justify-center">
                                    {codeFiles.map((f, i) => (
                                        <div key={i} className="flex items-center gap-1 bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                                            <span className="text-xs">{f.name}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeCodeFile(f); }}
                                                className="hover:text-white"
                                            >
                                                <XCircle className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 2. Hyperparams Dropzone */}
                        <div {...getHyperRoot()} className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${isHyperDrag ? 'border-infor-red bg-infor-red/10' : 'border-white/10 hover:border-white/20 bg-black/20'}`}>
                            <input {...getHyperInput()} />
                            <div className="mb-2 flex justify-center"><Database className="w-8 h-8 text-yellow-400" /></div>
                            <p className="text-sm font-medium text-white mb-1">Hyperparameters (.csv)</p>
                            <p className="text-xs text-slate-400">Drag generic file here</p>
                            {hyperparamFiles.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2 justify-center">
                                    {hyperparamFiles.map((f, i) => (
                                        <div key={i} className="flex items-center gap-1 bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                                            <span className="text-xs">{f.name}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeHyperFile(f); }}
                                                className="hover:text-white"
                                            >
                                                <XCircle className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Python Version</label>
                        <input
                            type="text"
                            value={pythonVersion}
                            onChange={(e) => setPythonVersion(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-infor-red/50"
                        />
                    </div>

                    <button
                        onClick={handleCreate}
                        disabled={creating || codeFiles.length === 0}
                        className="w-full py-3 bg-infor-red hover:bg-[#b00029] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-infor-red/20 flex items-center justify-center gap-2"
                    >
                        {creating ? <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <BrainCircuit className="w-5 h-5" />}
                        {creating ? `Processing ${codeFiles.length} Algorithms...` : 'Create Algorithms'}
                    </button>

                    {/* Results Log */}
                    {creationResults.length > 0 && (
                        <div className="mt-6 space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                            {creationResults.map((res, i) => (
                                <div key={i} className={`p-4 rounded-xl border ${res.success ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className={`font-bold ${res.success ? 'text-green-400' : 'text-red-400'}`}>{res.name}</h4>
                                        <span className="text-xs text-slate-400">{res.message}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {res.steps.map((s, j) => (
                                            <span key={j} className={`text-xs px-2 py-1 rounded ${s.status === 'success' ? 'bg-green-500/20 text-green-300' : s.status === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-slate-700 text-slate-300'}`}>
                                                {s.step}: {s.status}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Deploy Section */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Rocket className="w-5 h-5 text-infor-red" />
                        Deploy Custom Algorithm
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Algorithm Names (comma separated)</label>
                            <FileDropInput
                                value={deployNames}
                                onChange={setDeployNames}
                                placeholder="e.g. Algo1, Algo2..."
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={handleDeploy}
                                disabled={deploying || !deployNames.trim()}
                                className="px-6 py-3 bg-infor-red hover:bg-[#b00029] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-infor-red/20 flex items-center gap-2"
                            >
                                {deploying ? <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <Rocket className="w-5 h-5" />}
                                {deploying ? 'Deploying...' : 'Deploy'}
                            </button>
                        </div>
                    </div>

                    {/* Deploy Results */}
                    {deployResults && (
                        <div className="mt-6 space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                            {deployResults.results && deployResults.results.map((res, i) => (
                                <div key={i} className={`p-4 rounded-xl border ${res.status === 'success' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                    <div className="flex items-center justify-between">
                                        <h4 className={`font-bold ${res.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>{res.name}</h4>
                                        <span className="text-xs text-slate-400">{res.message || (res.status === 'success' ? 'Deployed Successfully' : 'Failed')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ArtificialIntelligence = () => {
    const [activeTab, setActiveTab] = useState('datasets');

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-infor-red/10 ring-1 ring-infor-red/20">
                            <BrainCircuit className="w-8 h-8 text-infor-red" />
                        </div>
                        Artificial Intelligence
                    </h1>
                    <p className="text-slate-400 mt-2">Manage datasets, complete quests, and deploy custom algorithms.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 w-fit">
                <AITab
                    active={activeTab === 'datasets'}
                    onClick={() => setActiveTab('datasets')}
                    icon={Database}
                    label="Datasets"
                />
                <AITab
                    active={activeTab === 'algorithm'}
                    onClick={() => setActiveTab('algorithm')}
                    icon={Code2}
                    label="Custom Algorithm"
                />
                <AITab
                    active={activeTab === 'quests'}
                    onClick={() => setActiveTab('quests')}
                    icon={Sword}
                    label="Quests"
                />
                <AITab
                    active={activeTab === 'optimization'}
                    onClick={() => setActiveTab('optimization')}
                    icon={Zap}
                    label="Optimization"
                />
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="min-h-[400px]"
                >
                    {activeTab === 'datasets' && <DatasetsTab />}
                    {activeTab === 'quests' && <QuestsTab />}
                    {activeTab === 'algorithm' && <CustomAlgorithmTab />}
                    {activeTab === 'optimization' && <OptimizationTab />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default ArtificialIntelligence;
