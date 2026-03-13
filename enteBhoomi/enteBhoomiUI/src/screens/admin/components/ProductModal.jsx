import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import ModalWrapper from "./ModalWrapper";

const ProductModal = ({ isOpen, onClose, product, onSave, stores, categories }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const formik = useFormik({
        initialValues: {
            productName: product?.productName || product?.name || "",
            category: product?.categoryId || (typeof product?.category === 'object' ? product?.category?._id : product?.category) || "",
            price: product?.price || 0,
            maxQuantity: product?.maxQuantity || product?.quantity || 0,
            quantity: product?.quantity || 0,
            storeId: product?.storeId?._id || product?.storeId || "",
            description: product?.description || "",
            bulkThreshold: product?.bulkThreshold || 20,
            isAvailable: product?.isAvailable ?? true,
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            productName: Yup.string().required("Required"),
            category: Yup.string().required("Required"),
            price: Yup.number().min(0, "Must be positive").required("Required"),
            maxQuantity: Yup.number().min(0, "Must be positive").required("Required"),
            quantity: Yup.number()
                .min(0, "Must be positive")
                .max(Yup.ref("maxQuantity"), "Stock cannot exceed Max Quantity")
                .required("Required"),
            storeId: Yup.string().required("Required"),
            description: Yup.string(),
            bulkThreshold: Yup.number().min(0, "Must be positive").required("Required"),
            isAvailable: Yup.boolean(),
        }),
        onSubmit: async (values) => {
            setIsSaving(true);
            try {
                await onSave(values, file);
                onClose();
                setFile(null);
                setPreview(null);
            } catch (error) {
                console.error("Product save error:", error);
            } finally {
                setIsSaving(false);
            }
        },
    });

    useEffect(() => {
        if (product) {
            setPreview(product.image || (product.images && product.images[0]) || null);
        } else {
            setPreview(null);
            setFile(null);
        }
    }, [product, isOpen]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={product ? "Edit Product" : "Add New Product"}>
            <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Product Name</label>
                    <input
                        name="productName"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.productName}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                    {formik.errors.productName && <p className="text-red-500 text-xs">{formik.errors.productName}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        name="description"
                        onChange={formik.handleChange}
                        value={formik.values.description}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none h-24 resize-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                            name="category"
                            onChange={formik.handleChange}
                            value={formik.values.category}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        >
                            <option value="">Select Category</option>
                            {categories?.map((cat) => (
                                <option key={cat.id || cat._id} value={cat.id || cat._id}>{cat.name}</option>
                            ))}
                        </select>
                        {formik.errors.category && <p className="text-red-500 text-xs">{formik.errors.category}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Store</label>
                        <select
                            name="storeId"
                            onChange={formik.handleChange}
                            value={formik.values.storeId}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        >
                            <option value="">Select Store</option>
                            {stores?.map((store) => (
                                <option key={store.id || store._id} value={store.id || store._id}>{store.storeName}</option>
                            ))}
                        </select>
                        {formik.errors.storeId && <p className="text-red-500 text-xs">{formik.errors.storeId}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                        <input
                            name="price"
                            type="number"
                            onChange={formik.handleChange}
                            value={formik.values.price}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        />
                        {formik.errors.price && <p className="text-red-500 text-xs">{formik.errors.price}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Max Quantity (Total)</label>
                            <input
                                name="maxQuantity"
                                type="number"
                                onChange={formik.handleChange}
                                value={formik.values.maxQuantity}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            />
                            {formik.errors.maxQuantity && <p className="text-red-500 text-xs">{formik.errors.maxQuantity}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Stock (Available)</label>
                            <input
                                name="quantity"
                                type="number"
                                onChange={formik.handleChange}
                                value={formik.values.quantity}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            />
                            {formik.errors.quantity && <p className="text-red-500 text-xs">{formik.errors.quantity}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bulk Order Threshold (Enquiry starts after this)</label>
                        <input
                            name="bulkThreshold"
                            type="number"
                            onChange={formik.handleChange}
                            value={formik.values.bulkThreshold}
                            placeholder="e.g. 20"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        />
                        {formik.errors.bulkThreshold && <p className="text-red-500 text-xs">{formik.errors.bulkThreshold}</p>}
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        name="isAvailable"
                        id="isAvailable"
                        onChange={formik.handleChange}
                        checked={formik.values.isAvailable}
                        className="w-4 h-4 text-red-500 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
                        Available for Sale
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {product ? "Update Product Image (optional)" : "Select Product Image"}
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                        required={!product}
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
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                        {isSaving ? "Saving..." : (product ? "Update Product" : "Add Product")}
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
};

export default ProductModal;
