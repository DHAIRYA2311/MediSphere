import React from 'react';

const Skeleton = ({ className, style }) => {
    return (
        <div
            className={`skeleton ${className || ''}`}
            style={style}
        ></div>
    );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
    return (
        <div className="w-full">
            <div className="d-flex mb-3 gap-2">
                {[...Array(cols)].map((_, i) => (
                    <Skeleton key={i} className="skeleton-title" style={{ width: `${100 / cols}%`, height: '24px' }} />
                ))}
            </div>
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="d-flex mb-2 gap-2">
                    {[...Array(cols)].map((_, j) => (
                        <Skeleton key={j} className="skeleton-text" style={{ width: `${100 / cols}%`, height: '20px' }} />
                    ))}
                </div>
            ))}
        </div>
    );
};

export const CardSkeleton = () => {
    return (
        <div className="card-enterprise p-4">
            <div className="d-flex align-items-center gap-3 mb-3">
                <Skeleton className="skeleton-circle" />
                <div className="flex-grow-1">
                    <Skeleton className="skeleton-title" style={{ width: '60%' }} />
                    <Skeleton className="skeleton-text" style={{ width: '40%' }} />
                </div>
            </div>
            <Skeleton className="skeleton-rect" />
            <div className="d-flex justify-content-between">
                <Skeleton className="skeleton-text" style={{ width: '30%' }} />
                <Skeleton className="skeleton-text" style={{ width: '30%' }} />
            </div>
        </div>
    );
};

export default Skeleton;
