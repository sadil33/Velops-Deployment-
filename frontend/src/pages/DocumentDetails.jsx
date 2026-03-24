import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { FileText, UploadCloud, Loader2, CheckCircle2, XCircle, Copy, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDocumentContext } from '../context/DocumentContext';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const DocumentDetails = () => {
    const { user } = useAuth();
    const { extractedArguments, isProcessing, processingError, processDocument } = useDocumentContext();

    const [copiedIndex, setCopiedIndex] = useState(null);

    const handleCopy = (text, idx) => {
        const valToCopy = text.includes(':') ? text.split(':').slice(1).join(':').trim() : text;
        navigator.clipboard.writeText(valToCopy);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        await processDocument(acceptedFiles);
    }, [processDocument]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt'],
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg']
        }
    });

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            <div className="flex items-center gap-4 mb-6">
                <div className="px-6 py-2.5 rounded-xl font-bold bg-infor-red text-white shadow-lg shadow-infor-red/20 ring-1 ring-white/20 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Document Details
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                {/* Upload Section */}
                <div className="glass-panel rounded-3xl p-6 shadow-xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
                    <h2 className="text-xl font-bold text-white mb-4">Upload Document for Argument Extraction</h2>

                    {processingError && (
                        <div className="mb-4 p-4 glass-panel text-red-600 rounded-xl border border-red-200/50 bg-red-500/10 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-semibold text-sm">{processingError}</span>
                        </div>
                    )}

                    <div
                        {...getRootProps()}
                        className={`
                            border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
                            flex flex-col items-center justify-center gap-4 min-h-[200px]
                            ${isDragActive ? 'border-infor-red bg-red-500/10 scale-[1.02]' : 'border-white/20 bg-white/5 hover:border-infor-red/50 hover:bg-white/10 shadow-inner'}
                            ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
                        `}
                    >
                        <input {...getInputProps()} />

                        {isProcessing ? (
                            <div className="flex flex-col items-center justify-center gap-3">
                                <Loader2 className="w-10 h-10 text-infor-red animate-spin" />
                                <p className="font-bold text-infor-red text-lg tracking-wide">Analyzing Document...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 mb-4 bg-white/5 text-infor-red rounded-full flex items-center justify-center shadow-lg border border-white/10 shrink-0">
                                    <UploadCloud className="w-8 h-8" />
                                </div>
                                <h3 className="font-bold text-white text-xl mb-2">
                                    {isDragActive ? "Drop the document now" : "Click or drag document here"}
                                </h3>
                                <p className="text-sm text-slate-400 max-w-sm">
                                    Supports PDF, Word Documents, plain text, and images.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Display Arguments Section */}
                {extractedArguments && extractedArguments.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-panel rounded-3xl overflow-hidden shadow-2xl"
                    >
                        <div className="p-8 border-b border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-blue-500/20 text-blue-400 rounded-2xl shadow-inner border border-blue-500/30">
                                    <FileText className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Arguments scoping</h2>
                                    <p className="text-slate-300 font-medium">List of arguments found in the document</p>
                                </div>
                            </div>
                            <div className="text-sm font-bold px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg">
                                {extractedArguments.length} Arguments
                            </div>
                        </div>

                        <div className="p-8 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-blue-500/20 text-blue-300/70 uppercase text-xs tracking-wider">
                                        <th className="p-4 font-bold w-16 text-center">No.</th>
                                        <th className="p-4 font-bold w-1/3">Argument Name</th>
                                        <th className="p-4 font-bold">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {extractedArguments.map((argRaw, idx) => {
                                        // Safety check: ensure arg is a string
                                        const arg = typeof argRaw === 'string' ? argRaw : JSON.stringify(argRaw);
                                        const splitIndex = arg.indexOf(':');
                                        const hasColon = splitIndex !== -1;
                                        const argName = hasColon ? arg.substring(0, splitIndex).trim() : 'Argument';
                                        const argValue = hasColon ? arg.substring(splitIndex + 1).trim() : arg;

                                        return (
                                            <tr
                                                key={idx}
                                                className="border-b border-white/5 hover:bg-blue-500/10 transition-colors duration-200 group"
                                            >
                                                <td className="p-4 text-center text-blue-400 font-medium text-sm">
                                                    {idx + 1}
                                                </td>
                                                <td className="p-4 text-blue-100 font-medium text-sm">
                                                    {argName}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-between gap-3 relative w-full">
                                                        <span className="font-semibold text-sm break-all text-white">{argValue}</span>
                                                        <button
                                                            onClick={() => handleCopy(arg, idx)}
                                                            className="shrink-0 p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 transition-colors border border-blue-500/30 shadow-inner group-hover:opacity-100 opacity-60 md:opacity-100"
                                                            title="Copy Value"
                                                        >
                                                            {copiedIndex === idx ? (
                                                                <Check className="w-4 h-4 text-emerald-400" />
                                                            ) : (
                                                                <Copy className="w-4 h-4 hover:text-white transition-colors" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default DocumentDetails;
