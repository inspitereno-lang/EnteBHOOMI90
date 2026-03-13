import React from "react";

const DashboardView = ({ stats, recentOrders, getStatusBadge, onStatClick }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
                <div
                    key={i}
                    onClick={() => onStatClick && stat.tab && onStatClick(stat.tab)}
                    className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group"
                >
                    <p className="text-gray-600 text-sm font-medium group-hover:text-emerald-600 transition-colors uppercase tracking-wider">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1 group-hover:scale-105 origin-left transition-transform">{stat.value}</p>
                </div>
            ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold p-6 border-b">Recent Orders</h2>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            {["Order ID", "Customer", "Store", "Amount", "Status"].map(
                                (h) => (
                                    <th
                                        key={h}
                                        className="text-left py-3 px-6 text-sm font-medium text-gray-700"
                                    >
                                        {h}
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {recentOrders.map((order) => (
                            <tr key={order.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-6 text-sm font-medium truncate max-w-xs">
                                    {order.orderDisplayId}
                                </td>
                                <td className="py-3 px-6 text-sm truncate max-w-xs">
                                    {order.customerName}
                                </td>
                                <td className="py-3 px-6 text-sm">{order.storeName}</td>
                                <td className="py-3 px-6 text-sm font-semibold">
                                    {order.amount}
                                </td>
                                <td className="py-3 px-6">
                                    <span className={getStatusBadge(order.status)}>
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

export default DashboardView;
