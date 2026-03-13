import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  MapPin,
  Plus,
  Minus,
  Trash2,
  Truck,
  Tag,
  ChevronRight,
  Package,
  AlertTriangle,
  CreditCard,
  ShoppingBag,
  Zap
} from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import { Button } from '../components/ui/button.jsx';
import { toast } from '../components/ui/sonner';
import { normalizeImageUrl } from '../utils/utils.js';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    cart,
    cartTotal,
    cartCount,
    updateQuantity,
    removeFromCart,
    addresses,
    placeOrder,
    isRegistered
  } = useStore();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [selectedAddress] = useState(
    addresses.find((a) => a.isDefault)?.id || addresses[0]?.id
  );
  const [transportMode, setTransportMode] = useState('Delivery Team');

  // Categorize items into regular and bulk using per-product threshold
  const regularItems = cart.filter(item => {
    const threshold = item.bulkThreshold || 20;
    return item.quantity <= threshold;
  });

  const bulkItems = cart.filter(item => {
    const threshold = item.bulkThreshold || 20;
    return item.quantity > threshold;
  });

  const hasBulkItems = bulkItems.length > 0;
  const hasRegularItems = regularItems.length > 0;

  // Calculate subtotals
  const regularSubtotal = regularItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 0
  );
  const bulkSubtotal = bulkItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 0
  );

  const deliveryFee = 0;
  const taxes = 0;
  const total = cartTotal + deliveryFee + taxes;

  const defaultAddress = addresses.find((a) => a.id === selectedAddress);

  const handlePlaceOrder = async () => {
    if (!isRegistered) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }
    if (!defaultAddress) {
      toast.error('Please add a delivery address');
      navigate('/add-address', { state: { returnTo: '/cart' } });
      return;
    }

    setIsPlacingOrder(true);
    try {
      const order = await placeOrder({
        items: cart,
        status: 'confirmed',
        subtotal: cartTotal,
        deliveryFee,
        taxes,
        total,
        paymentMethod: hasBulkItems ? 'Purchase Order' : 'Online Payment',
        transportMode,
        deliveryAddress: defaultAddress,
      });
      if (order.isBulk && hasRegularItems) {
        // Mixed order (Razorpay paid + Bulk items included)
        navigate('/mixed-order-success', { state: { orderId: order.id } });
      } else if (order.isBulk) {
        // Pure bulk order (Purchase Order)
        navigate('/bulk-order-success', { state: { orderId: order.id } });
      } else {
        // Pure regular order (Razorpay paid)
        navigate('/payment-success', { state: { orderId: order.id } });
      }
    } catch (error) {
      console.error('Order placement error:', error);
      if (error.message && (
        error.message.toLowerCase().includes('payment') ||
        error.message.toLowerCase().includes('cancel') ||
        error.message.toLowerCase().includes('verification')
      )) {
        navigate('/payment-failure');
      }
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Render a cart item row
  const renderCartItem = (item, index, isBulkSection = false) => (
    <div
      key={`${item.product?.id || item._id}-${index}`}
      className={`flex flex-col sm:flex-row gap-4 pb-6 border-b last:border-0 last:pb-0 ${isBulkSection ? 'border-amber-200' : 'border-[#E5E5E5]'
        }`}
    >
      <div className="flex gap-4">
        <div className="relative">
          <img
            src={normalizeImageUrl(item.product.image)}
            alt={item.product.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/product-placeholder.png';
            }}
            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-[#F5F5F5] flex-shrink-0"
          />
          {isBulkSection && (
            <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
              BULK
            </div>
          )}
        </div>
        <div className="flex-1 sm:hidden">
          <h3 className="font-medium text-[#1A1A1A] line-clamp-2 mb-1">
            {item.product.name}
          </h3>
          <p className="text-xs text-[#666666] mb-1">{item.product.shop}</p>
          <p className="text-sm font-bold text-[#5bab00]">
            ₹{item.product.price}
          </p>
        </div>
      </div>

      <div className="flex-1">
        <div className="hidden sm:block">
          <h3 className="font-medium text-[#1A1A1A] line-clamp-2 mb-1">
            {item.product.name}
          </h3>
          <p className="text-sm text-[#666666] mb-2">{item.product.shop}</p>
          <p className="text-sm text-[#5bab00] mb-3">
            ₹{item.product.price} per item
          </p>
        </div>

        <div className="flex items-center justify-between mt-2 sm:mt-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
              className="w-8 h-8 bg-[#F5F5F5] rounded-lg flex items-center justify-center hover:bg-[#f1f7e8] transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-medium">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
              className="w-8 h-8 bg-[#F5F5F5] rounded-lg flex items-center justify-center hover:bg-[#f1f7e8] transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className={`font-bold text-lg ${isBulkSection ? 'text-amber-600' : 'text-[#5bab00]'}`}>
              ₹{item.product.price * item.quantity}
            </span>
            <button
              onClick={() => removeFromCart(item.product.id)}
              className="w-8 h-8 bg-[#FFF3ED] rounded-lg flex items-center justify-center hover:bg-[#E85A24]/20 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-[#E85A24]" />
            </button>
          </div>
        </div>

        {isBulkSection && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5 w-fit">
            <AlertTriangle className="w-3 h-3" />
            Qty exceeds {item.bulkThreshold || 20} — processed as bulk enquiry
          </div>
        )}
      </div>
    </div>
  );

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-[#f1f7e8] rounded-full flex items-center justify-center mx-auto mb-6">
            <Truck className="w-12 h-12 text-[#5bab00]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Your cart is empty</h2>
          <p className="text-[#666666] mb-6">Add some products to get started</p>
          <Button onClick={() => navigate('/products')} className="btn-primary">
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="bg-white border-b border-[#E5E5E5]">
        <div className="section-container py-4">
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 text-[#666666] hover:text-[#5bab00] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Continue Shopping
          </button>
        </div>
      </div>

      <div className="section-container py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-8">
          Shopping Cart ({cartCount} items)
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ================= LEFT: ITEMS ================= */}
          <div className="lg:col-span-2 space-y-4">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#1A1A1A] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#5bab00]" />
                  Delivery Address
                </h3>
                <button
                  onClick={() => navigate('/addresses', { state: { from: 'cart' } })}
                  className="text-[#5bab00] text-sm font-medium hover:underline"
                >
                  Change
                </button>
              </div>
              {defaultAddress ? (
                <div className="p-4 bg-[#F5F5F5] rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-[#5bab00] text-white text-xs font-medium rounded-lg capitalize">
                      {defaultAddress.type}
                    </span>
                    {defaultAddress.isDefault && (
                      <span className="text-xs text-[#5bab00]">Default</span>
                    )}
                  </div>
                  <p className="text-[#1A1A1A]">{defaultAddress.fullAddress}</p>
                  {defaultAddress.landmark && (
                    <p className="text-sm text-[#666666] mt-1">
                      Landmark: {defaultAddress.landmark}
                    </p>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate('/add-address', { state: { returnTo: '/cart' } })}
                  className="w-full p-4 border-2 border-dashed border-[#E5E5E5] rounded-xl text-[#666666] hover:border-[#5bab00] hover:text-[#5bab00] transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Delivery Address
                </button>
              )}
            </div>

            {/* ================= REGULAR ITEMS SECTION ================= */}
            {hasRegularItems && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-[#f1f7e8] to-white border-b border-[#E5E5E5]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-[#1A1A1A] flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-[#5bab00]" />
                      Regular Items
                      <span className="text-xs bg-[#5bab00] text-white px-2 py-0.5 rounded-full">
                        {regularItems.length}
                      </span>
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm">
                      <CreditCard className="w-4 h-4 text-[#5bab00]" />
                      <span className="text-[#666666]">Pay via</span>
                      <span className="font-medium text-[#5bab00]">Razorpay</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {regularItems.map((item, index) => renderCartItem(item, index, false))}
                </div>
              </div>
            )}

            {/* ================= BULK ITEMS SECTION ================= */}
            {hasBulkItems && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border-2 border-amber-200">
                <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-amber-50/30 border-b border-amber-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                      <Package className="w-5 h-5 text-amber-600" />
                      Bulk Order Items
                      <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">
                        {bulkItems.length}
                      </span>
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Zap className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-700 font-medium">Purchase Order</span>
                    </div>
                  </div>
                </div>
                <div className="px-6 pt-3 pb-1">
                  <div className="p-3 bg-amber-50 rounded-xl flex items-start gap-3 text-xs text-amber-700 border border-amber-100">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>
                      These items exceed the bulk threshold. They'll be processed as a <strong>Purchase Order</strong> — our team will contact you to confirm pricing & delivery within 24 hours.
                    </span>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {bulkItems.map((item, index) => renderCartItem(item, index, true))}
                </div>
              </div>
            )}
          </div>

          {/* ================= RIGHT: ORDER SUMMARY ================= */}
          <div className="space-y-4">
            {/* Bill Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#5bab00]" />
                Bill Summary
              </h3>

              <div className="space-y-3 mb-4">
                {hasRegularItems && (
                  <div className="flex justify-between text-[#666666]">
                    <span className="flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Regular Items
                    </span>
                    <span>₹{regularSubtotal}</span>
                  </div>
                )}
                {hasBulkItems && (
                  <div className="flex justify-between text-amber-700">
                    <span className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" />
                      Bulk Items
                    </span>
                    <span>₹{bulkSubtotal}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#666666]">
                  <span className="flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    Delivery Fee
                  </span>
                  <span className={deliveryFee === 0 ? 'text-[#22C55E]' : ''}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-[#666666]">
                  <span>Taxes & Charges</span>
                  <span>₹{taxes}</span>
                </div>
              </div>

              <div className="border-t border-[#E5E5E5] pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="font-semibold text-[#1A1A1A]">To Pay</span>
                  <span className="font-bold text-xl text-[#5bab00]">₹{total}</span>
                </div>
              </div>

              {/* Transport Mode */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-[#666666] mb-3">
                  Mode of Transport
                </h4>
                <div className="space-y-2">
                  {[
                    { id: 'Delivery Team', title: 'Delivery Team', desc: 'Delivered by our team', icon: Truck },
                    { id: 'By Hand', title: 'By Hand', desc: 'Pick up yourself', icon: ShoppingBag },
                    { id: 'Professional Courier', title: 'Professional Courier', desc: 'Ships via third-party courier', icon: Truck }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setTransportMode(mode.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${transportMode === mode.id
                        ? 'border-[#5bab00] bg-[#f1f7e8] shadow-sm'
                        : 'border-[#E5E5E5] bg-white hover:border-[#5bab00]/50'
                        }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${transportMode === mode.id ? 'border-[#5bab00]' : 'border-[#CCCCCC]'
                          }`}
                      >
                        {transportMode === mode.id && <div className="w-2.5 h-2.5 bg-[#5bab00] rounded-full" />}
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-[#1A1A1A] block">{mode.title}</span>
                        <span className="text-xs text-[#666666]">{mode.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ================= PAYMENT SECTIONS ================= */}
              <div className="space-y-4 mb-6">
                <h4 className="text-sm font-medium text-[#666666]">
                  How you'll pay
                </h4>

                {/* Razorpay Section - show if has regular items */}
                {hasRegularItems && (
                  <div className="p-4 rounded-xl border-2 border-[#5bab00] bg-[#f1f7e8]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#5bab00]/10 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-[#5bab00]" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium block text-[#1A1A1A]">Online Payment (Razorpay)</span>
                        <span className="text-xs text-[#666666]">
                          Pay for regular items now — ₹{regularSubtotal}
                        </span>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 border-[#5bab00] flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-[#5bab00] rounded-full" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Purchase Order Section - for bulk items */}
                {hasBulkItems && (
                  <div className="p-4 rounded-xl border-2 border-amber-400 bg-amber-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium block text-amber-800">Purchase Order (Bulk)</span>
                        <span className="text-xs text-amber-700">
                          Our team will contact for ₹{bulkSubtotal}
                        </span>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 border-amber-500 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Place Order Button */}
              <Button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !defaultAddress}
                className={`w-full py-4 h-14 text-lg ${hasBulkItems && !hasRegularItems
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'btn-primary'
                  }`}
              >
                {isPlacingOrder ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {hasBulkItems ? 'Submitting Enquiry...' : 'Placing Order...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-between w-full">
                    <span>
                      {hasBulkItems && !hasRegularItems
                        ? 'Submit Bulk Enquiry'
                        : hasBulkItems && hasRegularItems
                          ? 'Place Order & Submit Enquiry'
                          : 'Place Order'
                      }
                    </span>
                    <span className="flex items-center gap-2">
                      ₹{total}
                      <ChevronRight className="w-5 h-5" />
                    </span>
                  </span>
                )}
              </Button>

              {!defaultAddress && (
                <p className="text-sm text-[#E85A24] text-center mt-3">
                  Please add a delivery address to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
