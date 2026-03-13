import { useNavigate, useLocation } from 'react-router-dom';
import { Package, CheckCircle, Phone, Mail, ArrowRight, ShoppingCart } from 'lucide-react';
import { Button } from '../components/ui/button.jsx';

export default function BulkOrderSuccessPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const orderId = location.state?.orderId;

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
            <div className="max-w-lg w-full">
                {/* Success Card */}
                <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm text-center">
                    {/* Animated Icon */}
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 bg-[#5bab00]/10 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                        <div className="relative w-24 h-24 bg-gradient-to-br from-[#5bab00] to-[#4a8a00] rounded-full flex items-center justify-center shadow-lg shadow-[#5bab00]/20">
                            <CheckCircle className="w-12 h-12 text-white" />
                        </div>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-3">
                        Bulk Order Submitted!
                    </h1>
                    <p className="text-[#666666] mb-6 leading-relaxed">
                        Your bulk order has been submitted successfully. Our team will review it and contact you within <strong className="text-[#1A1A1A]">24 hours</strong> to confirm pricing and delivery details.
                    </p>

                    {orderId && (
                        <div className="bg-[#f1f7e8] rounded-2xl p-4 mb-6">
                            <p className="text-sm text-[#666666] mb-1">Order ID</p>
                            <p className="text-lg font-bold text-[#5bab00] font-mono">{orderId}</p>
                        </div>
                    )}

                    {/* What Happens Next */}
                    <div className="bg-[#FAFAFA] rounded-2xl p-5 mb-8 text-left">
                        <h3 className="font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-[#5bab00]" />
                            What happens next?
                        </h3>
                        <div className="space-y-3">
                            {[
                                { step: '1', text: 'Our team reviews your bulk order' },
                                { step: '2', text: 'We contact you with the best pricing' },
                                { step: '3', text: 'You confirm and we process the order' },
                                { step: '4', text: 'Your order is delivered to your doorstep' }
                            ].map(({ step, text }) => (
                                <div key={step} className="flex items-center gap-3">
                                    <div className="w-7 h-7 bg-[#5bab00] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                        {step}
                                    </div>
                                    <p className="text-sm text-[#666666]">{text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-8">
                        <a
                            href="tel:+910000000000"
                            className="flex-1 flex items-center justify-center gap-2 p-3 bg-[#f1f7e8] rounded-xl text-[#5bab00] font-medium text-sm hover:bg-[#e4efd6] transition-colors"
                        >
                            <Phone className="w-4 h-4" />
                            Call Us
                        </a>
                        <a
                            href="mailto:support@entebhoomi.com"
                            className="flex-1 flex items-center justify-center gap-2 p-3 bg-[#f1f7e8] rounded-xl text-[#5bab00] font-medium text-sm hover:bg-[#e4efd6] transition-colors"
                        >
                            <Mail className="w-4 h-4" />
                            Email Us
                        </a>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Button
                            onClick={() => navigate('/orders')}
                            className="w-full btn-primary py-4 h-14 text-lg flex items-center justify-center gap-2"
                        >
                            View My Orders
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                        <button
                            onClick={() => navigate('/products')}
                            className="w-full flex items-center justify-center gap-2 text-[#5bab00] font-medium hover:underline py-3"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
