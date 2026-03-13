import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext.jsx';
import Navigation from './components/Navigation.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import CartPage from './pages/CartPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import OrderDetailPage from './pages/OrderDetailPage.jsx';
import PaymentSuccessPage from './pages/PaymentSuccessPage.jsx';
import PaymentFailurePage from './pages/PaymentFailurePage.jsx';
import AddressesPage from './pages/AddressesPage.jsx';
import AddAddressPage from './pages/AddAddressPage.jsx';
import EditProfilePage from './pages/EditProfilePage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';
import ReferEarnPage from './pages/ReferEarnPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import BulkOrderSuccessPage from './pages/BulkOrderSuccessPage.jsx';
import MixedOrderSuccessPage from './pages/MixedOrderSuccessPage.jsx';
import { Toaster } from './components/ui/sonner.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

function AppContent() {
  /* 
   * Navigation is now handled by react-router-dom <Routes>
   */

  const location = useLocation();
  const showNav = location.pathname !== '/login' && !location.pathname.startsWith('/admin');
  const showFooter = location.pathname !== '/login' && !location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <ScrollToTop />
      {showNav && <Navigation />}
      <main className={showNav ? 'pt-36 md:pt-20' : ''}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/order/:orderId" element={<OrderDetailPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/payment-failure" element={<PaymentFailurePage />} />
          <Route path="/bulk-order-success" element={<BulkOrderSuccessPage />} />
          <Route path="/mixed-order-success" element={<MixedOrderSuccessPage />} />
          <Route path="/addresses" element={<AddressesPage />} />
          <Route path="/add-address" element={<AddAddressPage />} />
          <Route path="/edit-profile" element={<EditProfilePage />} />
          <Route path="/rewards" element={<RewardsPage />} />
          <Route path="/refer-earn" element={<ReferEarnPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/*" element={<AdminRedirect />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
      <Toaster position="top-center" />
    </div>
  );
}

function AdminRedirect() {
  useEffect(() => {
    const adminBaseUrl = import.meta.env.VITE_ADMIN_BASE_URL || 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5174'
        : 'https://ente-bhoomi-ui.vercel.app');

    // Preserve the path and query parameters
    const path = window.location.pathname;
    const search = window.location.search;
    
    window.location.href = `${adminBaseUrl}${path}${search}`;
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAFA] text-[#5bab00]">
      <div className="w-12 h-12 border-4 border-[#5bab00] border-t-transparent rounded-full animate-spin mb-4"></div>
      <h2 className="text-xl font-bold">Redirecting to Admin Panel...</h2>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </BrowserRouter>
  );
}

export default App;
