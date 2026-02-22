import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Bot, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const ChatBot = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const CHAT_API = "http://localhost:5002/chat";

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Initial Greeting
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            handleSend("hello", true);
        }
    }, [isOpen]);

    const handleSend = async (text, isSystemInit = false) => {
        if (!text.trim()) return;

        // Optimistic UI
        if (!isSystemInit) {
            setMessages(prev => [...prev, { text: text, sender: 'user', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        }

        setInput('');
        setLoading(true);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            const userId = user ? user.user_id : 'guest';

            const res = await fetch(CHAT_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, user_id: userId }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!res.ok) throw new Error("Server error");

            const data = await res.json();
            setMessages(prev => [
                ...prev,
                {
                    text: data.text,
                    sender: 'bot',
                    options: data.options || [],
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
        } catch (error) {
            console.error("Chat Error:", error);
            let errorMsg = "⚠️ I'm having trouble connecting. Please check your internet or try again later.";
            if (error.name === 'AbortError') errorMsg = "⚠️ Request timed out. Server might be busy.";

            setMessages(prev => [...prev, { text: errorMsg, sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 9999 }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="card shadow-2xl border-0 overflow-hidden mb-3"
                        style={{
                            width: '380px',
                            height: '580px',
                            borderRadius: '24px',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                            transformOrigin: 'bottom right'
                        }}
                    >
                        {/* Premium Header */}
                        <div style={{
                            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                            padding: '20px',
                            color: 'white',
                            position: 'relative'
                        }}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-3">
                                    <div style={{
                                        width: '45px',
                                        height: '45px',
                                        background: 'rgba(255,255,255,0.2)',
                                        borderRadius: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative'
                                    }}>
                                        <Bot size={24} color="white" />
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '-2px',
                                            right: '-2px',
                                            width: '12px',
                                            height: '12px',
                                            background: '#10b981',
                                            borderRadius: '50%',
                                            border: '2px solid #1e3a8a'
                                        }}></div>
                                    </div>
                                    <div>
                                        <h6 className="mb-0 fw-bold" style={{ letterSpacing: '0.5px' }}>Medisphere AI</h6>
                                        <small style={{ opacity: 0.8, fontSize: '0.75rem' }} className="d-flex align-items-center gap-1">
                                            <Sparkles size={10} /> Always Online
                                        </small>
                                    </div>
                                </div>
                                <button
                                    className="btn btn-link text-white p-2 rounded-circle"
                                    style={{ background: 'rgba(255,255,255,0.1)' }}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Modern Messages Area */}
                        <div className="card-body p-4 bg-light overflow-auto thin-scrollbar" style={{ height: '420px', backgroundColor: '#f8fafc' }}>
                            {messages.map((msg, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={idx}
                                    className={`d-flex mb-4 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                                >
                                    <div style={{ maxWidth: '85%' }}>
                                        <div className={`p-3 shadow-sm ${msg.sender === 'user'
                                            ? 'bg-primary text-white'
                                            : 'bg-white text-dark'
                                            }`} style={{
                                                borderRadius: msg.sender === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                                                boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                                            }}>
                                            <p className="mb-1 small fw-medium" style={{ whiteSpace: 'pre-line', lineHeight: '1.5' }}>{msg.text}</p>
                                            <div className="text-end" style={{ opacity: 0.6, fontSize: '0.65rem' }}>
                                                {msg.time}
                                            </div>
                                        </div>

                                        {/* Premium Option Chips */}
                                        {msg.sender === 'bot' && msg.options && msg.options.length > 0 && (
                                            <div className="d-flex flex-wrap gap-2 mt-3">
                                                {msg.options.map((opt, i) => (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        key={i}
                                                        className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 bg-white"
                                                        style={{
                                                            fontSize: '0.75rem',
                                                            border: '1px solid #e2e8f0',
                                                            color: '#3b82f6',
                                                            boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                                                        }}
                                                        onClick={() => handleSend(opt)}
                                                    >
                                                        {opt}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {loading && (
                                <div className="d-flex justify-content-start mb-3">
                                    <div className="bg-white px-3 py-3 rounded-4 shadow-sm" style={{ borderRadius: '18px 18px 18px 2px' }}>
                                        <div className="loading-dots">
                                            <span></span><span></span><span></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Redesigned Input Area */}
                        <div className="p-3 bg-white border-top">
                            <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="d-flex gap-2">
                                <div className="position-relative flex-grow-1">
                                    <input
                                        type="text"
                                        className="form-control rounded-pill bg-light border-0 py-2 ps-3 pe-5"
                                        style={{ fontSize: '0.9rem', height: '45px' }}
                                        placeholder="Ask Medisphere anything..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        className="btn btn-primary rounded-circle position-absolute top-50 end-0 translate-middle-y me-1 p-0 d-flex align-items-center justify-content-center"
                                        style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
                                        disabled={!input.trim()}
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Premium Pulse Toggle Button */}
            {!isOpen && (
                <div
                    className="position-relative"
                    style={{ cursor: 'pointer', zIndex: 9999 }}
                    onClick={() => { console.log("ChatBot Opening..."); setIsOpen(true); }}
                >
                    <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            borderRadius: '50%',
                            background: '#3b82f6',
                            pointerEvents: 'none',
                            zIndex: 1
                        }}
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn btn-primary rounded-circle shadow-lg p-0 d-flex align-items-center justify-content-center border-0"
                        style={{
                            width: '65px',
                            height: '65px',
                            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                            boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4)',
                            position: 'relative',
                            zIndex: 2,
                            pointerEvents: 'none' // Click handled by parent div
                        }}
                    >
                        <MessageCircle size={32} color="white" />
                    </motion.button>
                </div>
            )}
            <style>
                {`
                .loading-dots span {
                    width: 6px;
                    height: 6px;
                    margin: 0 2px;
                    background: #3b82f6;
                    border-radius: 50%;
                    display: inline-block;
                    animation: bounce 1.4s infinite ease-in-out both;
                }
                .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
                .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1.0); }
                }
                .thin-scrollbar::-webkit-scrollbar { width: 4px; }
                .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .thin-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                `}
            </style>
        </div>
    );
};

export default ChatBot;
