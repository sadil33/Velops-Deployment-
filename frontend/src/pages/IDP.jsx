import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSearch, Upload, File, XCircle, CheckCircle2, Loader2, Database, Layers } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const IDP = () => {
    const [activeTab, setActiveTab] = useState('import-dpf');

    const tabs = [
        { id: 'import-dpf', label: 'Import DPF', icon: Upload }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 pl-2">
                <div className="p-3 bg-gradient-to-br from-infor-red to-[#b00029] text-white rounded-xl shadow-lg shadow-red-900/40">
                    <FileSearch className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-md">Intelligent Document Processing</h2>
                    <p className="text-slate-400 font-medium">Automate document data extraction and processing</p>
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
                        {activeTab === 'import-dpf' && <ImportDPFTab />}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

const ImportDPFTab = () => {
    const { user } = useAuth();
    const [ver, setVer] = useState('v1');
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadResults, setUploadResults] = useState([]);

    const onDrop = useCallback((acceptedFiles) => {
        if (!acceptedFiles?.length) return;
        setSelectedFiles(prev => [...prev, ...acceptedFiles]);
    }, []);

    const removeFile = (fileToRemove) => {
        setSelectedFiles(prev => prev.filter(f => f !== fileToRemove));
    };

    const handleImport = async () => {
        if (selectedFiles.length === 0) return;
        if (!ver) {
            alert('Please enter a version (ver)');
            return;
        }

        setUploading(true);
        setUploadResults([]);

        try {
            const results = await Promise.all(
                selectedFiles.map(async (file) => {
                    try {
                        const formData = new FormData();
                        formData.append('file', file);

                        await axios.post(
                            `${API_BASE_URL}/api/idp/import-dpf`,
                            formData,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                                params: {
                                    tenantUrl: user.tenantUrl,
                                    token: user.token,
                                    ver: ver
                                }
                            }
                        );

                        return {
                            filename: file.name,
                            status: 'success',
                            message: 'Imported successfully'
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
            setSelectedFiles([]);

        } catch (error) {
            console.error('IDP Import Error:', error);
        } finally {
            setUploading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true
    });

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Version Input */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Version (ver)</label>
                <input
                    type="text"
                    value={ver}
                    onChange={(e) => setVer(e.target.value)}
                    placeholder="e.g. v1"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-infor-red transition-colors"
                />
            </div>

            {/* Drop Zone */}
            <div
                {...getRootProps()}
                className={`
                    p-12 text-center cursor-pointer transition-all duration-300
                    border-2 border-dashed rounded-2xl
                    ${isDragActive
                        ? 'border-infor-red bg-infor-red/10 scale-[1.01]'
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
                            <p className="text-lg font-semibold text-infor-red">Importing files...</p>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-white/5 text-infor-red rounded-full flex items-center justify-center mb-2">
                                <Database className="w-10 h-10" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-200">
                                    {isDragActive ? "Drop files here..." : "Drag & drop DPF files"}
                                </p>
                                <p className="text-sm text-slate-500 mt-2 font-medium">
                                    or click to browse (any file type)
                                </p>
                            </div>
                        </>
                    )}
                </motion.div>
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
                        <h4 className="font-bold text-slate-300">Ready to Import</h4>
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
                                        <File className="w-4 h-4 text-infor-red" />
                                        <span className="text-sm text-slate-200">{file.name}</span>
                                        <span className="text-xs text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
                                    </div>
                                    <button
                                        onClick={() => removeFile(file)}
                                        className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-red-400 transition-colors"
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={handleImport}
                                disabled={uploading}
                                className="px-6 py-2 bg-gradient-to-r from-infor-red to-[#b00029] hover:from-[#d60032] hover:to-[#8a0020] text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/40 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        Import {selectedFiles.length} item(s)
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            <AnimatePresence>
                {uploadResults.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-3"
                    >
                        <h4 className="font-bold text-slate-800">Import Results</h4>
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
                                    <File className={`w-5 h-5 ${result.status === 'success' ? 'text-green-600' : 'text-red-600'}`} />
                                    <div>
                                        <p className={`font-semibold ${result.status === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                                            {result.filename}
                                        </p>
                                        <p className={`text-xs ${result.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
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

export default IDP;
