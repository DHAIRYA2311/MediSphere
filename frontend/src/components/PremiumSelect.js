import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PremiumSelect = ({ label, options, value, onChange, name, placeholder = "Select option...", disabled = false, dark = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value) || null;

    const handleSelect = (optionValue) => {
        if (disabled) return;
        onChange({ target: { name, value: optionValue } });
        setIsOpen(false);
    };

    return (
        <div className={`premium-select-container flex-grow-1 ${disabled ? 'opacity-50' : ''} ${dark ? 'dark-mode' : ''}`} ref={containerRef} style={{ position: 'relative' }}>
            {label && <label className={`form-label ${dark ? 'text-white-50 small fw-bold' : ''}`}>{label}</label>}

            <button
                type="button"
                className={`form-control d-flex align-items-center justify-content-between ${isOpen ? 'active' : ''} ${dark ? 'bg-dark bg-opacity-50 text-white border-secondary' : 'bg-light border-0'}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                style={{ cursor: disabled ? 'not-allowed' : 'pointer', textAlign: 'left', minHeight: '45px' }}
            >
                <span className={!selectedOption ? (dark ? 'text-white-50' : 'text-muted') : ''}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    size={18}
                    className={`${dark ? 'text-secondary' : 'text-primary'} transition-all ${isOpen ? 'rotate-180' : ''}`}
                    style={{ transition: 'transform 0.3s ease' }}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 5, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`premium-select-dropdown shadow-lg border-0 rounded-4 ${dark ? 'bg-dark border border-secondary' : 'bg-white'}`}
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            zIndex: 1050,
                            background: dark ? '#1e293b' : 'white',
                            overflow: 'hidden',
                            marginTop: '4px'
                        }}
                    >
                        <div className="p-2" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                            {options.map((option) => (
                                <div
                                    key={option.value}
                                    className={`premium-select-item d-flex align-items-center justify-content-between p-2 px-3 rounded-3 mb-1 ${value === option.value
                                        ? (dark ? 'bg-primary text-white' : 'bg-primary bg-opacity-10 text-primary fw-bold')
                                        : (dark ? 'text-white-50' : 'text-dark')
                                        }`}
                                    onClick={() => handleSelect(option.value)}
                                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                >
                                    <span>{option.label}</span>
                                    {value === option.value && <Check size={16} />}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <style>{`
                .premium-select-item:hover {
                    background: ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'};
                    color: ${dark ? '#fff' : '#000'} !important;
                }
            `}</style>
        </div>
    );
};

export default PremiumSelect;
