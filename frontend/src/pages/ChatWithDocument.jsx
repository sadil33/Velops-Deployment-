import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Send, Bot, User, Trash2, FileText, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatWithDocument = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('infor_chat_history');
        return saved ? JSON.parse(saved) : [
            { role: 'system', content: 'Hello! I can answer questions about the document you uploaded in Prerequisites. What would you like to know?' }
        ];
    });

    useEffect(() => {
        localStorage.setItem('infor_chat_history', JSON.stringify(messages));
    }, [messages]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Get auth details from user context
            const { token, tenantUrl } = user || {};

            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/chat`, {
                question: userMessage.content,
                token,
                tenantUrl
            });

            const botMessage = { role: 'system', content: response.data.answer };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Chat Error:', error);
            const errorMessage = error.response?.data?.error || 'Failed to get answer';
            setMessages(prev => [...prev, { role: 'system', content: `Error: ${errorMessage}`, isError: true }]);
        } finally {
            setLoading(false);
        }
    };

    const clearHistory = () => {
        const welcomeMsg = [{ role: 'system', content: 'History cleared. Ready for new questions.' }];
        setMessages(welcomeMsg);
        localStorage.setItem('infor_chat_history', JSON.stringify(welcomeMsg));
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <FileText className="w-8 h-8 text-infor-red" />
                        Chat Assistant
                    </h2>
                    <p className="text-slate-400">Ask questions based on your uploaded requirements.</p>
                </div>
                <button
                    onClick={clearHistory}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                    title="Clear History"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 glass-panel rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl flex flex-col overflow-hidden shadow-2xl">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`
                                max-w-[80%] rounded-2xl p-4 flex gap-3
                                ${msg.role === 'user'
                                    ? 'bg-infor-red text-white'
                                    : msg.isError
                                        ? 'bg-red-500/10 border border-red-500/20 text-red-200'
                                        : 'bg-white/10 text-slate-100 border border-white/5'}
                            `}>
                                <div className="mt-1 shrink-0 opacity-70">
                                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                                </div>
                                <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                            </div>
                        </motion.div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white/5 text-slate-300 rounded-2xl p-4 flex gap-3 border border-white/5">
                                <Bot className="w-5 h-5 animate-bounce" />
                                <span className="italic text-sm">Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/10 bg-white/5">
                    <form onSubmit={handleSend} className="relative flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question about the document..."
                            className="flex-1 bg-slate-950/50 text-white rounded-xl border border-white/10 px-4 py-3 focus:ring-2 focus:ring-infor-red focus:border-transparent outline-none transition-all placeholder:text-slate-500"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="bg-infor-red hover:bg-[#b00029] text-white p-3 rounded-xl transition-all shadow-lg hover:shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatWithDocument;
