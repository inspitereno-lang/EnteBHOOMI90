import React from "react";
import {
    LogOut,
    Leaf
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({
    sidebarItems,
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
}) => {
    const navigate = useNavigate();
    return (
        <>
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={() => setSidebarOpen(false)}
            ></div>
            <div
                className={`fixed top-0 left-0 h-full bg-white shadow-xl z-40 w-64 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="p-6 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100" style={{ background: 'linear-gradient(135deg, #14532D 0%, #61CE70 100%)' }}>
                        <Leaf className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl font-bold" style={{ color: '#14532D' }}>Ente Bhoomi</h1>
                </div>
                <nav className="mt-8">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center px-6 py-3 text-left hover:bg-emerald-50 transition-colors ${activeTab === item.id
                                ? "text-white border-r-4"
                                : "text-gray-700"
                                }`}
                            style={activeTab === item.id ? {
                                background: 'linear-gradient(90deg, #14532D 0%, #14532D 100%)',
                                borderRightColor: '#61CE70'
                            } : {}}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="ml-3">{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="absolute bottom-0 w-full p-6">
                    <button
                        onClick={() => {
                            localStorage.removeItem("adminToken");
                            navigate("/admin/login");
                        }}
                        className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="ml-3">Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
