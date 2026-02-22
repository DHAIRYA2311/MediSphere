import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, Filter, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';

const DataTable = ({
    columns,
    data,
    searchable = true,
    title,
    keyField = 'id',
    actions,
    defaultSortKey = null,
    defaultSortDirection = 'asc'
}) => {
    const [sortConfig, setSortConfig] = useState({ key: defaultSortKey, direction: defaultSortDirection });
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    // Sorting
    const sortedData = useMemo(() => {
        let sortableItems = [...data];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [data, sortConfig]);

    // Filtering
    const filteredData = useMemo(() => {
        return sortedData.filter(item => {
            return Object.values(item).some(val =>
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
    }, [sortedData, searchTerm]);

    // Pagination
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const paginatedData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="card-enterprise border-0 shadow-sm">
            {/* Header */}
            <div className="p-4 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <h5 className="fw-bold mb-0 text-dark">{title}</h5>

                <div className="d-flex gap-2 w-100 w-md-auto">
                    {searchable && (
                        <div className="position-relative flex-grow-1">
                            <Search size={16} className="position-absolute text-muted" style={{ top: '50%', transform: 'translateY(-50%)', left: '12px' }} />
                            <input
                                type="text"
                                className="form-control bg-light border-0 ps-5"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    )}
                    <button className="btn btn-light border-0 d-flex align-items-center gap-2">
                        <Filter size={16} /> <span className="d-none d-sm-inline">Filter</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
                <table className="table table-custom mb-0">
                    <thead className="bg-light">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    onClick={() => col.sortable && requestSort(col.key)}
                                    style={{ cursor: col.sortable ? 'pointer' : 'default' }}
                                    className="text-nowrap"
                                >
                                    <div className="d-flex align-items-center gap-1">
                                        {col.label}
                                        {col.sortable && sortConfig.key === col.key && (
                                            sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                        )}
                                    </div>
                                </th>
                            ))}
                            {actions && <th className="text-end">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row, index) => (
                                <tr key={row[keyField] || index} className="align-middle">
                                    {columns.map((col) => (
                                        <td key={`${row[keyField]}-${col.key}`}>
                                            {col.render ? col.render(row) : row[col.key]}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="text-end">
                                            <div className="dropdown">
                                                <button className="btn btn-link text-muted p-0" data-bs-toggle="dropdown">
                                                    <MoreHorizontal size={20} />
                                                </button>
                                                <ul className="dropdown-menu dropdown-menu-end border-0 shadow">
                                                    {actions.map((action, idx) => (
                                                        <li key={idx}>
                                                            <button
                                                                className={`dropdown-item d-flex align-items-center gap-2 ${action.className || ''}`}
                                                                onClick={() => action.onClick(row)}
                                                            >
                                                                {action.icon && <action.icon size={16} />}
                                                                {action.label}
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-5 text-muted">
                                    No data found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer / Pagination */}
            <div className="p-3 border-top d-flex justify-content-between align-items-center">
                <small className="text-muted">
                    Showing {Math.min((page - 1) * rowsPerPage + 1, filteredData.length)} to {Math.min(page * rowsPerPage, filteredData.length)} of {filteredData.length} entries
                </small>
                <div className="btn-group">
                    <button
                        className="btn btn-outline-light text-dark border"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        Previous
                    </button>
                    <button
                        className="btn btn-outline-light text-dark border"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataTable;
