import React from "react";
import {
    X,
    Users,
    Phone,
    Mail,
    Clock,
    MapPin,
    ImageIcon,
    Trash2
} from "lucide-react";

const LandownerEnquiryDetailModal = ({ isOpen, onClose, enquiry, onDelete }) => {
    if (!isOpen || !enquiry) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Enquiry Details</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">ID: {enquiry.id || enquiry._id}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-600">
                                {enquiry.partnershipOption}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all hover:rotate-90">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Applicant Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                                <Users size={16} className="text-emerald-500" /> Applicant Information
                            </h4>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                                <p className="font-bold text-gray-900">{enquiry.applicantName}</p>
                                <p className="text-sm text-gray-600 flex items-center gap-2"><Phone size={14} /> {enquiry.applicantPhone}</p>
                                <p className="text-sm text-gray-600 flex items-center gap-2"><Mail size={14} /> {enquiry.applicantEmail}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                                <Clock size={16} className="text-emerald-500" /> Submission Date
                            </h4>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="font-bold text-gray-900">{enquiry.dateSubmitted}</p>
                            </div>
                        </div>
                    </div>

                    {/* Land Details */}
                    <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                            <MapPin size={16} className="text-emerald-500" /> Land Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase">Location</p>
                                <p className="font-bold text-gray-900">{enquiry.landLocation}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase">Area/Size</p>
                                <p className="font-bold text-gray-900">{enquiry.landArea}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase">Crops</p>
                                <p className="font-bold text-gray-900">{enquiry.crops}</p>
                            </div>
                        </div>
                    </div>

                    {/* Image Gallery */}
                    {enquiry.landDetails?.images?.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                                <ImageIcon size={16} className="text-emerald-500" /> Land Images
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {enquiry.landDetails.images.map((img, idx) => (
                                    <div key={idx} className="aspect-video rounded-2xl overflow-hidden border border-gray-100 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(img, '_blank')}>
                                        <img src={img} className="w-full h-full object-cover" alt={`Land Image ${idx + 1}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-between gap-4">
                    <button
                        onClick={() => {
                            onDelete(enquiry, "landowner");
                            onClose();
                        }}
                        className="px-6 py-2.5 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-all flex items-center gap-2 text-sm"
                    >
                        <Trash2 size={16} /> Delete Enquiry
                    </button>
                    <button
                        onClick={onClose}
                        className="px-8 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LandownerEnquiryDetailModal;
