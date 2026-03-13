import React from "react";
import { Trash2 } from "lucide-react";
import ModalWrapper from "./ModalWrapper";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName }) => (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
        <div className="space-y-4">
            <p>Are you sure you want to delete <span className="font-bold">{itemName}</span>?</p>
            <div className="flex justify-end space-x-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 flex items-center"
                >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                </button>
            </div>
        </div>
    </ModalWrapper>
);

export default DeleteConfirmationModal;
