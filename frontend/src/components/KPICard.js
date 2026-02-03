import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const KPICard = ({ title, value, icon: Icon, trend, color, subtext }) => {
    const isPositive = trend > 0;

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="card-enterprise border-0 shadow-sm p-4 h-100 position-relative overflow-hidden"
        >
            <div className="d-flex justify-content-between align-items-start">
                <div>
                    <p className="text-muted fw-bold text-uppercase small mb-2 tracking-wide">{title}</p>
                    <h3 className="fw-bold mb-2 text-dark">{value}</h3>

                    {trend && (
                        <div className={`d-flex align-items-center small ${isPositive ? 'text-success' : 'text-danger'}`}>
                            {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                            <span className="fw-bold ms-1">{Math.abs(trend)}%</span>
                            <span className="text-muted ms-2 fw-normal">vs last month</span>
                        </div>
                    )}
                    {subtext && <p className="text-muted small mb-0 mt-2">{subtext}</p>}
                </div>

                <div className={`rounded-3 p-3 d-flex align-items-center justify-content-center bg-${color} bg-opacity-10 text-${color}`}>
                    <Icon size={24} />
                </div>
            </div>

            {/* Decorative background circle */}
            <div
                className={`position-absolute rounded-circle bg-${color} opacity-10`}
                style={{ width: '100px', height: '100px', right: '-20px', bottom: '-20px', opacity: 0.05 }}
            ></div>
        </motion.div>
    );
};

export default KPICard;
