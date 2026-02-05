import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, UploadCloud, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../components/Button';

const Prerequisites = () => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const { setRequirements } = useAuth();
    const navigate = useNavigate();

    const [extractedRoles, setExtractedRoles] = useState([]);

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        setExtractedRoles([]);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Call our Backend Parsing Endpoint
            const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
            const res = await axios.post(`${apiUrl}/api/parse`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const roles = res.data.roles || [];
            console.log('Parsed Roles:', roles);

            if (roles.length === 0) {
                setError("No security roles were found in this document. Please check the file content.");
            } else {
                setExtractedRoles(roles);
                // Don't auto-navigate, let user review
            }

        } catch (err) {
            console.error(err);
            // Check for specific GenAI failure
            if (err.response?.data?.error === "Extraction failed in genai") {
                setError("Extraction failed in genai");
            } else {
                const msg = err.response?.data?.error || "Failed to parse the file. Please try again.";
                setError(msg);
            }
        } finally {
            setUploading(false);
        }
    }, []);

    const handleProceed = () => {
        setRequirements(extractedRoles);
        navigate('/dashboard');
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt'],
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg']
        },
        maxFiles: 1
    });

    return (
        <div className="min-h-screen animated-bg flex items-center justify-center p-4 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white drop-shadow-lg">Upload Requirements</h1>
                    <p className="text-slate-300 mt-2 font-medium">
                        Upload your requirement document (PDF, DOCX, TXT, Image).
                        <br />Our AI will extract the necessary Security Roles.
                    </p>
                </div>

                <div className="glass-panel rounded-3xl p-8 shadow-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
                    <div
                        {...getRootProps()}
                        className={`
                border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
                flex flex-col items-center justify-center gap-4
                ${isDragActive ? 'border-infor-red bg-red-500/10 scale-[1.01]' : 'border-white/10 bg-white/5 hover:border-infor-red/50 hover:bg-white/10'}
                ${uploading ? 'opacity-50 pointer-events-none' : ''}
              `}
                    >
                        <input {...getInputProps()} />

                        {uploading ? (
                            <>
                                <Loader2 className="w-12 h-12 text-infor-red animate-spin" />
                                <p className="font-bold text-infor-red text-lg">Analyzing Document...</p>
                            </>
                        ) : (
                            <>
                                <div className="w-20 h-20 bg-white/5 text-infor-red rounded-full flex items-center justify-center mb-2 shadow-inner">
                                    <UploadCloud className="w-10 h-10" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-white">
                                        {isDragActive ? "Drop the file here..." : "Drag & drop your file here"}
                                    </p>
                                    <p className="text-sm text-slate-400 mt-2 font-medium">or click to browse</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Results Display */}
                    {extractedRoles.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-6 space-y-4"
                        >
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                Extracted {extractedRoles.length} Roles
                            </h3>
                            <div className="bg-black/30 rounded-xl p-4 max-h-64 overflow-y-auto custom-scrollbar border border-white/10">
                                <ul className="space-y-2">
                                    {extractedRoles.map((role, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-300 p-2 rounded hover:bg-white/5 transition-colors">
                                            <div className="w-1.5 h-1.5 rounded-full bg-infor-red"></div>
                                            <span className="font-mono text-sm">{role}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    )}

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3"
                        >
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span className="font-medium">{error}</span>
                        </motion.div>
                    )}

                    <div className="mt-8 flex justify-end gap-3">
                        {extractedRoles.length > 0 ? (
                            <>
                                <Button
                                    onClick={() => setExtractedRoles([])} // Reset
                                    className="bg-white/10 text-white hover:bg-white/20 border border-white/5"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleProceed}
                                    className="bg-infor-red text-white hover:bg-[#b00029] shadow-lg shadow-red-900/40"
                                >
                                    Proceed to Dashboard
                                </Button>
                            </>
                        ) : (
                            <Button
                                onClick={() => navigate('/dashboard')}
                                disabled={uploading}
                                className="bg-white/10 text-white hover:bg-white/20 border border-white/5"
                            >
                                Skip Step
                            </Button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Prerequisites;

