import React from "react";
import {
    X,
    Eye,
    Store,
    Users,
    Mail,
    Phone,
    MapPin,
    FileText,
    Sprout
} from "lucide-react";

const StoreDetailModal = ({ isOpen, onClose, store, products }) => {
    if (!isOpen || !store) return null;

    const DetailRow = ({ label, value, icon: Icon }) => (
        <div className="flex items-start gap-3 py-2">
            {Icon && <Icon className="w-5 h-5 text-gray-400 mt-0.5" />}
            <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
                <p className="text-sm text-gray-900">{value || "N/A"}</p>
            </div>
        </div>
    );

    const SectionTitle = ({ title, icon: Icon }) => (
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            {Icon && <Icon className="w-5 h-5 text-emerald-500" />}
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">{title}</h3>
        </div>
    );

    const ImageThumbnail = ({ label, src }) => (
        <div className="space-y-2">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
            {src ? (
                <div
                    className="relative w-32 h-20 rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all"
                    onClick={() => window.open(src, '_blank')}
                >
                    <img src={src} alt={label} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Eye className="w-5 h-5 text-white shadow-sm" />
                    </div>
                </div>
            ) : (
                <div className="w-32 h-20 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center italic text-xs text-gray-400">
                    No image
                </div>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-gray-800 to-gray-900 p-6 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-2xl font-bold">{store.storeName}</h2>
                        <p className="text-gray-300 text-sm">{store.businessName} • {store.ownerName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Left Column: Core Info */}
                        <div className="space-y-8">
                            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <SectionTitle title="Basic Info" icon={Store} />
                                <div className="grid grid-cols-2 gap-6">
                                    <DetailRow label="Store Name" value={store.storeName} icon={Store} />
                                    <DetailRow label="Business Name" value={store.businessName} />
                                    <DetailRow label="Owner Name" value={store.ownerName} icon={Users} />
                                    <DetailRow label="Email Address" value={store.email} icon={Mail} />
                                    <DetailRow label="Mobile Number" value={store.mobileNumber} icon={Phone} />
                                </div>
                            </section>

                            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <SectionTitle title="Location & Address" icon={MapPin} />
                                <DetailRow label="Business Address" value={store.businessAddress} icon={MapPin} />
                            </section>

                            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <SectionTitle title="KYC & Documents" icon={FileText} />
                                <div className="space-y-6">
                                    <DetailRow label="PAN Number" value={store.panNumber} />
                                    <div className="flex flex-wrap gap-6">
                                        <ImageThumbnail label="Aadhaar / License" src={store.aadhaarOrLicenseImage} />
                                        <ImageThumbnail label="FSSAI Certificate" src={store.fssaiCertificate} />
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Right Column: Financial & Inventory */}
                        <div className="space-y-8">
                            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <SectionTitle title="Bank Details" icon={ShoppingBag} />
                                <div className="grid grid-cols-2 gap-6">
                                    <DetailRow label="Account Number" value={store.bankDetails?.accountNumber} />
                                    <DetailRow label="IFSC Code" value={store.bankDetails?.ifscCode} />
                                    <DetailRow label="Branch Name" value={store.bankDetails?.branch} />
                                    <div className="col-span-2">
                                        <ImageThumbnail label="Passbook Image" src={store.bankDetails?.passbookImage} />
                                    </div>
                                </div>
                            </section>

                            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <SectionTitle title="GST Details" icon={FileText} />
                                <div className="grid grid-cols-2 gap-6">
                                    <DetailRow label="GST Number" value={store.gstDetails?.gstNumber} />
                                    <DetailRow label="Legal Name" value={store.gstDetails?.businessLegalName} />
                                    <DetailRow label="GST Type" value={store.gstDetails?.gstType} />
                                    <div className="col-span-2">
                                        <ImageThumbnail label="GST Certificate" src={store.gstDetails?.gstCertificate} />
                                    </div>
                                </div>
                            </section>

                            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <SectionTitle title="Store Inventory" icon={Sprout} />
                                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                        {products?.length || 0} Products
                                    </span>
                                </div>
                                {products?.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto pr-2">
                                        {products.slice(0, 10).map((product) => (
                                            <div key={product._id || product.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors">
                                                {product.image && <img src={product.image} className="w-10 h-10 rounded object-cover" alt={product.name} />}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                                                    <p className="text-xs text-emerald-600 font-bold">₹{product.price}</p>
                                                </div>
                                                <span className={`w-2 h-2 rounded-full ${product.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                                            </div>
                                        ))}
                                        {products.length > 10 && (
                                            <p className="text-xs text-center text-gray-400 py-2 border-t border-gray-50 mt-2 italic">
                                                ...and {products.length - 10} more items
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic text-center py-4 bg-gray-50 rounded-xl">No products found for this store.</p>
                                )}
                            </section>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-white border-t flex justify-end">
                    <button onClick={onClose} className="px-8 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StoreDetailModal;
