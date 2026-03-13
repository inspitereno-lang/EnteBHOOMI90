import { ChevronLeft, MapPin, Package, CreditCard, Truck, Check, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore, normalizeOrders } from '../context/StoreContext.jsx';
import { Button } from '../components/ui/button.jsx';
import { normalizeImageUrl } from '../utils/utils.js';
import { cancelProductApi } from '../services/orderService.js';

const statusColors = {
  Pending: 'bg-[#FFF3ED] text-[#E85A24]',
  Accepted: 'bg-[#f1f7e8] text-[#5bab00]',
  Delivered: 'bg-[#f1f7e8] text-[#22C55E]',
  Cancelled: 'bg-[#FFF3ED] text-[#EF4444]',
  Rejected: 'bg-[#FFF3ED] text-[#EF4444]',
};

const statusLabels = {
  Pending: 'Pending',
  Accepted: 'Accepted',
  Delivered: 'Delivered',
  Rejected: 'Rejected',
};

const getRefundStatus = (order, item) => {
  // If order is COD or item is bulk, no refund
  if (order.paymentMethod === 'COD' || item.isBulk) return null;

  // If item is not cancelled, no refund tracking needed (unless whole order cancelled)
  if (item.status !== 'Cancelled' && order.status !== 'Cancelled') return null;

  // Check if specific item is refunded
  const itemRefund = order.refunds?.find(r => r.itemId === item.productId);

  // Check if full order is refunded
  const fullRefund = order.refunds?.find(r => r.itemId === 'FULL_ORDER');

  if (fullRefund || itemRefund) {
    return {
      step: 2,
      label: 'Refund Completed',
      date: fullRefund?.createdAt || itemRefund?.createdAt
    };
  }

  // If Cancelled but not yet refunded in DB
  if (order.paymentStatus === 'Completed' || order.paymentStatus === 'Refunded' || order.paymentStatus === 'PartialRefunded') {
    // If payment was completed, refund should be initiated
    return {
      step: 1,
      label: 'Refund Initiated',
      date: Date.now() // Approximation or use updated at
    };
  }

  return null;
};

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, setOrders } = useStore();
  const order = orders.find((o) => o.id === orderId);
  const [cancellingProducts, setCancellingProducts] = useState({});
  const [cancelError, setCancelError] = useState(null);
  const [cancelSuccess, setCancelSuccess] = useState(null);

  const handleCancelProduct = async (productId) => {
    try {
      setCancellingProducts(prev => ({ ...prev, [productId]: true }));
      setCancelError(null);
      setCancelSuccess(null);

      const result = await cancelProductApi(order.id, productId);

      if (result.success) {
        // Normalize the backend response
        const normalizedOrder = normalizeOrders([result.data])[0];

        // Update local order state
        // Update local order state with smart merging to preserve product details
        const updatedOrders = orders.map(o => {
          if (o.id === order.id) {
            // Merge existing product details (image, name) into the new normalized order
            // because the cancellation API might return unpopulated product objects
            const mergedItems = normalizedOrder.items.map(newItem => {
              const existingItem = o.items.find(oldItem =>
                (oldItem.product.id === newItem.product.id) ||
                (oldItem.productId === newItem.productId)
              );

              if (existingItem) {
                return {
                  ...newItem,
                  product: {
                    ...newItem.product,
                    // If new image is placeholder or null, keep the old one
                    image: newItem.product.image?.includes('placeholder') ? existingItem.product.image : newItem.product.image,
                    // Keep old name if new one is generic 'Product'
                    name: newItem.product.name === 'Product' ? existingItem.product.name : newItem.product.name,
                    // Keep other useful props
                    price: newItem.product.price || existingItem.product.price
                  }
                };
              }
              return newItem;
            });

            return {
              ...normalizedOrder,
              items: mergedItems
            };
          }
          return o;
        });
        setOrders(updatedOrders);
        setCancelSuccess('Product cancelled successfully');

        // Clear success message after 3 seconds
        setTimeout(() => setCancelSuccess(null), 3000);
      } else {
        setCancelError(result.msg || 'Failed to cancel product');
      }
    } catch (error) {
      console.error('Error cancelling product:', error);
      setCancelError('Failed to cancel product. Please try again.');
    } finally {
      setCancellingProducts(prev => ({ ...prev, [productId]: false }));
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Order not found</h2>
          <Button onClick={() => navigate('/orders')} className="btn-primary">
            Back to Orders
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
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2 text-[#666666] hover:text-[#5bab00] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Orders
          </button>
        </div>
      </div>

      <div className="section-container py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-[#1A1A1A]">{order.orderId}</h1>
                    {order.isBulkOrder && (
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full blur opacity-40 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse" />
                        <div className="relative px-3 py-1 bg-white ring-1 ring-amber-200 rounded-full flex items-center gap-1.5 shadow-sm">
                          <Package className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Mixed Bulk Order</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-[#666666] mt-1">
                    Ordered on{' '}
                    {new Date(order.orderDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]
                    }`}
                >
                  {statusLabels[order.status]}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#5bab00]" />
                Delivery Address
              </h3>
              <div className="p-4 bg-[#F5F5F5] rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-[#5bab00] text-white text-xs font-medium rounded-lg capitalize">
                    {order.deliveryAddress?.type || 'Delivery'}
                  </span>
                </div>
                <p className="text-[#1A1A1A]">{order.deliveryAddress?.fullAddress || 'Address not available'}</p>
                {order.deliveryAddress?.landmark && (
                  <p className="text-sm text-[#666666] mt-1">
                    Landmark: {order.deliveryAddress.landmark}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#5bab00]" />
                Items ({order.items?.length || 0})
              </h3>

              {/* Success/Error Messages */}
              {cancelSuccess && (
                <div className="mb-4 p-3 bg-[#f1f7e8] text-[#5bab00] rounded-lg flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  <span>{cancelSuccess}</span>
                </div>
              )}
              {cancelError && (
                <div className="mb-4 p-3 bg-[#FFF3ED] text-[#EF4444] rounded-lg flex items-center gap-2">
                  <X className="w-5 h-5" />
                  <span>{cancelError}</span>
                </div>
              )}

              <div className="space-y-4">
                {order.items?.map((item, index) => {
                  const productId = item.productId || item.product?._id || item.product?.id;
                  const itemStatus = item.status || 'Pending';
                  const canCancel = itemStatus === 'Pending';
                  const isCancelling = cancellingProducts[productId];

                  return (
                    <div
                      key={index}
                      className="flex gap-4 pb-4 border-b border-[#E5E5E5] last:border-0 last:pb-0"
                    >
                      <img
                        src={normalizeImageUrl(item.product?.image)}
                        alt={item.product?.name || 'Product'}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/product-placeholder.png';
                        }}
                        className="w-20 h-20 object-cover rounded-xl bg-[#F5F5F5]"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-[#1A1A1A]">{item.product?.name || item.productName}</h4>
                            <p className="text-sm text-[#666666]">{item.product?.shop}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[itemStatus]}`}>
                                {statusLabels[itemStatus] || itemStatus}
                              </span>
                              {item.isBulk ? (
                                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-200">
                                  Bulk Item
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-[#f1f7e8] text-[#5bab00] rounded-full text-[10px] font-bold uppercase tracking-wider border border-[#5bab00]/20">
                                  Regular Item
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-[#666666]">
                            Qty: {item.quantity}
                          </span>
                          <span className="font-semibold text-[#5bab00]">
                            ₹{(item.product?.price || item.price) * item.quantity}
                          </span>
                        </div>
                        {canCancel && (
                          <div className="mt-2">
                            <Button
                              onClick={() => handleCancelProduct(productId)}
                              disabled={isCancelling}
                              className="btn-secondary text-sm py-1 px-3 h-auto"
                            >
                              {isCancelling ? (
                                <>
                                  <span className="inline-block w-3 h-3 border-2 border-[#666666] border-t-transparent rounded-full animate-spin mr-2"></span>
                                  Cancelling...
                                </>
                              ) : (
                                <>
                                  <X className="w-4 h-4 mr-1" />
                                  Cancel Item
                                </>
                              )}
                            </Button>
                          </div>
                        )}

                        {/* Refund Progress Bar */}
                        {(() => {
                          const refundStatus = getRefundStatus(order, item);
                          if (refundStatus) {
                            return (
                              <div className="mt-3 bg-[#FAFAFA] rounded-lg p-3 border border-[#E5E5E5]">
                                <p className="text-xs font-semibold text-[#1A1A1A] mb-2">Refund Status</p>
                                <div className="flex items-center gap-2">
                                  {/* Step 1: Initiated */}
                                  <div className="flex items-center gap-2 flex-1">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${refundStatus.step >= 1 ? 'bg-[#5bab00] text-white' : 'bg-[#E5E5E5] text-[#999999]'}`}>
                                      <Check className="w-3 h-3" />
                                    </div>
                                    <div className={`h-1 flex-1 rounded-full ${refundStatus.step >= 2 ? 'bg-[#5bab00]' : 'bg-[#E5E5E5]'}`} />
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${refundStatus.step >= 2 ? 'bg-[#5bab00] text-white' : 'bg-[#E5E5E5] text-[#999999]'}`}>
                                      <Check className="w-3 h-3" />
                                    </div>
                                  </div>
                                  <span className="text-xs font-medium text-[#5bab00] whitespace-nowrap">
                                    {refundStatus.label}
                                  </span>
                                </div>
                                <div className="flex justify-between text-[10px] text-[#666666] mt-1 px-1">
                                  <span>Initiated</span>
                                  <span>Processed</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#5bab00]" />
                Payment & Logistics
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-[#666666] uppercase tracking-wider mb-1">Payment Method</p>
                  <p className="text-[#1A1A1A] font-medium">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#666666] uppercase tracking-wider mb-1">Mode of Transport</p>
                  <p className="text-[#1A1A1A] font-medium flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#5bab00]" />
                    {order.transportMode}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#1A1A1A] mb-4">Bill Summary</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-[#666666]">
                  <span>Item Total</span>
                  <span>₹{order.subtotal}</span>
                </div>
                {order.deliveryFee > 0 && (
                  <div className="flex justify-between text-[#666666]">
                    <span className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Delivery Fee
                    </span>
                    <span>₹{order.deliveryFee}</span>
                  </div>
                )}
                {order.taxes > 0 && (
                  <div className="flex justify-between text-[#666666]">
                    <span>Taxes & Charges</span>
                    <span>₹{order.taxes}</span>
                  </div>
                )}

                {/* Detailed Payment Breakdown */}
                {(order.regularAmount > 0 || order.bulkAmount > 0) && (
                  <div className="mt-4 pt-4 border-t border-dashed border-[#E5E5E5] space-y-2">
                    {order.regularAmount > 0 && (
                      <div className="flex justify-between items-center bg-[#f1f7e8] p-2 rounded-lg">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-[#5bab00] uppercase tracking-wider">Online Paid</span>
                          <span className="text-xs text-[#4b5f3e]">Regular Items</span>
                        </div>
                        <span className="font-bold text-[#5bab00]">₹{order.regularAmount}</span>
                      </div>
                    )}
                    {order.bulkAmount > 0 && (
                      <div className="flex justify-between items-center bg-amber-50 p-2 rounded-lg">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">To Be Settled</span>
                          <span className="text-xs text-amber-600">Bulk Enquiry</span>
                        </div>
                        <span className="font-bold text-amber-700">₹{order.bulkAmount}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-[#E5E5E5] pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#1A1A1A]">Total Bill</span>
                  <div className="text-right">
                    <span className="font-black text-2xl text-[#151d0c]">
                      ₹{order.total}
                    </span>
                    <p className="text-[10px] text-[#666666] font-medium uppercase tracking-tighter">Amount inclusive of taxes</p>
                  </div>
                </div>
              </div>
            </div>


            <div className="space-y-3">
              {(() => {
                // Check if any items are accepted or delivered
                const hasAcceptedItems = order.items?.some(item =>
                  item.status === 'Accepted' || item.status === 'Delivered'
                );

                return hasAcceptedItems ? (
                  <Button
                    onClick={() => {
                      const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://thakkalies-api.onrender.com';
                      window.open(`${API_URL}/order/invoice/${order.id}`, '_blank');
                    }}
                    className="w-full btn-primary"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Download Invoice
                  </Button>
                ) : null;
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
