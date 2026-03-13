import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Store,
  UtensilsCrossed,
  Users,
  ShoppingBag,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Menu,
  X,
  Save,
  Printer, // For print icon
  Download, // For download icon
  Image as ImageIcon, // For Banner icon
  Layers, // For Category icon

  Eye, // For view details
  MapPin,
  Phone,
  Mail,
  Clock,
  Star as StarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  Package,
  CheckCircle,
  ExternalLink,
  TreePine, // For Landowner icon
  Leaf,
  Sprout,
  Power,
  PowerOff,
  Search,
} from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  addStores,
  updateStore,
  deleteStore,
  getAllStores,
  updateStoreStatus,
  addFoodItem,
  getAllFoodItems,
  updateFoodItem,
  deleteFoodItem,
  getAllBanners,
  addBanner,
  deleteBanner,
  updateBanner,
  getAllCategories,
  addCategory,
  deleteCategory,
  updateCategory,
  deleteUser,
  getAdminOrders,
  updateAdminOrderItemStatus,
  toggleProductAvailability,
} from "../../services/adminAPI";
import { fetchShippingOptions } from "../../services/shippingAPI";
import { getAllUsers } from "../../services/userApi";
import {
  deleteOrder,
  updateOrder,
} from "../../services/orderAPI";
import { getStoreProducts } from "../../services/storesAPI";
import {
  getAllLandownerEnquiries,
  deleteLandownerEnquiry,
} from "../../services/landownerAPI";

import { useNavigate } from "react-router-dom";
// import { supabase } from "../../store/supabaseClient"; // Supabase removed
import { baseURL } from "../../services/axiosInstance";

// Import separated components
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import TableView from "./components/TableView";
import ModalWrapper from "./components/ModalWrapper";
import ProductModal from "./components/ProductModal";
import StoreModal from "./components/StoreModal";
import StoreDetailModal from "./components/StoreDetailModal";
import OrderDetailsModal from "./components/OrderDetailsModal";
import LandownerEnquiryDetailModal from "./components/LandownerEnquiryDetailModal";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";
import BannerModal from "./components/BannerModal";
import CategoryModal from "./components/CategoryModal";

