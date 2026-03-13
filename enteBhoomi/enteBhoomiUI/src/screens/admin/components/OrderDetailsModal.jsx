import React, { useState, useEffect } from "react";
import {
    X,
    Users,
    Mail,
    Phone,
    MapPin,
    ShoppingBag,
    Package,
    Check,
    CheckCircle
} from "lucide-react";

const OrderDetailsModal = ({ isOpen, onClose, order, onAcceptItems }) => {
    const [selectedItemIds, setSelectedItemIds] = useState([]);
    const [deliveryDate, setDeliveryDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    const [activeVendorId, setActiveVendorId] = useState(null);

    useEffect(() => {
        if (order?.vendorOrders?.length > 0) {
            setActiveVendorId(order.vendorOrders[0].storeId);
        }
    }, [order, isOpen]);

    if (!isOpen || !order) return null;

    const currentVendorOrder = order.vendorOrders?.find(v => v.storeId === activeVendorId) || order.vendorOrders?.[0];

    const toggleItemSelection = (productId) => {
        setSelectedItemIds(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const handleAccept = () => {
        if (selectedItemIds.length === 0) {
            alert("Please select at least one item to accept.");
            return;
        }
        onAcceptItems(order.id, activeVendorId, selectedItemIds, deliveryDate);
        setSelectedItemIds([]);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 min-h-screen">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Order Details</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">ID: {order.orderDisplayId}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-[#14532D]`}>
                                {order.status}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all hover:rotate-90">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* Main Info Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 border-b border-gray-50 bg-gray-50/30">
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                                <Users size={16} className="text-[#14532D]" /> Customer Information
                            </h4>
                            <div className="space-y-1">
                                <p className="font-bold text-gray-900 text-lg">{order.customerName}</p>
                                {order.userDetails?.email && <p className="text-sm text-gray-500 font-medium flex items-center gap-2"><Mail size={14} /> {order.userDetails.email}</p>}
                                {order.userDetails?.phoneNumber && <p className="text-sm text-gray-500 font-medium flex items-center gap-2"><Phone size={14} /> {order.userDetails.phoneNumber}</p>}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                                <MapPin size={16} className="text-[#14532D]" /> Delivery Address
                            </h4>
                            <p className="text-sm text-gray-600 font-medium leading-relaxed bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                {order.address}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                                <ShoppingBag size={16} className="text-[#14532D]" /> Payment & Status
                            </h4>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Amount</span>
                                    <span className="text-lg font-black text-[#14532D]">{order.amount}</span>
                                </div>
                                {order.paymentMethod && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-400 uppercase text-nowrap">Method</span>
                                        <span className="text-xs font-black text-gray-700 bg-gray-100 px-2 py-1 rounded-lg uppercase">{order.paymentMethod}</span>
                                    </div>
                                )}
                                {order.paymentStatus && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Payment</span>
                                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${order.paymentStatus === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {order.paymentStatus}
                                        </span>
                                    </div>
                                )}
                                {order.transportMode && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-400 uppercase text-nowrap">Transport</span>
                                        <span className="text-xs font-black text-[#14532D] bg-emerald-50 px-2 py-1 rounded-lg uppercase border border-emerald-100">{order.transportMode}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Vendors and Items Section */}
                    <div className="p-8 space-y-8">
                        {order.vendorOrders?.length > 1 && (
                            <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
                                {order.vendorOrders.map(vo => (
                                    <button
                                        key={vo.storeId}
                                        onClick={() => {
                                            setActiveVendorId(vo.storeId);
                                            setSelectedItemIds([]);
                                        }}
                                        className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border whitespace-nowrap ${activeVendorId === vo.storeId ? 'bg-[#14532D] text-white border-[#14532D] shadow-lg shadow-emerald-100' : 'bg-white text-gray-500 border-gray-100 hover:border-[#61CE70]'}`}
                                    >
                                        {vo.storeName} ({vo.vendorStatus})
                                    </button>
                                ))}
                            </div>
                        )}

                        {currentVendorOrder && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center justify-between">
                                    <h4 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-widest">
                                        <Package size={18} className="text-[#14532D]" /> Vendor Items: <span className="text-[#14532D]">{currentVendorOrder.storeName}</span>
                                    </h4>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${currentVendorOrder.vendorStatus === 'Accepted' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                        {currentVendorOrder.vendorStatus}
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {/* Normal Items Section */}
                                    {currentVendorOrder.items?.some(i => !i.isBulk) && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between px-1">
                                                <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Non-Bulk Items {order.paymentMethod === 'RAZORPAY' ? ' (Razorpay)' : ' (Purchase Order)'}</h5>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {currentVendorOrder.items?.filter(i => !i.isBulk).map((item, idx) => {
                                                    const status = (item.status || 'Pending').toLowerCase();
                                                    const isSelectable = status === 'pending';
                                                    const productId = item.productId?._id || item.productId;
                                                    const isSelected = selectedItemIds.includes(productId);

                                                    return (
                                                        <div
                                                            key={`reg-${idx}`}
                                                            onClick={() => isSelectable && toggleItemSelection(productId)}
                                                            className={`group flex items-center gap-4 p-4 rounded-3xl border transition-all ${isSelected ? 'border-[#14532D] bg-emerald-50/30' : 'border-gray-100 bg-white hover:border-[#61CE70]'} ${isSelectable ? 'cursor-pointer' : 'opacity-75'}`}
                                                        >
                                                            {isSelectable && (
                                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${isSelected ? 'bg-[#14532D] border-[#14532D]' : 'border-gray-200'}`}>
                                                                    {isSelected && <Check size={14} className="text-white" />}
                                                                </div>
                                                            )}
                                                            <div className="w-14 h-14 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                                                                {item.productId?.images?.[0] ? (
                                                                    <img src={item.productId.images[0]} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={20} /></div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h5 className="font-bold text-gray-900 truncate text-sm">{item.productName}</h5>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Qty: {item.quantity} × ₹{item.price}</p>
                                                                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${status === 'accepted' ? 'bg-green-100 text-green-600' : status === 'pending' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                                                                    {item.status || 'Pending'}
                                                                </span>
                                                            </div>
                                                            <p className="font-black text-gray-900 text-sm">₹{item.quantity * item.price}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Bulk Items Section */}
                                    {currentVendorOrder.items?.some(i => i.isBulk) && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between px-1">
                                                <h5 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Bulk Enquiries (Purchase Order)</h5>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {currentVendorOrder.items?.filter(i => i.isBulk).map((item, idx) => {
                                                    const status = (item.status || 'Pending').toLowerCase();
                                                    const isSelectable = status === 'pending';
                                                    const productId = item.productId?._id || item.productId;
                                                    const isSelected = selectedItemIds.includes(productId);

                                                    return (
                                                        <div
                                                            key={`bulk-${idx}`}
                                                            onClick={() => isSelectable && toggleItemSelection(productId)}
                                                            className={`group flex items-center gap-4 p-4 rounded-3xl border border-orange-100 bg-orange-50/10 transition-all ${isSelected ? 'border-[#14532D] bg-emerald-50/30' : 'hover:border-orange-300'} ${isSelectable ? 'cursor-pointer' : 'opacity-75'}`}
                                                        >
                                                            {isSelectable && (
                                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${isSelected ? 'bg-[#14532D] border-[#14532D]' : 'border-gray-200'}`}>
                                                                    {isSelected && <Check size={14} className="text-white" />}
                                                                </div>
                                                            )}
                                                            <div className="w-14 h-14 bg-orange-50 rounded-2xl overflow-hidden flex-shrink-0 border border-orange-100">
                                                                {item.productId?.images?.[0] ? (
                                                                    <img src={item.productId.images[0]} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-orange-200"><Package size={20} /></div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h5 className="font-bold text-gray-900 truncate text-sm">{item.productName}</h5>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Qty: {item.quantity} × ₹{item.price}</p>
                                                                <div className="flex gap-2">
                                                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${status === 'accepted' ? 'bg-green-100 text-green-600' : status === 'pending' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                                                                        {item.status || 'Pending'}
                                                                    </span>
                                                                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-orange-100 text-orange-600">
                                                                        BULK
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <p className="font-black text-gray-900 text-sm">₹{item.quantity * item.price}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6 pointer-events-auto">
                    <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
                        {selectedItemIds.length > 0 && (
                            <>
                                <div className="flex flex-col gap-1 w-full sm:w-44">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Target Delivery</label>
                                    <input
                                        type="date"
                                        value={deliveryDate}
                                        onChange={(e) => setDeliveryDate(e.target.value)}
                                        className="px-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-xs font-black focus:border-emerald-500 outline-none shadow-sm transition-all"
                                    />
                                </div>
                                <button
                                    onClick={handleAccept}
                                    className="w-full sm:w-auto px-10 py-3.5 bg-[#14532D] text-white font-black rounded-2xl hover:bg-[#064E3B] transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 hover:translate-y-[-1px] active:translate-y-[1px]"
                                >
                                    <CheckCircle size={20} />
                                    Accept {selectedItemIds.length} Items
                                </button>
                            </>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-10 py-3.5 bg-white border-2 border-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-50 transition-all uppercase tracking-widest text-[10px]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
