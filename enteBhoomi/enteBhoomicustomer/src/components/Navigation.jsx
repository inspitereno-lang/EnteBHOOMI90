import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Heart,
  ShoppingCart,
  Bell,
  MapPin,
  ChevronDown,
  User,
  Menu,
  X
} from 'lucide-react';
import { getCurrentPosition, getAddressFromCoords } from '../services/locationService';
import { useStore } from '../context/StoreContext.jsx';
import { Input } from './ui/input.jsx';
import { Button } from './ui/button.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu.jsx';
import { searchProductsApi, fetchAllProductsApi } from '../services/productService';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ products: [], stores: [] });
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [allStores, setAllStores] = useState([]);
  const { logout, cartCount, wishlist, isLoggedIn, isRegistered, deliveryLocation, setDeliveryLocation } = useStore();
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetchAllProductsApi();
        if (response?.filters?.stores) {
          setAllStores(response.filters.stores);
        }
      } catch (error) {
        console.error("Failed to load stores for search", error);
      }
    };
    fetchStores();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Robust hash scrolling logic with retry mechanism for cross-page navigation
  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash === '#landowners') {
        let attempts = 0;
        const maxAttempts = 50; // Try for up to 5 seconds

        const tryScroll = () => {
          const element = document.getElementById('landowners');
          if (element) {
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
            return true;
          }
          return false;
        };

        // If it doesn't find it immediately, poll for it
        if (!tryScroll()) {
          const intervalId = setInterval(() => {
            attempts++;
            if (tryScroll() || attempts >= maxAttempts) {
              clearInterval(intervalId);
            }
          }, 100);
        }
      }
    };

    // Handle initial load and hash changes
    handleHashScroll();
    window.addEventListener('hashchange', handleHashScroll);
    return () => window.removeEventListener('hashchange', handleHashScroll);
  }, [location.hash, location.pathname]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          // 1. Client-side store search
          const matchedStores = allStores.filter(store =>
            store.name.toLowerCase().includes(searchQuery.toLowerCase())
          ).slice(0, 3);

          // 2. Backend product search
          const productResponse = await searchProductsApi(searchQuery);
          const matchedProducts = productResponse?.data?.slice(0, 5) || [];

          setSearchResults({
            stores: matchedStores,
            products: matchedProducts
          });
          setShowSearchResults(true);
        } catch (error) {
          console.error("Search error:", error);
        }
      } else {
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, allStores]);

  // Body scroll lock effect
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchResults(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleProductClick = (productId) => {
    setShowSearchResults(false);
    navigate(`/product/${productId}`);
  };

  const handleStoreClick = (storeId) => {
    setShowSearchResults(false);
    navigate(`/products?storeId=${storeId}`);
  };

  const navLinks = [
    { label: 'Home', path: '/', icon: 'home', desc: 'Return to home' },
    { label: 'Products', path: '/products', icon: 'local_mall', desc: 'Browse fresh picks' },
    { label: 'Services', path: '/#landowners', icon: 'handshake', desc: 'Landowner models' },
    { label: 'About', path: '/about', icon: 'info', desc: 'Our mission' },
    { label: 'Orders', path: '/orders', icon: 'receipt_long', desc: 'Track purchases' },
    { label: 'Contact', path: '/contact', icon: 'mail', desc: 'Get in touch' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? 'glass-nav shadow-lg shadow-black/5'
        : 'bg-white'
        }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-20">
          <Link
            to="/"
            className="flex items-center gap-3 h-12 group shrink-0"
          >
            <img 
              src="/ente-bhoomi-logo.png" 
              alt="Ente Bhoomi Logo" 
              className="h-16 w-16 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-md"
            />
            <h2 className="text-2xl font-bold text-[#5bab00] transition-colors">Ente Bhoomi</h2>
          </Link>

          {/* Desktop Nav links removed in favor of Menu button */}

          {/* Location section removed as requested */}

          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl mx-8"
          >
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999999] transition-colors group-focus-within:text-[#5bab00]" />
              <Input
                type="text"
                placeholder="Search for pickles, chutneys, dry fruits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2) setShowSearchResults(true);
                }}
                onBlur={() => {
                  // Delay hide to allow clicks on dropdown
                  setTimeout(() => setShowSearchResults(false), 200);
                }}
                className="w-full pl-12 pr-4 py-3 h-12 bg-[#F5F5F5] border-none rounded-xl focus:ring-2 focus:ring-[#5bab00]/20 focus:bg-white transition-all duration-300"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#5bab00] text-white rounded-lg hover:bg-[#468a00] transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Search Results Dropdown */}
              {showSearchResults && (searchResults.stores.length > 0 || searchResults.products.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-[#E5E5E5] overflow-hidden z-50 max-h-[400px] overflow-y-auto">
                  {searchResults.stores.length > 0 && (
                    <div className="p-2">
                      <h3 className="text-xs font-semibold text-[#666666] px-3 py-2 uppercase tracking-wider">Stores</h3>
                      {searchResults.stores.map(store => (
                        <div
                          key={store._id}
                          onClick={() => handleStoreClick(store._id)}
                          className="flex items-center gap-3 p-3 hover:bg-[#F5F5F5] rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="w-8 h-8 bg-[#f1f7e8] rounded-full flex items-center justify-center text-[#5bab00]">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-[#1A1A1A]">{store.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.products.length > 0 && (
                    <div className="p-2 border-t border-[#E5E5E5]">
                      <h3 className="text-xs font-semibold text-[#666666] px-3 py-2 uppercase tracking-wider">Products</h3>
                      {searchResults.products.map(product => (
                        <div
                          key={product._id}
                          onClick={() => handleProductClick(product._id)}
                          className="flex items-center gap-3 p-3 hover:bg-[#F5F5F5] rounded-lg cursor-pointer transition-colors"
                        >
                          <img
                            src={product.image || '/product-placeholder.png'}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover bg-[#F5F5F5]"
                            onError={(e) => { e.target.src = '/product-placeholder.png'; }}
                          />
                          <div>
                            <p className="font-medium text-[#1A1A1A] line-clamp-1">{product.name}</p>
                            <p className="text-xs text-[#666666]">{product.storeName}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Desktop Menu Button */}


            <button
              onClick={() => {
                if (!isRegistered) {
                  toast.error('Please login to view wishlist');
                  navigate('/login');
                  return;
                }
                navigate('/wishlist');
              }}
              className="relative p-2.5 text-[#666666] hover:text-[#5bab00] hover:bg-[#f1f7e8] rounded-xl transition-all duration-300"
            >
              <Heart className="w-5 h-5" />
              {isRegistered && wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#5bab00] text-white text-xs font-medium rounded-full flex items-center justify-center animate-scale-in">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                if (!isRegistered) {
                  toast.error('Please login to view cart');
                  navigate('/login');
                  return;
                }
                navigate('/cart');
              }}
              className="relative p-2.5 text-[#666666] hover:text-[#5bab00] hover:bg-[#f1f7e8] rounded-xl transition-all duration-300"
            >
              <ShoppingCart className="w-5 h-5" />
              {isRegistered && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#5bab00] text-white text-xs font-medium rounded-full flex items-center justify-center animate-scale-in">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`${isRegistered ? 'flex' : 'hidden md:flex'} px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition-all duration-300 items-center gap-2 font-bold shadow-sm ${isMobileMenuOpen
                ? 'bg-[#5bab00] text-white'
                : 'bg-[#f1f7e8] text-[#5bab00] hover:bg-[#e4efd4]'
                }`}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
              <span className="hidden md:inline">Menu</span>
            </button>

            {!isRegistered && (
              <Button
                onClick={() => navigate('/login')}
                className="btn-primary"
              >
                Login
              </Button>
            )}

          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999999]" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 h-12 bg-[#F5F5F5] border-none rounded-xl"
            />
          </div>
        </form>
      </div>

      {
        isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-t border-[#E5E5E5] animate-slide-up shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-y-auto max-h-[calc(100dvh-80px)] scrollbar-hide">
            <div className="section-container py-6 lg:py-12">
              {/* Desktop Premium Grid - Hidden on mobile */}
              <div className="hidden lg:grid grid-cols-3 gap-8">
                {navLinks.map((link, index) => {
                  const isHash = link.path.startsWith('/#');
                  const targetId = isHash ? link.path.substring(2) : null;

                  const handleClick = (e) => {
                    if (isHash && location.pathname === '/') {
                      e.preventDefault();
                      const element = document.getElementById(targetId);
                      if (element) {
                        const headerOffset = 100;
                        const elementPosition = element.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                        setIsMobileMenuOpen(false);
                      }
                    } else {
                      setIsMobileMenuOpen(false);
                    }
                  };

                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={handleClick}
                      className={`group flex items-start gap-5 p-6 rounded-2xl transition-all duration-300 hover:bg-[#f1f7e8] bg-[#fafafa] border border-transparent hover:border-[#5bab00]/20 animate-fade-in`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="size-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#5bab00] group-hover:scale-110 transition-transform duration-300">
                        <span className="material-symbols-outlined text-2xl">{link.icon}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className={`text-lg font-black transition-colors ${location.pathname === link.path || (isHash && location.pathname === '/' && location.hash === `#${targetId}`)
                          ? 'text-[#5bab00]'
                          : 'text-[#1A1A1A] group-hover:text-[#5bab00]'
                          }`}>
                          {link.label}
                        </span>
                        <span className="text-sm text-[#666666] font-medium leading-tight">
                          {link.desc}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Classic List - Visible only on mobile */}
              <div className="flex lg:hidden flex-col gap-1">
                {navLinks.map((link) => {
                  const isHash = link.path.startsWith('/#');
                  const targetId = isHash ? link.path.substring(2) : null;

                  const handleClick = (e) => {
                    if (isHash && location.pathname === '/') {
                      e.preventDefault();
                      const element = document.getElementById(targetId);
                      if (element) {
                        const headerOffset = 100;
                        const elementPosition = element.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                        setIsMobileMenuOpen(false);
                      }
                    } else {
                      setIsMobileMenuOpen(false);
                    }
                  };

                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={handleClick}
                      className={`px-4 py-4 text-lg font-bold transition-colors rounded-xl ${location.pathname === link.path || (isHash && location.pathname === '/' && location.hash === `#${targetId}`)
                        ? 'bg-[#f1f7e8] text-[#5bab00]'
                        : 'text-[#1A1A1A] hover:bg-[#F5F5F5]'
                        }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {!isRegistered && (
                <div className="mt-8 lg:mt-12 flex flex-col items-center justify-center p-6 lg:p-8 rounded-3xl bg-gradient-to-br from-[#f2f7ed] to-white border border-[#5bab00]/10 text-center">
                  <h3 className="text-lg lg:text-xl font-black text-[#151d0c] mb-2">Ready to start your journey?</h3>
                  <p className="hidden md:block text-[#4b5f3e] mb-6 max-w-md">Join Ente Bhoomi today for a premium agricultural experience.</p>
                  <Button
                    onClick={() => {
                      navigate('/login');
                      setIsMobileMenuOpen(false);
                    }}
                    className="btn-primary w-full md:w-auto px-12 h-14 text-lg"
                  >
                    Get Started Now
                  </Button>
                </div>
              )}

              {isRegistered && (
                <div className="mt-8 lg:mt-12 border-t pt-8 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-4 hover:bg-[#f1f7e8] rounded-xl transition-colors text-base lg:text-sm font-bold text-[#1A1A1A]"
                  >
                    <User className="w-5 h-5 text-[#5bab00]" /> Account Settings
                  </Link>
                  <Link
                    to="/addresses"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-4 hover:bg-[#f1f7e8] rounded-xl transition-colors text-base lg:text-sm font-bold text-[#1A1A1A]"
                  >
                    <MapPin className="w-5 h-5 text-[#5bab00]" /> Saved Addresses
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      toast.success('Logged out successfully');
                      navigate('/');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 p-4 hover:bg-[#FFF3ED] rounded-xl transition-colors text-base lg:text-sm font-bold text-red-600"
                  >
                    <X className="w-5 h-5" /> Logout Account
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      }
    </nav >
  );
}