// ====================================================================
// --- Main Admin Dashboard Component ---
// ====================================================================
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showEditStoreModal, setShowEditStoreModal] = useState(false);
  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddBannerModal, setShowAddBannerModal] = useState(false);
  const [showEditBannerModal, setShowEditBannerModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);

  const [showStoreDetailModal, setShowStoreDetailModal] = useState(false);
  const [showLandownerDetailModal, setShowLandownerDetailModal] = useState(false);


  // Data states
  const [storesData, setStoresData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [bannersData, setBannersData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [landownerEnquiriesData, setLandownerEnquiriesData] = useState([]);
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [storeSearchTerm, setStoreSearchTerm] = useState("");
  const [bannerSearchTerm, setBannerSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [landownerSearchTerm, setLandownerSearchTerm] = useState("");
  const [bulkSearchTerm, setBulkSearchTerm] = useState("");

  const [userDateFilter, setUserDateFilter] = useState("");
  const [bulkDateFilter, setBulkDateFilter] = useState("");

  // State for date filtering
  const [reportDate, setReportDate] = useState("");

  const formattedProductsData = useMemo(() => {
    return productsData.map((product) => {
      // Lookup store name
      const storeVal = product.storeId?._id || product.storeId || product.restaurantId?._id || product.restaurantId;
      const storeObj = storesData.find(s =>
        (s.id && s.id === storeVal) ||
        (s._id && s._id === storeVal) ||
        (s.storeName && s.storeName === storeVal)
      );

      let storeNameLabel = "N/A";
      if (product.storeName && product.storeName !== "N/A") {
        storeNameLabel = product.storeName;
      } else if (storeObj) {
        storeNameLabel = storeObj.storeName;
      } else if (product.store && product.store !== "N/A") {
        storeNameLabel = product.store;
      } else if (storeVal) {
        storeNameLabel = storeVal;
      }

      // Lookup category name
      const catVal = product.categoryId || product.category?._id || product.category;
      const catObj = categoriesData.find(c =>
        (c.id && c.id === catVal) ||
        (c._id && c._id === catVal) ||
        (c.name && c.name === catVal)
      );

      let categoryNameLabel = "N/A";
      if (product.categoryName && product.categoryName !== "N/A" && product.categoryName !== product.categoryId) {
        categoryNameLabel = product.categoryName;
      } else if (catObj) {
        categoryNameLabel = catObj.name;
      } else if (catVal) {
        categoryNameLabel = catVal;
      }

      return {
        ...product,
        storeNameFormatted: storeNameLabel,
        categoryNameFormatted: categoryNameLabel,
        // Ensure category ID is preserved for the Modal even if it was normalized as categoryId
        categoryId: catVal
      };
    });
  }, [productsData, storesData, categoriesData]);

  // State to trigger data re-fetches
  const [storeDataVersion, setStoreDataVersion] = useState(0);
  const [productDataVersion, setProductDataVersion] = useState(0);
  const [orderDataVersion, setOrderDataVersion] = useState(0);
  const [userDataVersion, setUserDataVersion] = useState(0);
  const [bannerDataVersion, setBannerDataVersion] = useState(0);
  const [categoryDataVersion, setCategoryDataVersion] = useState(0);
  const [landownerDataVersion, setLandownerDataVersion] = useState(0);

  const filteredOrdersData = useMemo(() => {
    let result = ordersData.filter(o => o.hasNormalItems);
    if (orderSearchTerm) {
      const search = orderSearchTerm.toLowerCase();
      result = result.filter(order =>
        order.orderDisplayId?.toString().toLowerCase().includes(search) ||
        order.customerName?.toLowerCase().includes(search) ||
        order.storeName?.toLowerCase().includes(search)
      );
    }
    if (reportDate) {
      if (reportDate === "invalid") {
        return [];
      }
      result = result.filter(order => {
        const oDate = order.createdAt;
        if (!oDate || isNaN(oDate)) return false;
        const yyyy = oDate.getFullYear();
        const mm = String(oDate.getMonth() + 1).padStart(2, '0');
        const dd = String(oDate.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}` === reportDate;
      });
    }
    // Map to normal display values
    return result.map(o => ({
      ...o,
      foodItemDisplay: o.normalFoodItemDisplay,
      amount: o.normalAmount
    }));
  }, [ordersData, orderSearchTerm, reportDate]);

  const filteredBulkOrdersData = useMemo(() => {
    let result = ordersData.filter(o => o.hasBulkItems);
    if (bulkSearchTerm) {
      const search = bulkSearchTerm.toLowerCase();
      result = result.filter(order =>
        order.orderDisplayId?.toString().toLowerCase().includes(search) ||
        order.customerName?.toLowerCase().includes(search) ||
        order.storeName?.toLowerCase().includes(search)
      );
    }
    if (bulkDateFilter) {
      result = result.filter(order => {
        const oDate = order.createdAt;
        if (!oDate || isNaN(oDate)) return false;
        const yyyy = oDate.getFullYear();
        const mm = String(oDate.getMonth() + 1).padStart(2, '0');
        const dd = String(oDate.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}` === bulkDateFilter;
      });
    }
    // Map to bulk display values
    return result.map(o => ({
      ...o,
      foodItemDisplay: o.bulkFoodItemDisplay,
      amount: o.bulkAmount
    }));
  }, [ordersData, bulkSearchTerm, bulkDateFilter]);

  const filteredStoresData = useMemo(() => {
    if (!storeSearchTerm) return storesData;
    const search = storeSearchTerm.toLowerCase();
    return storesData.filter(store =>
      store.storeName?.toLowerCase().includes(search) ||
      store.ownerName?.toLowerCase().includes(search) ||
      store.email?.toLowerCase().includes(search)
    );
  }, [storesData, storeSearchTerm]);

  const filteredBannersData = useMemo(() => {
    if (!bannerSearchTerm) return bannersData;
    const search = bannerSearchTerm.toLowerCase();
    return bannersData.filter(banner =>
      banner.targetName?.toLowerCase().includes(search) ||
      banner.storeName?.toLowerCase().includes(search) ||
      banner.targetType?.toLowerCase().includes(search)
    );
  }, [bannersData, bannerSearchTerm]);

  const filteredUsersData = useMemo(() => {
    let result = usersData;
    if (userSearchTerm) {
      const search = userSearchTerm.toLowerCase();
      result = result.filter(user =>
        user.fullName?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.phoneNumber?.toString().includes(search)
      );
    }
    if (userDateFilter) {
      result = result.filter(user => {
        if (!user.rawDate) return false;
        const uDate = new Date(user.rawDate);
        if (isNaN(uDate)) return false;
        const yyyy = uDate.getFullYear();
        const mm = String(uDate.getMonth() + 1).padStart(2, '0');
        const dd = String(uDate.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}` === userDateFilter;
      });
    }
    return result;
  }, [usersData, userSearchTerm, userDateFilter]);

  const filteredLandownerData = useMemo(() => {
    if (!landownerSearchTerm) return landownerEnquiriesData;
    const search = landownerSearchTerm.toLowerCase();
    return landownerEnquiriesData.filter(enquiry =>
      enquiry.applicantName?.toLowerCase().includes(search) ||
      enquiry.applicantPhone?.toLowerCase().includes(search) ||
      enquiry.applicantEmail?.toLowerCase().includes(search) ||
      enquiry.landLocation?.toLowerCase().includes(search) ||
      enquiry.partnershipOption?.toLowerCase().includes(search) ||
      enquiry.crops?.toLowerCase().includes(search)
    );
  }, [landownerEnquiriesData, landownerSearchTerm]);

  // Filter States
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [productStatusFilter, setProductStatusFilter] = useState("all"); // "all", "available", "unavailable"

  const filteredProducts = useMemo(() => {
    return formattedProductsData.filter(p => {
      // Ensure we compare boolean status correctly (handling both boolean and string "true"/"false")
      const isActuallyAvailable = p.isAvailable === true || p.isAvailable === "true" || p.isAvailable === undefined;

      const matchCategory = productCategoryFilter === "all" || p.categoryId === productCategoryFilter;
      const matchStatus = productStatusFilter === "all" ||
        (productStatusFilter === "available" && isActuallyAvailable) ||
        (productStatusFilter === "unavailable" && !isActuallyAvailable);

      return matchCategory && matchStatus;
    });
  }, [formattedProductsData, productCategoryFilter, productStatusFilter]);



  // Effect for fetching Stores
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await getAllStores({ limit: 1000 });
        const dataArr = Array.isArray(response) ? response : (response?.data && Array.isArray(response.data) ? response.data : []);
        setStoresData(
          dataArr.map((item) => ({ ...item, id: item._id }))
        );
      } catch (error) {
        console.error("Failed to fetch stores:", error);
      }
    };
    fetchStores();
  }, [storeDataVersion]);

  // Effect for fetching Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log("Admin Dashboard: Fetching products...");
        const response = await getAllFoodItems();
        const dataArr = Array.isArray(response) ? response : (response?.data && Array.isArray(response.data) ? response.data : []);

        const mappedData = dataArr.map((item) => {
          // Identify category ID and Name correctly from various API response formats
          const catId = item.categoryId || (typeof item.category === 'object' ? item.category?._id : item.category);
          const catName = item.categoryName || (typeof item.category === 'object' ? item.category?.name : null);

          return {
            ...item,
            id: item._id,
            name: item.name || item.productName || "Unnamed Product",
            store: item.storeName || item.storeId?.storeName || item.restaurantId?.restaurantsName || item.restaurantId?.storeName || "N/A",
            categoryId: catId,
            categoryName: catName,
            description: item.description || "No description",
            maxQuantity: item.maxQuantity || 0,
            quantity: item.quantity || 0,
            image: item.image || (item.images && item.images[0]) || null,
            // Force strict boolean for availability
            isAvailable: item.isAvailable === true || item.isAvailable === "true" || item.isAvailable === undefined,
          };
        });

        setProductsData(mappedData);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, [productDataVersion]);

  // Effect for fetching Orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getAdminOrders({ limit: 1000 });
        const formattedOrders = response.data.map((order) => {
          // Support both new structure (vendorOrders) and old structure (items)
          const legacyItems = order.items || [];
          const vendorItems = order.vendorOrders?.flatMap(vo =>
            (vo.items || []).map(item => ({
              ...item,
              storeName: vo.storeName || item.storeName // Prefer parent storeName if available
            }))
          ) || [];
          const allItems = vendorItems.length > 0 ? vendorItems : legacyItems;

          const items = allItems.map((item) => ({
            name: item.productName || item.name || "N/A",
            price: item.price || 0,
            quantity: item.quantity,
            storeName: item.storeName || "N/A",
            isBulk: item.isBulk || false,
          }));

          const normalItems = items.filter(i => !i.isBulk);
          const bulkItems = items.filter(i => i.isBulk);

          const normalFoodItemDisplay = normalItems
            .map((item) => `${item.name} (x${item.quantity})`)
            .join(", ");

          const bulkFoodItemDisplay = bulkItems
            .map((item) => `${item.name} (x${item.quantity})`)
            .join(", ");

          const storeNames = [
            ...new Set(items.map((i) => i.storeName)),
          ].join(", ");

          const totalAmountVal = items.reduce(
            (sum, i) => sum + i.price * i.quantity,
            0
          );

          const normalAmountVal = normalItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
          const bulkAmountVal = bulkItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

          return {
            ...order,
            id: order._id,
            orderDisplayId: order.orderId || order._id,
            userId: order.userId?._id || null,
            customerName:
              order.userId?.fullName || order.userId?.email || "Guest",
            address: order.address || "N/A",
            items: items,
            foodItemDisplay: items.map((item) => `${item.name} (x${item.quantity})`).join(", "),
            normalFoodItemDisplay,
            bulkFoodItemDisplay,
            storeName: storeNames,
            amount: `₹${totalAmountVal.toFixed(2)}`,
            normalAmount: `₹${normalAmountVal.toFixed(2)}`,
            bulkAmount: `₹${bulkAmountVal.toFixed(2)}`,
            hasNormalItems: normalItems.length > 0,
            hasBulkItems: bulkItems.length > 0,
            status: order.orderStatus || "Pending",
            transportMode: order.transportMode || "N/A",
            isBulkOrder: order.isBulkOrder || false,
            createdAt: new Date(order.createdAt),
            createdAtFormatted: new Date(order.createdAt).toLocaleString("en-IN"),
          };
        });
        setOrdersData(formattedOrders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };
    fetchOrders();
  }, [orderDataVersion]);

  // Effect for fetching Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsersData(
          response.data.map((user) => ({
            ...user,
            id: user._id,
            name: user.fullName || "N/A",
            createdAt: new Date(user.createdAt).toLocaleDateString("en-IN"),
            rawDate: user.createdAt,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchUsers();
  }, [userDataVersion]);

  // Effect for fetching Banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await getAllBanners();
        setBannersData(response.data.map(b => ({
          ...b,
          id: b._id,
          storeName: b.storeId?.storeName || (b.productId?.storeId?.storeName) || "N/A",
          targetType: b.productId ? "Product" : "Store",
          targetName: b.productId ? (b.productId.productName || b.productId.name) : (b.storeId?.storeName || "N/A")
        })));
      } catch (error) {
        console.error("Failed to fetch banners:", error);
      }
    };
    fetchBanners();
  }, [bannerDataVersion]);

  // Effect for fetching Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCategories();
        const dataArr = Array.isArray(response) ? response : (response?.data && Array.isArray(response.data) ? response.data : []);
        setCategoriesData(dataArr.map(c => ({ ...c, id: c._id })));
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, [categoryDataVersion]);

  // Effect for fetching Landowner Enquiries
  useEffect(() => {
    const fetchLandownerEnquiries = async () => {
      try {
        const response = await getAllLandownerEnquiries();
        const dataArr = response.data || [];
        setLandownerEnquiriesData(
          dataArr.map((item) => ({
            ...item,
            id: item._id,
            landLocation: item.landDetails?.location || "N/A",
            landArea: item.landDetails?.areaSize || "N/A",
            crops: item.landDetails?.crops || "N/A",
            landImages: item.landDetails?.images || [],
            applicantName: item.contactInformation?.name || "N/A",
            applicantPhone: item.contactInformation?.phoneNumber || "N/A",
            applicantEmail: item.contactInformation?.email || "N/A",
            dateSubmitted: new Date(item.createdAt).toLocaleDateString("en-IN"),
          }))
        );
      } catch (error) {
        console.error("Failed to fetch landowner enquiries:", error);
      }
    };
    fetchLandownerEnquiries();
  }, [landownerDataVersion]);



  // --- Handlers ---

  /**
   * 🚀 NEW HANDLER to fetch shipping options for a given order ID.
   */
  const handleFetchShipping = async (orderId) => {
    try {
      console.log(`Attempting to fetch shipping options for Order ID: ${orderId}`);

      const response = await fetchShippingOptions(orderId);

      console.log(`Shipping options for Order ID ${orderId}:`, response);
      alert(`✅ Successfully fetched shipping options for Order ID: ${orderId}. Check console for details.`);

    } catch (error) {
      console.error(`❌ Failed to fetch shipping options for Order ID ${orderId}:`, error);
      alert(`❌ Failed to fetch shipping options for Order ID: ${orderId}. Error: ${error.message}`);
    }
  };




  const handleEdit = (item, type) => {
    if (
      type === "order" &&
      (item.status === "Cancelled" || item.status === "Pending")
    ) {
      alert(`${item.status} orders cannot be edited.`);
      return;
    }
    setCurrentItem(item);
    if (type === "product") setShowEditProductModal(true);
    if (type === "store") setShowEditStoreModal(true);
    if (type === "order") setShowEditOrderModal(true);
    if (type === "banner") setShowEditBannerModal(true);

    if (type === "category") setShowEditCategoryModal(true);
  };

  const handleDelete = (item, type) => {
    setCurrentItem({ ...item, type });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!currentItem?.id) {
      console.error("confirmDelete: No item ID found", currentItem);
      return;
    }
    console.log(`confirmDelete: Deleting ${currentItem.type} with ID: ${currentItem.id}`);
    try {
      switch (currentItem.type) {
        case "product":
          await deleteFoodItem(currentItem.id);
          setProductDataVersion((v) => v + 1);
          break;
        case "store":
          await deleteStore(currentItem.id);
          setStoreDataVersion((v) => v + 1);
          break;
        case "order":
          await deleteOrder(currentItem.id);
          setOrderDataVersion((v) => v + 1);
          break;
        case "user":
          await deleteUser(currentItem.id);
          setUserDataVersion((v) => v + 1);
          break;
        case "banner":
          await deleteBanner(currentItem.id);
          setBannerDataVersion((v) => v + 1);
          break;

          break;
        case "category":
          await deleteCategory(currentItem.id);
          setCategoryDataVersion((v) => v + 1);
          break;
        case "landowner":
          await deleteLandownerEnquiry(currentItem.id);
          setLandownerDataVersion((v) => v + 1);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
    } finally {
      setShowDeleteModal(false);
      setCurrentItem(null);
    }
  };

  const handleAcceptOrderItems = async (orderId, storeId, itemIds, deliveryDate) => {
    try {
      await updateAdminOrderItemStatus(orderId, storeId, itemIds, deliveryDate);
      alert("✅ Items accepted successfully!");
      setOrderDataVersion((v) => v + 1);
      setShowOrderDetailsModal(false);
      setCurrentItem(null);
    } catch (error) {
      console.error("❌ Failed to accept items:", error);
      alert("❌ Failed to accept items: " + (error.response?.data?.msg || error.message));
    }
  };

  const handleToggleProductAvailability = async (id) => {
    try {
      await toggleProductAvailability(id);
      setProductDataVersion((v) => v + 1);
    } catch (error) {
      console.error("❌ Failed to toggle product availability:", error);
      alert("❌ Failed to toggle availability: " + (error.response?.data?.msg || error.message));
    }
  };

  const handleAddOrUpdate = async (itemData, type, imageFile = null) => {
    console.log(`handleAddOrUpdate: ${type}`, itemData);
    try {
      let submissionData;

      const cleanData = {};
      const skipFields = ['_id', 'id', 'createdAt', 'updatedAt', '__v', 'store', 'storeNameFormatted', 'image'];

      Object.keys(itemData).forEach(key => {
        // Skip internal/computed fields AND skip 'image' entirely here (we handle it via imageFile)
        if (!skipFields.includes(key)) {
          let value = itemData[key];

          // For banners, we want to keep null values so they can be sent to reset fields
          if (type === "banner") {
            // Keep the value as is (null or otherwise)
          } else {
            // Original behavior for other types: skip null/undefined
            if (value === null || value === undefined) return;
          }

          // Handle populated objects
          if (typeof value === 'object' && value !== null && value._id) {
            value = value._id;
          }
          cleanData[key] = value;
        }
      });

      if (imageFile || type === "banner") {
        const formData = new FormData();
        Object.keys(cleanData).forEach(key => {
          let value = cleanData[key];
          if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        });
        if (imageFile) {
          formData.append("image", imageFile);
        }
        submissionData = formData;
      } else {
        submissionData = cleanData;
      }

      if (type === "product") {
        await (itemData.id
          ? updateFoodItem(itemData.id, submissionData)
          : addFoodItem(submissionData));
        setProductDataVersion((v) => v + 1);
        setCategoryDataVersion((v) => v + 1); // Also refresh categories in case a new one was created
      } else if (type === "store") {
        await (itemData.id
          ? updateStore(itemData.id, submissionData)
          : addStores(submissionData));
        setStoreDataVersion((v) => v + 1);
      } else if (type === "order") {
        await updateOrder(itemData.id, { status: itemData.status });
        setOrderDataVersion((v) => v + 1);
      } else if (type === "banner") {
        await (itemData.id
          ? updateBanner(itemData.id, submissionData)
          : addBanner(submissionData));
        setBannerDataVersion((v) => v + 1);
      } else if (type === "category") {
        await (itemData.id
          ? updateCategory(itemData.id, submissionData)
          : addCategory(submissionData));
        setCategoryDataVersion((v) => v + 1);

      }
    } catch (error) {
      console.error(`Failed to save ${type}:`, error);
    }
    setShowAddProductModal(false);
    setShowEditProductModal(false);
    setShowAddStoreModal(false);
    setShowEditStoreModal(false);
    setShowEditOrderModal(false);
    setShowAddBannerModal(false);
    setShowEditBannerModal(false);
    setShowAddCategoryModal(false);
    setShowEditCategoryModal(false);

    setCurrentItem(null);
  };







  // --- UI Data & Helpers ---
  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "stores", label: "Stores", icon: Store },
    { id: "products", label: "Products", icon: Sprout },
    { id: "categories", label: "Categories", icon: Layers },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "bulk", label: "Bulk Orders", icon: Package },
    { id: "users", label: "Users", icon: Users },
    { id: "banners", label: "Banners", icon: ImageIcon },
    { id: "landowner", label: "Landowner Enquiries", icon: TreePine },
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = [
    { title: "Total Orders", value: ordersData.length, tab: "orders" },
    { title: "Today's Orders", value: ordersData.filter(o => new Date(o.createdAt) >= today).length, tab: "orders" },
    { title: "Regular Orders", value: ordersData.filter(o => !o.isBulkOrder).length, tab: "orders" },
    { title: "Bulk Orders", value: ordersData.filter(o => o.isBulkOrder === true).length, tab: "bulk" },
    { title: "Stores", value: storesData.length, tab: "stores" },
    { title: "Products", value: productsData.length, tab: "products" },
    { title: "Categories", value: categoriesData.length, tab: "categories" },
    { title: "Users", value: usersData.length, tab: "users" },
  ];

  const recentOrders = ordersData.slice(0, 5);

  const getStatusBadge = (status) => {
    const statusColors = {
      delivered: "bg-green-100 text-green-800",
      accepted: "bg-indigo-100 text-indigo-800",
      preparing: "bg-yellow-100 text-yellow-800",
      pending: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
      rejected: "bg-red-100 text-red-800",
      "partially accepted": "bg-purple-100 text-purple-800",
      "partially rejected": "bg-emerald-100 text-emerald-800",
      "partially cancelled": "bg-rose-100 text-rose-800",
      active: "bg-green-100 text-green-800",
      true: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      false: "bg-red-100 text-red-800",
      approved: "bg-green-100 text-green-800",
    };

    const normalizedStatus = status === undefined || status === null ? "" : String(status).toLowerCase();

    return `px-3 py-1 rounded-full text-sm font-medium ${statusColors[normalizedStatus] || "bg-gray-100 text-gray-800"
      }`;
  };

  // --- Content Renderer ---
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardView
            stats={stats}
            recentOrders={recentOrders}
            getStatusBadge={getStatusBadge}
            onStatClick={(tab) => setActiveTab(tab)}
          />
        );
      case "stores":
        return (
          <TableView
            title="Stores"
            data={filteredStoresData}
            searchTerm={storeSearchTerm}
            onSearchChange={setStoreSearchTerm}
            columns={["Store", "Business Name", "Owner", "Email", "Mobile"]}
            dataKeys={["storeName", "businessName", "ownerName", "email", "mobileNumber"]}
            onAdd={() => {
              setCurrentItem(null);
              setShowAddStoreModal(true);
            }}
            onEdit={(item) => handleEdit(item, "store")}
            onDelete={(item) => handleDelete(item, "store")}
            onViewDetails={(item) => {
              setSelectedStore(item);
              setShowStoreDetailModal(true);
            }}
          />
        );
      case "products":
        return (
          <TableView
            title="Products"
            data={filteredProducts}
            columns={[
              "Image",
              "Product",
              "Store",
              "Category",
              "Price",
              "Stock",
              "Max Qty",
              "Bulk Limit",
              "Status"
            ]}
            dataKeys={[
              "image",
              "name",
              "storeNameFormatted",
              "categoryNameFormatted",
              "price",
              "quantity",
              "maxQuantity",
              "bulkThreshold",
              "isAvailable"
            ]}
            statusKey="isAvailable"
            getStatusBadge={getStatusBadge}
            onToggleAvailability={handleToggleProductAvailability}
            onAdd={() => {
              setCurrentItem(null);
              setShowAddProductModal(true);
            }}
            onEdit={(item) => handleEdit(item, "product")}
            onDelete={(item) => handleDelete(item, "product")}
            showExport={true}
            filterCategories={categoriesData}
            activeCategory={productCategoryFilter}
            onCategoryChange={setProductCategoryFilter}
            showStatusFilter={true}
            activeStatus={productStatusFilter}
            onStatusChange={setProductStatusFilter}
          />
        );
      case "categories":
        return (
          <TableView
            title="Categories"
            data={categoriesData}
            columns={["Category Name", "Image"]}
            dataKeys={["name", "image"]}
            onAdd={() => {
              setCurrentItem(null);
              setShowAddCategoryModal(true);
            }}
            onEdit={(item) => handleEdit(item, "category")}
            onDelete={(item) => handleDelete(item, "category")}
            isImageTable={true}
          />
        );
      case "orders":
        return (
          <TableView
            title="Orders"
            data={filteredOrdersData}
            searchTerm={orderSearchTerm}
            onSearchChange={setOrderSearchTerm}
            columns={[
              "Order ID",
              "Customer",
              "Store",
              "Address",
              "Food Item",
              "Amount",
              "Transport",
              "Status",
              "Date",
            ]}
            dataKeys={[
              "orderDisplayId",
              "customerName",
              "storeName",
              "address",
              "foodItemDisplay",
              "amount",
              "transportMode",
              "status",
              "createdAtFormatted",
            ]}
            statusKey="status"
            getStatusBadge={getStatusBadge}
            onDelete={(item) => handleDelete(item, "order")}
            onViewDetails={(item) => {
              setCurrentItem(item);
              setShowOrderDetailsModal(true);
            }}
            showDateFilter={true}
            dateFilterValue={reportDate}
            onDateFilterChange={setReportDate}
          />
        );
      case "users":
        return (
          <TableView
            title="Users"
            data={filteredUsersData}
            searchTerm={userSearchTerm}
            onSearchChange={setUserSearchTerm}
            columns={["Name", "Email", "Phone", "Registered"]}
            dataKeys={["fullName", "email", "phoneNumber", "createdAt"]}
            onDelete={(item) => handleDelete(item, "user")}
            showDateFilter={true}
            dateFilterValue={userDateFilter}
            onDateFilterChange={setUserDateFilter}
          />
        );
      case "banners":
        return (
          <TableView
            title="Banners"
            data={filteredBannersData}
            searchTerm={bannerSearchTerm}
            onSearchChange={setBannerSearchTerm}
            columns={["Banner Image", "Type", "Name"]}
            dataKeys={["image", "targetType", "targetName"]}
            onAdd={() => {
              setCurrentItem(null);
              setShowAddBannerModal(true);
            }}
            onEdit={(item) => handleEdit(item, "banner")}
            onDelete={(item) => handleDelete(item, "banner")}
            isImageTable={true}
          />
        );
      case "landowner":
        return (
          <TableView
            title="Landowner Enquiries"
            data={filteredLandownerData}
            searchTerm={landownerSearchTerm}
            onSearchChange={setLandownerSearchTerm}
            columns={["Name", "Phone", "Email", "Option", "Location", "Area", "Crops", "Date"]}
            dataKeys={["applicantName", "applicantPhone", "applicantEmail", "partnershipOption", "landLocation", "landArea", "crops", "dateSubmitted"]}
            onViewDetails={(item) => {
              setCurrentItem(item);
              setShowLandownerDetailModal(true);
            }}
            onDelete={(item) => handleDelete(item, "landowner")}
          />
        );
      case "bulk":
        return (
          <TableView
            title="Bulk Orders"
            data={filteredBulkOrdersData}
            searchTerm={bulkSearchTerm}
            onSearchChange={setBulkSearchTerm}
            columns={[
              "Order ID",
              "Customer",
              "Store",
              "Address",
              "Food Item",
              "Amount",
              "Transport",
              "Status",
              "Date",
            ]}
            dataKeys={[
              "orderDisplayId",
              "customerName",
              "storeName",
              "address",
              "foodItemDisplay",
              "amount",
              "transportMode",
              "status",
              "createdAtFormatted",
            ]}
            statusKey="status"
            getStatusBadge={getStatusBadge}
            onDelete={(item) => handleDelete(item, "order")}
            onViewDetails={(item) => {
              setCurrentItem(item);
              setShowOrderDetailsModal(true);
            }}
            showDateFilter={true}
            dateFilterValue={bulkDateFilter}
            onDateFilterChange={setBulkDateFilter}
          />
        );



      default:
        return (
          <div className="text-center p-10 text-gray-500">
            Content for {activeTab} coming soon...
          </div>
        );
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      <Sidebar
        sidebarItems={sidebarItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="lg:ml-64">
        <Header activeTab={activeTab} setSidebarOpen={setSidebarOpen} />
        <main className="p-4 sm:p-6">{renderContent()}</main>
      </div>

      <BannerModal
        isOpen={showAddBannerModal || showEditBannerModal}
        onClose={() => {
          setShowAddBannerModal(false);
          setShowEditBannerModal(false);
          setCurrentItem(null);
        }}
        banner={currentItem}
        onSave={(file, metadata) => handleAddOrUpdate({ ...(currentItem || {}), ...metadata }, "banner", file)}
        stores={storesData}
        products={productsData}
      />
      <CategoryModal
        isOpen={showAddCategoryModal || showEditCategoryModal}
        onClose={() => {
          setShowAddCategoryModal(false);
          setShowEditCategoryModal(false);
          setCurrentItem(null);
        }}
        category={currentItem}
        onSave={(data, file) => handleAddOrUpdate({ ...(currentItem || {}), ...data }, "category", file)}
      />


      {/* MODAL USAGES - Require definitions */}
      <ProductModal
        isOpen={showAddProductModal || showEditProductModal}
        onClose={() => {
          setShowAddProductModal(false);
          setShowEditProductModal(false);
          setCurrentItem(null);
        }}
        product={currentItem}
        onSave={(p, f) => handleAddOrUpdate({ ...p, id: currentItem?.id }, "product", f)}
        stores={storesData}
        categories={categoriesData}
      />
      <StoreModal
        isOpen={showAddStoreModal || showEditStoreModal}
        onClose={() => {
          setShowAddStoreModal(false);
          setShowEditStoreModal(false);
          setCurrentItem(null);
        }}
        store={currentItem}
        onSave={() => {
          setStoreDataVersion((v) => v + 1);
          setShowAddStoreModal(false);
          setShowEditStoreModal(false);
          setCurrentItem(null);
        }}
      />
      <OrderDetailsModal
        isOpen={showOrderDetailsModal}
        onClose={() => {
          setShowOrderDetailsModal(false);
          setCurrentItem(null);
        }}
        order={currentItem}
        onAcceptItems={handleAcceptOrderItems}
      />
      <LandownerEnquiryDetailModal
        isOpen={showLandownerDetailModal}
        onClose={() => {
          setShowLandownerDetailModal(false);
          setCurrentItem(null);
        }}
        enquiry={currentItem}
        onDelete={handleDelete}
      />
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        itemName={
          currentItem?.storeName ||
          currentItem?.name ||
          currentItem?.fullName ||
          currentItem?.id
        }
      />


      <StoreDetailModal
        isOpen={showStoreDetailModal}
        onClose={() => {
          setShowStoreDetailModal(false);
          setSelectedStore(null);
        }}
        store={selectedStore}
        products={productsData.filter(p => (p.storeId?._id || p.storeId) === (selectedStore?._id || selectedStore?.id))}
      />
    </div>
  );
};

// ====================================================================
// --- SUB-COMPONENTS (Now imported) ---
// ====================================================================



// Views and Tables are now imported

// ====================================================================
// --- MODAL PLACEHOLDERS --- (Added to resolve the ReferenceError)
// ====================================================================


// Modals are now imported


// Store modals are now imported

















// All modals are now imported from the components directory

// CarouselModal removed

// --- END MODAL PLACEHOLDERS ---
// ====================================================================

export default AdminDashboard;
