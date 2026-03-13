import React, { useState, useEffect } from "react";
import ModalWrapper from "./ModalWrapper";

const BannerModal = ({ isOpen, onClose, banner, onSave, stores, products }) => {
    const [file, setFile] = useState(null);
    const [targetType, setTargetType] = useState("Store"); // "Store" or "Product"
    const [selectedId, setSelectedId] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [preview, setPreview] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (banner) {
            setPreview(banner.image);
            if (banner.productId) {
                setTargetType("Product");
                const prodId = banner.productId?._id || banner.productId || "";
                setSelectedId(prodId);
                const found = products?.find(p => (p.id || p._id) === prodId);
                setSearchTerm(found ? (found.productName || found.name) : "");
            } else {
                setTargetType("Store");
                const stId = banner.storeId?._id || banner.storeId || "";
                setSelectedId(stId);
                const found = stores?.find(s => (s.id || s._id) === stId);
                setSearchTerm(found ? found.storeName : "");
            }
        } else {
            setPreview(null);
            setFile(null);
            setTargetType("Store");
            setSelectedId("");
            setSearchTerm("");
        }
    }, [banner, isOpen, stores, products]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const filteredItems = targetType === "Store"
        ? stores?.filter(s => s.storeName?.toLowerCase().includes(searchTerm.toLowerCase()))
        : products?.filter(p =>
            (p.productName || p.name || "")?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.store || "")?.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const handleSelectItem = (item) => {
        setSelectedId(item.id || item._id);
        setSearchTerm(targetType === "Store" ? item.storeName : (item.productName || item.name));
        setShowDropdown(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedId) {
            alert(`Please select a valid ${targetType} from the list.`);
            return;
        }

        if (file || banner) {
            setIsSaving(true);
            try {
                const metadata = targetType === "Store"
                    ? { storeId: selectedId, productId: null }
                    : { productId: selectedId, storeId: null };

                await onSave(file, metadata);
                onClose();
                setFile(null);
                setPreview(null);
                setSelectedId("");
                setSearchTerm("");
            } catch (error) {
                console.error("Banner save error:", error);
            } finally {
                setIsSaving(false);
            }
        }
    };

    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={onClose}
            title={banner ? "Edit Banner" : "Add New Banner"}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Link Banner To:</label>
                    <div className="flex gap-4">
                        {["Store", "Product"].map(type => (
                            <label key={type} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="targetType"
                                    value={type}
                                    checked={targetType === type}
                                    onChange={(e) => {
                                        setTargetType(e.target.value);
                                        setSelectedId("");
                                        setSearchTerm("");
                                    }}
                                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-sm font-medium text-gray-700">{type}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select {targetType} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder={`Search ${targetType.toLowerCase()}...`}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowDropdown(true);
                            if (e.target.value === "") setSelectedId("");
                        }}
                        onFocus={() => setShowDropdown(true)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        required
                    />

                    {showDropdown && filteredItems && filteredItems.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
                            {filteredItems.map((item) => (
                                <li
                                    key={item.id || item._id}
                                    onClick={() => handleSelectItem(item)}
                                    className="px-4 py-2 hover:bg-emerald-50 cursor-pointer text-sm text-gray-700 flex flex-col"
                                >
                                    <span className="font-medium">{targetType === "Store" ? item.storeName : (item.productName || item.name)}</span>
                                    {targetType === "Product" && (
                                        <span className="text-[10px] text-gray-400">Store: {item.storeNameFormatted || item.store || "N/A"}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}

                    {showDropdown && searchTerm && filteredItems?.length === 0 && (
                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg p-2 mt-1 text-sm text-gray-500">
                            No {targetType.toLowerCase()}s found.
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {banner ? "Update Banner Image (optional)" : "Select Banner Image"}
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                        required={!banner}
                    />
                </div>

                {preview && (
                    <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-2">Preview:</p>
                        <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded-lg border" />
                    </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={(!file && !banner) || !selectedId || isSaving}
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 flex items-center bg-emerald-500 hover:bg-emerald-600 transition-colors"
                    >
                        {isSaving ? "Saving..." : (banner ? "Update Banner" : "Add Banner")}
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
};

export default BannerModal;
