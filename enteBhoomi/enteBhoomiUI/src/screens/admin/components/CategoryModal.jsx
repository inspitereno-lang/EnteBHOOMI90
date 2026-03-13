import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import ModalWrapper from "./ModalWrapper";

const CategoryModal = ({ isOpen, onClose, category, onSave }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

    const formik = useFormik({
        initialValues: {
            name: category?.name || "",
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            name: Yup.string().required("Required"),
        }),
        onSubmit: (values) => {
            onSave(values, file);
            onClose();
        },
    });

    useEffect(() => {
        if (category) {
            setPreview(category.image || null);
        } else {
            setPreview(null);
            setFile(null);
        }
    }, [category, isOpen]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    if (!isOpen) return null;

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={category ? "Edit Category" : "Add Category"}>
            <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Category Name</label>
                    <input
                        type="text"
                        name="name"
                        {...formik.getFieldProps("name")}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 outline-none p-2"
                    />
                    {formik.touched.name && formik.errors.name && <p className="text-red-500 text-xs mt-1">{formik.errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Category Image</label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:text-white"
                        style={{ '--file-bg': '#61CE70', '--file-hover-bg': '#52b863' }}
                        onMouseEnter={(e) => e.target.style.setProperty('--file-bg', '#52b863')}
                        onMouseLeave={(e) => e.target.style.setProperty('--file-bg', '#61CE70')}
                    />
                    {(preview || category?.image) && (
                        <div className="mt-2">
                            <img src={preview || category?.image} alt="Preview" className="h-32 w-full object-cover rounded-lg" />
                        </div>
                    )}
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                        Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white rounded-md" style={{ background: '#61CE70' }} onMouseEnter={(e) => e.target.style.background = '#52b863'} onMouseLeave={(e) => e.target.style.background = '#61CE70'}>
                        {category ? "Update" : "Add"} Category
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
};

export default CategoryModal;
