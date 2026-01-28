import React from 'react';
import { motion } from 'framer-motion';
import { AlertOctagon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen animated-bg flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full text-center"
            >
                <div className="inline-flex items-center justify-center p-6 bg-red-500/20 rounded-full mb-6 relative">
                    <AlertOctagon className="w-16 h-16 text-red-500" />
                    <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full -z-10 animate-pulse"></div>
                </div>

                <h1 className="text-6xl font-black text-white mb-2">404</h1>
                <h2 className="text-2xl font-bold text-slate-300 mb-6">Page Not Found</h2>

                <p className="text-slate-400 mb-8">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    <br />
                    <span className="text-red-400 text-sm mt-2 block">(Or access was denied)</span>
                </p>

                <button
                    onClick={() => window.location.href = '/'}
                    className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all border border-white/10"
                >
                    Return Home
                </button>
            </motion.div>
        </div>
    );
};

export default NotFound;
