import React, { useState } from "react";
import {
    Plus,
    Download,
    Search,
    Layers,
    Clock,
    ShoppingBag,
    PowerOff,
    Power,
    Eye,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

const TableView = ({
    title,
    data,
    columns,
    dataKeys,
    onAdd,
    onEdit,
    onDelete,
    onViewDetails,
    onFetchShipping,
    onToggleAvailability,
    onSearchChange,
    searchTerm,
    getStatusBadge,
    statusKey,
    filterCategories,
    activeCategory,
    onCategoryChange,
    showStatusFilter,
    activeStatus,
    onStatusChange,
    showDateFilter,
    dateFilterValue,
    onDateFilterChange,
    onUpdateStoreStatus,
    isImageTable = false,
    showExport = false,
    customActions,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const exportToCSV = () => {
        if (!data || data.length === 0) return;
        const headers = dataKeys.join(",");
        const rows = data.map(item =>
            dataKeys.map(key => {
                let val = item[key];
                if (typeof val === 'string') val = `"${val.replace(/"/g, '""')}"`;
                return val;
            }).join(",")
        );
        const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${title.toLowerCase()}_data.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Pagination Logic
    const indexOfLastItem = currentPage * rowsPerPage;
    const indexOfFirstItem = indexOfLastItem - rowsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(data.length / rowsPerPage);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4">
                    {onAdd && (
                        <button
                            onClick={onAdd}
                            className="text-white px-3 py-1.5 text-sm rounded-lg font-medium flex items-center space-x-2"
                            style={{ background: '#61CE70' }}
                            onMouseEnter={(e) => e.target.style.background = '#52b863'}
                            onMouseLeave={(e) => e.target.style.background = '#61CE70'}
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add {title.endsWith('ies') ? title.slice(0, -3) + 'y' : title.slice(0, -1)}</span>
                        </button>
                    )}
                    {showExport && (
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={exportToCSV}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 text-sm rounded-lg font-medium flex items-center space-x-2 border"
                            >
                                <Download className="w-4 h-4" />
                                <span>Export Data</span>
                            </button>
                        </div>
                    )}
                </div>

                {onSearchChange !== undefined && (
                    <div className="relative w-full sm:w-64 lg:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder={`Search by ID, name...`}
                            className="bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 p-2.5 outline-none transition-all shadow-sm"
                        />
                    </div>
                )}
            </div>

            {(filterCategories || showStatusFilter || showDateFilter) && (
                <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-wrap items-center gap-6">
                    {filterCategories && (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <Layers className="w-5 h-5 text-emerald-600" />
                                <span className="text-sm font-bold text-gray-700">Category:</span>
                            </div>
                            <select
                                value={activeCategory}
                                onChange={(e) => onCategoryChange(e.target.value)}
                                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                            >
                                <option value="all">All Categories</option>
                                {filterCategories.map(cat => (
                                    <option key={cat.id || cat._id} value={cat.id || cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {showStatusFilter && (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <Clock className="w-5 h-5 text-emerald-600" />
                                <span className="text-sm font-bold text-gray-700">Status:</span>
                            </div>
                            <select
                                value={activeStatus}
                                onChange={(e) => onStatusChange(e.target.value)}
                                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                <option value="available">Available Only</option>
                                <option value="unavailable">Unavailable Only</option>
                            </select>
                        </div>
                    )}

                    {showDateFilter && (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <Clock className="w-5 h-5 text-emerald-600" />
                                <span className="text-sm font-bold text-gray-700">Date:</span>
                            </div>
                            <input
                                type="date"
                                value={dateFilterValue === "invalid" ? "" : (dateFilterValue || "")}
                                onChange={(e) => {
                                    if (e.target.validity && e.target.validity.badInput) {
                                        onDateFilterChange("invalid");
                                    } else {
                                        onDateFilterChange(e.target.value);
                                    }
                                }}
                                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                            />
                        </div>
                    )}

                    {((activeCategory && activeCategory !== "all") || (activeStatus && activeStatus !== "all") || (dateFilterValue && dateFilterValue !== "")) && (
                        <button
                            onClick={() => {
                                if (onCategoryChange) onCategoryChange("all");
                                if (onStatusChange) onStatusChange("all");
                                if (onDateFilterChange) onDateFilterChange("");
                            }}
                            className="text-xs font-bold text-red-500 hover:text-red-600 underline"
                        >
                            Clear All Filters
                        </button>
                    )}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                {columns.map((c) => (
                                    <th
                                        key={c}
                                        className="text-left py-4 px-6 text-sm font-medium text-gray-700 uppercase tracking-wider"
                                    >
                                        {c}
                                    </th>
                                ))}
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-700 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentItems.map((item) => (
                                <tr key={item.id || item._id} className="hover:bg-gray-50/50 transition-colors">
                                    {dataKeys.map((key) => (
                                        <td
                                            key={`${item.id || item._id}-${key}`}
                                            className="py-4 px-6 text-sm text-gray-600"
                                        >
                                            {key === statusKey ? (
                                                <span className={`${getStatusBadge(item[key])} px-2 py-0.5 rounded-full text-xs font-bold uppercase`}>
                                                    {typeof item[key] === 'boolean' ? (item[key] ? 'Available' : 'Unavailable') : String(item[key])}
                                                </span>
                                            ) : (typeof item[key] === 'string' && (item[key].startsWith('http') || item[key].startsWith('/uploads')) && (item[key].match(/\.(jpeg|jpg|gif|png|webp)$/i) || key.toLowerCase().includes('image') || key.toLowerCase().includes('certificate'))) ? (
                                                <div className="w-12 h-12 rounded-lg overflow-hidden border bg-gray-50 cursor-pointer" onClick={() => window.open(item[key], '_blank')}>
                                                    <img src={item[key]} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            ) : (Array.isArray(item[key]) && item[key].length > 0 && typeof item[key][0] === 'string' && (item[key][0].startsWith('http') || item[key][0].startsWith('/uploads'))) ? (
                                                <div className="flex -space-x-2">
                                                    {item[key].slice(0, 3).map((img, idx) => (
                                                        <div key={idx} className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white bg-gray-50 cursor-pointer shadow-sm" onClick={() => window.open(img, '_blank')}>
                                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                    ))}
                                                    {item[key].length > 3 && (
                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm">
                                                            +{item[key].length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : Array.isArray(item[key]) ? (
                                                item[key].join(", ")
                                            ) : typeof item[key] === 'object' && item[key] !== null ? (
                                                <div className="text-xs space-y-1">
                                                    {Object.entries(item[key]).map(([k, v]) => (
                                                        <div key={k}><span className="font-semibold text-gray-500">{k}:</span> {v?.toString() || 'N/A'}</div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="truncate block max-w-xs">{item[key]}</span>
                                            )}
                                        </td>
                                    ))}
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-2">
                                            {onFetchShipping && (
                                                <button
                                                    onClick={() => onFetchShipping(item)}
                                                    className="p-1.5 hover:bg-purple-50 rounded-lg transition-colors group"
                                                    title="Fetch Shipping Options"
                                                >
                                                    <ShoppingBag className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
                                                </button>
                                            )}

                                            {onToggleAvailability && (
                                                <button
                                                    onClick={() => onToggleAvailability(item.id || item._id)}
                                                    className={`p-1.5 rounded-lg transition-colors group ${item.isAvailable ? 'hover:bg-red-50' : 'hover:bg-green-50'}`}
                                                    title={item.isAvailable ? "Make Unavailable" : "Make Available"}
                                                >
                                                    {item.isAvailable ? (
                                                        <PowerOff className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                                                    ) : (
                                                        <Power className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform" />
                                                    )}
                                                </button>
                                            )}

                                            {onUpdateStoreStatus && (
                                                <div className="flex space-x-1">
                                                    {item.status !== "approved" && (
                                                        <button
                                                            onClick={() => onUpdateStoreStatus(item.id || item._id, "approved")}
                                                            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 text-xs rounded font-medium"
                                                            title="Approve"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => onUpdateStoreStatus(item.id || item._id, "rejected")}
                                                        className={`px-2 py-1 text-xs rounded font-medium transition-colors ${item.status === "approved"
                                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                            : "bg-red-500 hover:bg-red-600 text-white"
                                                            }`}
                                                        title={item.status === "approved" ? "Cannot reject an approved store" : "Reject"}
                                                        disabled={item.status === "approved"}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}

                                            {onViewDetails && (
                                                <button
                                                    onClick={() => onViewDetails(item)}
                                                    className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors group"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                                                </button>
                                            )}

                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(item)}
                                                    disabled={
                                                        item.status === "Cancelled" ||
                                                        item.status === "Pending"
                                                    }
                                                    className={`p-1.5 rounded-lg transition-colors ${item.status === "Cancelled" ||
                                                        item.status === "Pending"
                                                        ? "cursor-not-allowed opacity-50 bg-gray-50"
                                                        : "hover:bg-gray-100 group"
                                                        }`}
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4 text-gray-500 group-hover:scale-110 transition-transform" />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(item)}
                                                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                                                </button>
                                            )}

                                            {customActions && customActions(item)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">Rows per page:</span>
                        <select
                            value={rowsPerPage}
                            onChange={(e) => {
                                setRowsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="bg-white border rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-green-500"
                        >
                            {[5, 10, 25, 50, 100].map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center space-x-6">
                        <span className="text-sm text-gray-600">
                            {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, data.length)} of {data.length}
                        </span>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1 rounded hover:bg-white disabled:opacity-30 border transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-1 rounded hover:bg-white disabled:opacity-30 border transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TableView;
