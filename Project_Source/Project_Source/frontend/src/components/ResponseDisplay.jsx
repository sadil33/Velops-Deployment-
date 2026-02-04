import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const ResponseDisplay = ({ data, error }) => {
    if (!data && !error) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full rounded-2xl border overflow-hidden shadow-sm ${error ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'
                }`}
        >
            <div className={`px-5 py-3 border-b flex items-center gap-2 ${error ? 'border-red-100 bg-red-50 text-red-700' : 'border-slate-100 bg-slate-50 text-slate-700'
                }`}>
                {error ? (
                    <AlertCircle className="w-5 h-5" />
                ) : (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
                <h3 className="font-semibold text-sm">
                    {error ? 'Error' : 'API Response'}
                </h3>
            </div>

            <div className="p-0 relative group">
                <pre className={`
          p-5 text-sm font-mono overflow-auto max-h-[500px] custom-scrollbar
          ${error ? 'text-red-600' : 'text-slate-600'}
        `}>
                    {error ? (
                        typeof error === 'object' ? JSON.stringify(error, null, 2) : error
                    ) : (
                        JSON.stringify(data, null, 2)
                    )}
                </pre>
            </div>
        </motion.div>
    );
};

export default ResponseDisplay;
