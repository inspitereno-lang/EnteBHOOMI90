import React from "react";
import { Menu } from "lucide-react";

const Header = ({ activeTab, setSidebarOpen }) => (
    <header className="bg-white border-b px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <h1 className="text-xl sm:text-2xl font-semibold capitalize">
                    {activeTab}
                </h1>
            </div>
            <div className="flex items-center space-x-3">
                <div className="hidden md:block">
                    <p className="text-sm font-medium">Admin User</p>
                </div>
            </div>
        </div>
    </header>
);

export default Header;
