import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { X, Check } from "lucide-react";
import { addStores, updateStore } from "../../../services/adminAPI";

const StoreModal = ({ isOpen, onClose, store, onSave }) => {
    const [files, setFiles] = useState({
        aadhaarOrLicenseImage: null,
        fssaiCertificate: null,
        passbookImage: null,
        gstCertificate: null,
    });
    const [previews, setPreviews] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [activeSection, setActiveSection] = useState("basic");

    const formik = useFormik({
        initialValues: {
            businessName: store?.businessName || "",
            ownerName: store?.ownerName || "",
            storeName: store?.storeName || "",
            email: store?.email || "",
            mobileNumber: store?.mobileNumber || "",
            password: "",
            businessAddress: store?.businessAddress || "",
            panNumber: store?.panNumber || "",
            accountNumber: store?.bankDetails?.accountNumber || "",
            ifscCode: store?.bankDetails?.ifscCode || "",
            branch: store?.bankDetails?.branch || "",
            gstNumber: store?.gstDetails?.gstNumber || "",
            businessLegalName: store?.gstDetails?.businessLegalName || "",
            gstType: store?.gstDetails?.gstType || "",
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            businessName: Yup.string().required("Required"),
            ownerName: Yup.string().required("Required"),
            storeName: Yup.string().required("Required"),
            email: Yup.string().email("Invalid email").required("Required"),
            panNumber: Yup.string()
                .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format")
                .uppercase(),
            accountNumber: Yup.string().required("Required"),
            ifscCode: Yup.string()
                .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC format")
                .required("Required")
                .uppercase(),
            gstNumber: Yup.string()
                .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST format")
                .uppercase(),
            branch: Yup.string().required("Required"),
        }),
        onSubmit: async (values) => {
            setIsSaving(true);
            try {
                const formData = new FormData();
                formData.append("businessName", values.businessName);
                formData.append("ownerName", values.ownerName);
                formData.append("storeName", values.storeName);
                formData.append("email", values.email);
                formData.append("mobileNumber", values.mobileNumber);
                if (values.password) formData.append("password", values.password);
                formData.append("businessAddress", values.businessAddress);
                if (values.panNumber) formData.append("panNumber", values.panNumber);
                formData.append("bankDetails", JSON.stringify({
                    accountNumber: values.accountNumber,
                    ifscCode: values.ifscCode,
                    branch: values.branch,
                }));
                if (values.gstNumber || values.businessLegalName || values.gstType) {
                    formData.append("gstDetails", JSON.stringify({
                        gstNumber: values.gstNumber,
                        businessLegalName: values.businessLegalName,
                        gstType: values.gstType,
                    }));
                }
                if (files.aadhaarOrLicenseImage) formData.append("aadhaarOrLicenseImage", files.aadhaarOrLicenseImage);
                if (files.fssaiCertificate) formData.append("fssaiCertificate", files.fssaiCertificate);
                if (files.passbookImage) formData.append("passbookImage", files.passbookImage);
                if (files.gstCertificate) formData.append("gstCertificate", files.gstCertificate);

                if (store?.id || store?._id) {
                    await updateStore(store.id || store._id, formData);
                } else {
                    await addStores(formData);
                }

                onSave();
                onClose();
                setFiles({ image: null, aadhaarOrLicenseImage: null, fssaiCertificate: null, passbookImage: null, gstCertificate: null });
                setPreviews({});
            } catch (error) {
                console.error("Store save error:", error);
                alert("Failed to save store: " + (error?.response?.data?.msg || error?.response?.data?.details || error?.message || "Unknown error"));
            } finally {
                setIsSaving(false);
            }
        },
    });

    useEffect(() => {
        if (store) {
            setPreviews({
                aadhaarOrLicenseImage: store.aadhaarOrLicenseImage || null,
                fssaiCertificate: store.fssaiCertificate || null,
                passbookImage: store.bankDetails?.passbookImage || null,
                gstCertificate: store.gstDetails?.gstCertificate || null,
            });
        } else {
            setPreviews({});
            setFiles({ aadhaarOrLicenseImage: null, fssaiCertificate: null, passbookImage: null, gstCertificate: null });
        }
        setActiveSection("basic");
    }, [store, isOpen]);

    const handleFileChange = (fieldName) => (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFiles(prev => ({ ...prev, [fieldName]: selectedFile }));
            if (selectedFile.type.startsWith('image/')) {
                setPreviews(prev => ({ ...prev, [fieldName]: URL.createObjectURL(selectedFile) }));
            } else {
                setPreviews(prev => ({ ...prev, [fieldName]: 'file' }));
            }
        }
    };

    const sections = [
        { id: "basic", label: "Business Info" },
        { id: "store", label: "Store Details" },
        { id: "kyc", label: "KYC" },
        { id: "bank", label: "Bank" },
        { id: "gst", label: "GST" },
    ];

    const inputCls = "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm";
    const labelCls = "block text-sm font-medium text-gray-700 mb-1";
    const fileCls = "w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100";

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-5 border-b flex justify-between items-center">
                    <h3 className="text-xl font-semibold">{store ? "Edit Store" : "Add New Store"}</h3>
                    <button onClick={onClose}><X className="w-6 h-6 text-gray-500" /></button>
                </div>
                <div className="flex border-b bg-gray-50 px-4 gap-1 overflow-x-auto">
                    {sections.map((s, idx) => {
                        const currentIndex = sections.findIndex(sec => sec.id === activeSection);
                        const isCompleted = idx < currentIndex;
                        const isCurrent = idx === currentIndex;
                        return (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                    if (idx <= currentIndex) {
                                        setActiveSection(s.id);
                                    }
                                }}
                                disabled={idx > currentIndex}
                                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${isCurrent ? "border-emerald-500 text-emerald-600 bg-white" : isCompleted ? "border-transparent text-green-600 hover:text-green-700" : "border-transparent text-gray-400 cursor-not-allowed"}`}
                            >
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isCurrent ? "bg-emerald-500 text-white" : isCompleted ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                                    {isCompleted ? <Check className="w-3 h-3" /> : idx + 1}
                                </span>
                                {s.label}
                            </button>
                        );
                    })}
                </div>
                <form
                    onSubmit={formik.handleSubmit}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
                            e.preventDefault();
                        }
                    }}
                    className="flex-1 overflow-y-auto p-5"
                >
                    {activeSection === "basic" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Business Name *</label>
                                    <input name="businessName" type="text" onChange={formik.handleChange} value={formik.values.businessName} className={inputCls} />
                                    {formik.errors.businessName && <p className="text-red-500 text-xs mt-1">{formik.errors.businessName}</p>}
                                </div>
                                <div>
                                    <label className={labelCls}>Owner Name *</label>
                                    <input name="ownerName" type="text" onChange={formik.handleChange} value={formik.values.ownerName} className={inputCls} />
                                    {formik.errors.ownerName && <p className="text-red-500 text-xs mt-1">{formik.errors.ownerName}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Email *</label>
                                    <input name="email" type="email" onChange={formik.handleChange} value={formik.values.email} className={inputCls} />
                                    {formik.errors.email && <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>}
                                </div>
                                <div>
                                    <label className={labelCls}>Mobile Number *</label>
                                    <input name="mobileNumber" type="text" onChange={formik.handleChange} value={formik.values.mobileNumber} className={inputCls} placeholder="10 digit number" />
                                    {formik.errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{formik.errors.mobileNumber}</p>}
                                </div>
                            </div>
                            {!store && (
                                <div>
                                    <label className={labelCls}>Password *</label>
                                    <input name="password" type="password" onChange={formik.handleChange} value={formik.values.password} className={inputCls} placeholder="Min 6 characters" />
                                    {formik.errors.password && <p className="text-red-500 text-xs mt-1">{formik.errors.password}</p>}
                                </div>
                            )}
                        </div>
                    )}
                    {activeSection === "store" && (
                        <div className="space-y-4">
                            <div>
                                <label className={labelCls}>Store Name *</label>
                                <input name="storeName" type="text" onChange={formik.handleChange} value={formik.values.storeName} className={inputCls} />
                                {formik.errors.storeName && <p className="text-red-500 text-xs mt-1">{formik.errors.storeName}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>Business Address *</label>
                                <textarea name="businessAddress" onChange={formik.handleChange} value={formik.values.businessAddress} className={`${inputCls} h-24 resize-none`} />
                                {formik.errors.businessAddress && <p className="text-red-500 text-xs mt-1">{formik.errors.businessAddress}</p>}
                            </div>
                        </div>
                    )}
                    {activeSection === "kyc" && (
                        <div className="space-y-4">
                            <div>
                                <label className={labelCls}>PAN Number</label>
                                <input name="panNumber" type="text" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.panNumber} className={inputCls} placeholder="Enter PAN Number" style={{ textTransform: 'uppercase' }} />
                                {formik.errors.panNumber && formik.touched.panNumber && <p className="text-red-500 text-xs mt-1">{formik.errors.panNumber}</p>}
                            </div>
                            <div>
                                <label className={labelCls}>Aadhaar / License Image {!store && "*"}</label>
                                <input type="file" accept="image/*,.pdf" onChange={handleFileChange("aadhaarOrLicenseImage")} className={fileCls} />
                                {previews.aadhaarOrLicenseImage && (
                                    <div className="mt-2">
                                        {previews.aadhaarOrLicenseImage === 'file' ? (
                                            <div className="text-xs font-bold text-emerald-600">PDF Selected</div>
                                        ) : (
                                            <img src={previews.aadhaarOrLicenseImage} alt="Aadhaar" className="w-20 h-14 rounded-lg object-cover border cursor-pointer" onClick={() => window.open(previews.aadhaarOrLicenseImage, '_blank')} />
                                        )}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className={labelCls}>FSSAI Certificate {!store && "*"}</label>
                                <input type="file" accept="image/*,.pdf" onChange={handleFileChange("fssaiCertificate")} className={fileCls} />
                                {previews.fssaiCertificate && (
                                    <div className="mt-2">
                                        {previews.fssaiCertificate === 'file' ? (
                                            <div className="text-xs font-bold text-emerald-600">PDF Selected</div>
                                        ) : (
                                            <img src={previews.fssaiCertificate} alt="FSSAI" className="w-20 h-14 rounded-lg object-cover border cursor-pointer" onClick={() => window.open(previews.fssaiCertificate, '_blank')} />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {activeSection === "bank" && (
                        <div className="space-y-4">
                            <div>
                                <label className={labelCls}>Account Number *</label>
                                <input name="accountNumber" type="text" onChange={formik.handleChange} value={formik.values.accountNumber} className={inputCls} />
                                {formik.errors.accountNumber && <p className="text-red-500 text-xs mt-1">{formik.errors.accountNumber}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>IFSC Code *</label>
                                    <input name="ifscCode" type="text" onChange={formik.handleChange} value={formik.values.ifscCode} className={inputCls} placeholder="Enter IFSC Code" style={{ textTransform: 'uppercase' }} />
                                    {formik.errors.ifscCode && <p className="text-red-500 text-xs mt-1">{formik.errors.ifscCode}</p>}
                                </div>
                                <div>
                                    <label className={labelCls}>Branch *</label>
                                    <input name="branch" type="text" onChange={formik.handleChange} value={formik.values.branch} className={inputCls} />
                                    {formik.errors.branch && <p className="text-red-500 text-xs mt-1">{formik.errors.branch}</p>}
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Passbook Image</label>
                                <input type="file" accept="image/*,.pdf" onChange={handleFileChange("passbookImage")} className={fileCls} />
                                {previews.passbookImage && (
                                    <div className="mt-2">
                                        {previews.passbookImage === 'file' ? (
                                            <div className="text-xs font-bold text-emerald-600">PDF Selected</div>
                                        ) : (
                                            <img src={previews.passbookImage} alt="Passbook" className="w-20 h-14 rounded-lg object-cover border cursor-pointer" onClick={() => window.open(previews.passbookImage, '_blank')} />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {activeSection === "gst" && (
                        <div className="space-y-4">
                            <div>
                                <label className={labelCls}>GST Number</label>
                                <input name="gstNumber" type="text" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.gstNumber} className={inputCls} placeholder="Enter GST Number" style={{ textTransform: 'uppercase' }} />
                                {formik.errors.gstNumber && formik.touched.gstNumber && <p className="text-red-500 text-xs mt-1">{formik.errors.gstNumber}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Business Legal Name</label>
                                    <input name="businessLegalName" type="text" onChange={formik.handleChange} value={formik.values.businessLegalName} className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>GST Type</label>
                                    <select name="gstType" onChange={formik.handleChange} value={formik.values.gstType} className={inputCls}>
                                        <option value="">Select Type</option>
                                        <option value="REGULAR">Regular</option>
                                        <option value="COMPOSITION">Composition</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>GST Certificate</label>
                                <input type="file" accept="image/*,.pdf" onChange={handleFileChange("gstCertificate")} className={fileCls} />
                                {previews.gstCertificate && (
                                    <div className="mt-2">
                                        {previews.gstCertificate === 'file' ? (
                                            <div className="text-xs font-bold text-emerald-600">PDF Selected</div>
                                        ) : (
                                            <img src={previews.gstCertificate} alt="GST Cert" className="w-20 h-14 rounded-lg object-cover border cursor-pointer" onClick={() => window.open(previews.gstCertificate, '_blank')} />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <div className="flex justify-between items-center pt-6 mt-6 border-t px-2">
                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={() => {
                                    const idx = sections.findIndex(s => s.id === activeSection);
                                    if (idx > 0) setActiveSection(sections[idx - 1].id);
                                    else onClose();
                                }}
                                className="px-6 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all border border-gray-200"
                            >
                                {activeSection === "basic" ? "Cancel" : "Back"}
                            </button>
                        </div>
                        <div className="flex space-x-3">
                            {activeSection !== "gst" ? (
                                <button
                                    type="button"
                                    key="next-btn"
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const idx = sections.findIndex(s => s.id === activeSection);

                                        const sectionFields = {
                                            basic: ["businessName", "ownerName", "email", "mobileNumber", "password"],
                                            store: ["storeName", "businessAddress"],
                                            kyc: ["panNumber"],
                                            bank: ["accountNumber", "ifscCode", "branch"]
                                        };

                                        const currentFields = sectionFields[activeSection] || [];

                                        currentFields.forEach(field => {
                                            if (!store && field === "password" || field !== "password") {
                                                formik.setFieldTouched(field, true, true);
                                            }
                                        });

                                        const errors = await formik.validateForm();
                                        const hasErrors = currentFields.some(field =>
                                            (field === "password" && !store && errors[field]) ||
                                            (field !== "password" && errors[field])
                                        );

                                        let imageErrors = false;
                                        if (activeSection === "kyc" && !store) {
                                            if (!files.aadhaarOrLicenseImage) {
                                                alert("Aadhaar/License Image is required for new stores");
                                                imageErrors = true;
                                            } else if (!files.fssaiCertificate) {
                                                alert("FSSAI Certificate is required for new stores");
                                                imageErrors = true;
                                            }
                                        }

                                        if (!hasErrors && !imageErrors) {
                                            if (idx < sections.length - 1) setActiveSection(sections[idx + 1].id);
                                        }
                                    }}
                                    className="px-8 py-2 text-sm font-bold text-white bg-[#14532D] rounded-xl hover:bg-[#064E3B] transition-all shadow-md shadow-emerald-100"
                                >
                                    Next Step
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    key="submit-btn"
                                    disabled={isSaving}
                                    className="px-8 py-2 text-sm font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all shadow-md shadow-green-200"
                                >
                                    {isSaving ? "Saving..." : (store ? "Update Profile" : "Create Store")}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StoreModal;
