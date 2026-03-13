import Order from "../modals/orderSchema.js";
import Product from "../modals/productSchema.js";
import mongoose from "mongoose";

/**
 * Get dashboard statistics and data for a specific store
 * Route: GET /dashboard
 * Access: Private (Store)
 */
export const getStoreDashboardData = async (req, res) => {
    try {
        const storeId = req.store._id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const storeIdObj = new mongoose.Types.ObjectId(storeId.toString());

        // 1. Fetch Stats & Products
        const statsPipeline = [
            { $match: { "vendorOrders.storeId": storeIdObj } },
            { $unwind: "$vendorOrders" },
            { $match: { "vendorOrders.storeId": storeIdObj } },
            {
                $group: {
                    _id: null,
                    todayOrders: {
                        $sum: { $cond: [{ $gte: ["$createdAt", today] }, 1, 0] }
                    },
                    todayRevenue: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ["$createdAt", today] },
                                        { $not: { $in: [{ $toLower: "$vendorOrders.vendorStatus" }, ["rejected", "cancelled"]] } }
                                    ]
                                },
                                "$vendorOrders.amount",
                                0
                            ]
                        }
                    },
                    pendingOrders: {
                        $sum: {
                            $cond: [
                                { $eq: [{ $toLower: "$vendorOrders.vendorStatus" }, "pending"] },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ];

        const [statsResult, totalProducts] = await Promise.all([
            Order.aggregate(statsPipeline),
            Product.countDocuments({ storeId: storeIdObj })
        ]);

        const stats = statsResult[0] || {
            todayOrders: 0,
            todayRevenue: 0,
            pendingOrders: 0
        };

        const { todayOrders, todayRevenue, pendingOrders } = stats;

        // 2. Fetch Recent Orders (Top 5)
        const recentOrdersRaw = await Order.find({ "vendorOrders.storeId": storeIdObj })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("userId", "fullName")
            .lean();

        // 3. Fetch Low Stock Items (Quantity <= 10)
        const lowStockItems = await Product.find({
            storeId: storeIdObj,
            quantity: { $lte: 10 }
        })
            .limit(5)
            .select("productName quantity maxQuantity")
            .lean();

        // 4. Sales Overview (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const monthlySales = await Order.aggregate([
            { $match: { "vendorOrders.storeId": storeIdObj, createdAt: { $gte: sixMonthsAgo } } },
            { $unwind: "$vendorOrders" },
            { $match: { "vendorOrders.storeId": storeIdObj } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    revenue: { $sum: "$vendorOrders.amount" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        // Format monthly sales results to ensure all 6 months are present
        const monthsNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const salesOverview = [];

        for (let i = 0; i < 6; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            const monthIndex = d.getMonth();
            const year = d.getFullYear();

            const monthData = monthlySales.find(s => s._id.month === (monthIndex + 1) && s._id.year === year);
            salesOverview.push({
                month: monthsNames[monthIndex],
                value: monthData ? monthData.revenue : 0
            });
        }

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    todayOrders,
                    todayRevenue,
                    pendingOrders,
                    totalProducts
                },
                recentOrders: recentOrdersRaw.map(order => {
                    const vendorPart = order.vendorOrders.find(vo => vo.storeId.toString() === storeId.toString());
                    return {
                        id: order.orderId,
                        customer: order.userId?.fullName || "Unknown",
                        amount: vendorPart ? vendorPart.amount : 0,
                        status: vendorPart ? (vendorPart.vendorStatus || "pending").toLowerCase() : "unknown",
                        createdAt: order.createdAt
                    };
                }),
                lowStockItems: lowStockItems.map(item => ({
                    name: item.productName,
                    stock: item.quantity,
                    maxStock: item.maxQuantity
                })),
                salesOverview
            }
        });

    } catch (err) {
        console.error("Dashboard API Error:", err);
        res.status(500).json({
            success: false,
            msg: "Failed to fetch dashboard data",
            error: err.message
        });
    }
};
