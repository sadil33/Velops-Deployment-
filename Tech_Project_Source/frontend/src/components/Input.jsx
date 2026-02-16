import { motion } from 'framer-motion';

const Input = ({ label, value, onChange, placeholder, type = "text" }) => {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-slate-700 ml-1">
                {label}
            </label>
            <motion.input
                whileFocus={{ scale: 1.01, borderColor: '#3b82f6' }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-sm 
                   focus:outline-none focus:ring-4 focus:ring-infor-red/20 focus:border-infor-red
                   placeholder:text-slate-500 text-white transition-all duration-200"
            />
        </div>
    );
};

export default Input;
