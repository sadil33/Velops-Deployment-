import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Button = ({ onClick, children, loading = false, disabled = false }) => {
    return (
        <motion.button
            whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
            whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
        relative overflow-hidden w-full px-6 py-3.5 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/20
        transition-all duration-300
        ${disabled || loading
                    ? 'bg-slate-400 cursor-not-allowed opacity-80'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/40 hover:from-blue-500 hover:to-indigo-500'}
      `}
        >
            <div className="flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                <span>{children}</span>
            </div>
        </motion.button>
    );
};

export default Button;
