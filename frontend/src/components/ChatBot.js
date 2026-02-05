import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Bot } from 'lucide-react';
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
            setMessages(prev => [...prev, { text: text, sender: 'user' }]);
        }

        setInput('');
        setLoading(true);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

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
                { text: data.text, sender: 'bot', options: data.options || [] }
            ]);
        } catch (error) {
            console.error("Chat Error:", error);
            let errorMsg = "⚠️ I'm having trouble connecting. Please check your internet or try again later.";
            if (error.name === 'AbortError') errorMsg = "⚠️ Request timed out. Server might be busy.";

            setMessages(prev => [...prev, { text: errorMsg, sender: 'bot' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 9999 }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="card shadow-lg border-0 overflow-hidden mb-3"
                        style={{ width: '350px', height: '500px', borderRadius: '20px' }}
                    >
                        {/* Header */}
                        <div className="card-header bg-primary text-white p-3 d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                                <div className="bg-white text-primary rounded-circle p-1">
                                    <Bot size={20} />
                                </div>
                                <h6 className="mb-0 fw-bold">Medisphere AI</h6>
                            </div>
                            <button className="btn btn-link text-white p-0" onClick={() => setIsOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="card-body p-3 bg-light overflow-auto thin-scrollbar" style={{ height: '380px' }}>
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`d-flex mb-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                                    {msg.sender === 'bot' && (
                                        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2 flex-shrink-0" style={{ width: 30, height: 30 }}>
                                            <Bot size={16} />
                                        </div>
                                    )}

                                    <div style={{ maxWidth: '80%' }}>
                                        <div className={`p-3 rounded-4 shadow-sm ${msg.sender === 'user' ? 'bg-primary text-white rounded-bottom-right-0' : 'bg-white text-dark rounded-top-left-0'}`}>
                                            <p className="mb-0 small" style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                                        </div>

                                        {/* Options Chips */}
                                        {msg.sender === 'bot' && msg.options && msg.options.length > 0 && (
                                            <div className="d-flex flex-wrap gap-2 mt-2">
                                                {msg.options.map((opt, i) => (
                                                    <button
                                                        key={i}
                                                        className="btn btn-sm btn-outline-primary rounded-pill small bg-white"
                                                        style={{ fontSize: '0.75rem' }}
                                                        onClick={() => handleSend(opt)}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {msg.sender === 'user' && (
                                        <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center ms-2 flex-shrink-0" style={{ width: 30, height: 30 }}>
                                            <User size={16} />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {loading && (
                                <div className="d-flex justify-content-start mb-3">
                                    <div className="bg-white p-3 rounded-4 rounded-top-left-0 shadow-sm">
                                        <div className="spinner-dots">
                                            <span className="dot"></span>
                                            <span className="dot"></span>
                                            <span className="dot"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="card-footer bg-white p-3 border-top">
                            <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="d-flex gap-2">
                                <input
                                    type="text"
                                    className="form-control rounded-pill bg-light border-0"
                                    placeholder="Type a message..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                />
                                <button type="submit" className="btn btn-primary rounded-circle p-2 d-flex align-items-center justify-content-center" disabled={!input.trim()}>
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            {!isOpen && (
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="btn btn-primary rounded-circle shadow-lg p-0 d-flex align-items-center justify-content-center"
                    style={{ width: '60px', height: '60px' }}
                    onClick={() => setIsOpen(true)}
                >
                    <MessageCircle size={30} />
                </motion.button>
            )}
            <style>
                {`
                .spinner-dots .dot {
                    height: 8px;
                    width: 8px;
                    background-color: #6c757d;
                    border-radius: 50%;
                    display: inline-block;
                    margin: 0 2px;
                    animation: pulse 1s infinite;
                }
                .spinner-dots .dot:nth-child(2) { animation-delay: 0.2s; }
                .spinner-dots .dot:nth-child(3) { animation-delay: 0.4s; }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.5); opacity: 1; }
                    100% { transform: scale(1); opacity: 0.5; }
                }
                `}
            </style>
        </div>
    );
};

export default ChatBot;
