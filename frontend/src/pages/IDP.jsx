import React from 'react';
import { motion } from 'framer-motion';
import { FileSearch, Construction } from 'lucide-react';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const IDP = () => {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 font-sans"
        >
            <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg shadow-cyan-500/30">
                    <FileSearch className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Intelligent Document Processing</h1>
                    <p className="text-slate-400 font-medium text-lg">Automate document data extraction</p>
                </div>
            </div>

            <motion.div variants={item} className="glass-panel rounded-3xl p-12 flex flex-col items-center justify-center text-center min-h-[400px] border border-white/10 bg-slate-900/40">
                <div className="p-6 bg-white/5 rounded-full mb-6 relative">
                    <Construction className="w-16 h-16 text-slate-500" />
                    <div className="absolute inset-0 bg-slate-500/20 blur-xl rounded-full -z-10 animate-pulse"></div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
                <p className="text-slate-400 max-w-md mx-auto">
                    The IDP dashboard is currently under development. Check back soon for updates.
                </p>
            </motion.div>
        </motion.div>
    );
};

export default IDP;
