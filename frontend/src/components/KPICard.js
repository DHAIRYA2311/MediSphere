import React from 'react';
import { motion } from 'framer-motion';

const KPICard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary' }) => {
    const colorMap = {
        primary: { bg: 'var(--accent)', shadow: 'rgba(94, 170, 181, 0.3)' },
        success: { bg: 'var(--success)', shadow: 'rgba(16, 185, 129, 0.3)' },
        warning: { bg: 'var(--warning)', shadow: 'rgba(245, 158, 11, 0.3)' },
        info: { bg: 'var(--info)', shadow: 'rgba(59, 130, 246, 0.3)' },
        accent: { bg: 'var(--primary)', shadow: 'rgba(26, 58, 74, 0.3)' }
    };

    const colors = colorMap[color] || colorMap.primary;
    const isPositive = trend === 'up';

    return (
        <motion.div
            className="stat-card h-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -4 }}
        >
            {/* Header Row */}
            <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="flex-grow-1">
                    <h6 className="mb-1 fw-semibold" style={{ color: 'var(--text-main)', fontSize: '0.9375rem' }}>
                        {title}
                    </h6>
                    {trendValue && (
                        <span
                            className="badge rounded-pill d-inline-flex align-items-center gap-1"
                            style={{
                                background: isPositive ? 'var(--success-light)' : 'var(--danger-light)',
                                color: isPositive ? 'var(--success)' : 'var(--danger)',
                                border: `1px solid ${isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                fontSize: '0.75rem',
                                padding: '0.25rem 0.625rem'
                            }}
                        >
                            <span>{isPositive ? '↑' : '↓'}</span>
                            <span>{trendValue}</span>
                        </span>
                    )}
                </div>
                {Icon && (
                    <div
                        className="d-flex align-items-center justify-content-center rounded-xl"
                        style={{
                            width: 48,
                            height: 48,
                            background: colors.bg,
                            boxShadow: `0 4px 12px ${colors.shadow}`,
                            color: 'white'
                        }}
                    >
                        <Icon size={22} />
                    </div>
                )}
            </div>

            {/* Value */}
            <div className="mt-2">
                <span
                    className="fw-bold"
                    style={{
                        fontSize: '2rem',
                        color: 'var(--text-main)',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.1
                    }}
                >
                    {value}
                </span>
            </div>
        </motion.div>
    );
};

export default KPICard;
