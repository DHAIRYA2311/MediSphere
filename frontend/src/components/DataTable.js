import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileX } from 'lucide-react';

const DataTable = ({
    columns,
    data,
    searchable = true,
    pagination = true,
    pageSize = 10,
    onRowClick,
    actions,
    emptyMessage = "No data available"
}) => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    // Filter data based on search
    const filteredData = data.filter(row =>
        columns.some(col => {
            const value = col.accessor ? row[col.accessor] : '';
            return String(value).toLowerCase().includes(search.toLowerCase());
        })
    );

    // Paginate
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = pagination
        ? filteredData.slice((page - 1) * pageSize, page * pageSize)
        : filteredData;

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, page - 2);
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`btn btn-sm ${page === i ? 'btn-primary' : 'btn-light'}`}
                    style={{
                        minWidth: 36,
                        height: 36,
                        borderRadius: 'var(--radius-lg)',
                        fontWeight: 600,
                        fontSize: '0.875rem'
                    }}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className="fade-in">
            {/* Search Bar */}
            {searchable && (
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="position-relative" style={{ width: '280px' }}>
                        <Search
                            size={16}
                            className="position-absolute"
                            style={{
                                left: '14px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)'
                            }}
                        />
                        <input
                            type="search"
                            className="search-bar"
                            placeholder="Search records..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            style={{ paddingLeft: '42px', width: '100%' }}
                        />
                    </div>
                    <div className="text-muted-custom small">
                        Showing {paginatedData.length} of {filteredData.length} records
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="table-responsive">
                <table className="table table-custom mb-0">
                    <thead>
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} style={col.style || {}}>
                                    {col.header}
                                </th>
                            ))}
                            {actions && <th className="text-end">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row, rowIdx) => (
                                <tr
                                    key={row.id || rowIdx}
                                    onClick={() => onRowClick && onRowClick(row)}
                                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                                    className="hover-lift"
                                >
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} style={col.cellStyle || {}}>
                                            {col.render
                                                ? col.render(row)
                                                : col.accessor
                                                    ? row[col.accessor]
                                                    : null}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="text-end">
                                            <div className="d-flex gap-2 justify-content-end">
                                                {actions.map((action, i) => {
                                                    const ActionIcon = action.icon;
                                                    const className = typeof action.className === 'function' ? action.className(row) : action.className;
                                                    if (className?.includes('d-none')) return null;

                                                    return (
                                                        <button
                                                            key={i}
                                                            className={`btn btn-sm btn-light ${className || 'text-muted'}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                action.onClick(row);
                                                            }}
                                                            title={action.label}
                                                            style={{ width: 32, height: 32, padding: 0, borderRadius: '50%' }}
                                                        >
                                                            {ActionIcon && <ActionIcon size={16} />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-5">
                                    <div className="d-flex flex-column align-items-center">
                                        <div
                                            className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                                            style={{
                                                width: 64,
                                                height: 64,
                                                background: 'var(--bg-glass)',
                                                border: '1px solid var(--border-dark)'
                                            }}
                                        >
                                            <FileX size={28} style={{ color: 'var(--text-muted)' }} />
                                        </div>
                                        <h6 className="fw-semibold mb-1" style={{ color: 'var(--text-main)' }}>
                                            No Records Found
                                        </h6>
                                        <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>
                                            {emptyMessage}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4 pt-3" style={{ borderTop: '1px solid var(--border-dark)' }}>
                    <div className="small" style={{ color: 'var(--text-muted)' }}>
                        Page {page} of {totalPages}
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <button
                            onClick={() => setPage(1)}
                            disabled={page === 1}
                            className="btn btn-light btn-sm"
                            style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)' }}
                        >
                            <ChevronsLeft size={16} />
                        </button>
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="btn btn-light btn-sm"
                            style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)' }}
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {renderPageNumbers()}

                        <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="btn btn-light btn-sm"
                            style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)' }}
                        >
                            <ChevronRight size={16} />
                        </button>
                        <button
                            onClick={() => setPage(totalPages)}
                            disabled={page === totalPages}
                            className="btn btn-light btn-sm"
                            style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)' }}
                        >
                            <ChevronsRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
