import { useNavigate, useLocation } from 'react-router-dom';
import { Package, CheckCircle, Phone, Mail, ArrowRight, ShoppingCart, Truck, Calendar, Clock } from 'lucide-react';
import { Button } from '../components/ui/button.jsx';
import { useEffect, useState } from 'react';

export default function MixedOrderSuccessPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const orderId = location.state?.orderId;
    const [countdown, setCountdown] = useState(15);

    useEffect(() => {
        if (!orderId) {
            navigate('/');
            return;
        }

        if (countdown <= 0) {
            navigate(`/order/${orderId}`);
            return;
        }

        const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown, orderId, navigate]);

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4 py-12 md:py-20 font-inter">
            <div className="max-w-3xl w-full">
                {/* Premium container with subtle glass effect background */}
                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-[#F0F0F0] relative">

                    {/* Top Decorative Header */}
                    <div className="h-3 bg-gradient-to-r from-[#5bab00] via-[#85e000] to-[#5bab00]" />

                    <div className="p-8 md:p-14">
                        {/* Success Icon & Main Heading */}
                        <div className="text-center mb-12">
                            <div className="relative w-24 h-24 mx-auto mb-8">
                                <div className="absolute inset-0 bg-[#5bab00]/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                                <div className="relative w-24 h-24 bg-gradient-to-br from-[#5bab00] to-[#4a8a00] rounded-full flex items-center justify-center shadow-xl shadow-[#5bab00]/20">
                                    <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1A1A1A] tracking-tight mb-4">
                                Payment Confirmed!
                            </h1>
                            <p className="text-[#666666] text-lg max-w-md mx-auto leading-relaxed">
                                Thank you for your purchase. We've received your payment and our team is already getting started.
                            </p>
                        </div>

                        {/* Integrated Information Area */}
                        <div className="space-y-8 mb-12">

                            {/* Process Timeline / Steps */}
                            <div className="relative">
                                {/* Vertical line for desktop */}
                                <div className="hidden md:block absolute left-[27px] top-6 bottom-6 w-[2px] bg-[#F0F0F0]" />

                                <div className="space-y-8">
                                    {/* Step 1: Regular Items */}
                                    <div className="flex flex-col md:flex-row gap-6 relative group">
                                        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[#f1f7e8] flex items-center justify-center z-10 border border-[#e0ecd0] transition-transform group-hover:scale-110 duration-300">
                                            <Truck className="w-7 h-7 text-[#5bab00]" />
                                        </div>
                                        <div className="flex-grow pt-1">
                                            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2 flex items-center gap-3">
                                                Regular Order Dispatch
                                                <span className="text-[10px] px-2 py-0.5 bg-[#5bab00]/10 text-[#5bab00] rounded-full uppercase tracking-widest font-bold border border-[#5bab00]/20">Active</span>
                                            </h3>
                                            <p className="text-[#666666] text-sm leading-relaxed mb-4">
                                                Your regular items are being prepared for dispatch. You'll receive tracking details via email once they’re on the way.
                                            </p>
                                            <div className="flex flex-wrap gap-4 text-[13px] text-[#888888] font-medium">
                                                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Est. Dispatch: 24-48h</span>
                                                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Next Steps: Quality Check</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 2: Bulk Items */}
                                    <div className="flex flex-col md:flex-row gap-6 relative group">
                                        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center z-10 border border-amber-100 transition-transform group-hover:scale-110 duration-300">
                                            <Package className="w-7 h-7 text-amber-600" />
                                        </div>
                                        <div className="flex-grow pt-1">
                                            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
                                                Bulk Quantity Handling
                                            </h3>
                                            <p className="text-[#666666] text-sm leading-relaxed mb-6">
                                                For your bulk items, our specialized logistics team will reach out to coordinate optimized shipping and confirm freight details.
                                            </p>

                                            {/* Contact Quick Cards */}
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <div className="flex-1 bg-amber-50/50 rounded-2xl p-4 border border-amber-100/50">
                                                    <p className="text-[11px] uppercase tracking-wider font-bold text-amber-700/70 mb-2">Review within 24h</p>
                                                    <div className="flex items-center gap-3">
                                                        <a href="tel:+910000000000" className="flex items-center gap-2 text-sm font-bold text-amber-900 hover:text-amber-700 transition-colors">
                                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                                <Phone className="w-4 h-4" />
                                                            </div>
                                                            +91 0000 000 000
                                                        </a>
                                                    </div>
                                                </div>
                                                <div className="flex-1 bg-amber-50/50 rounded-2xl p-4 border border-amber-100/50">
                                                    <p className="text-[11px] uppercase tracking-wider font-bold text-amber-700/70 mb-2">Direct Inquiry</p>
                                                    <div className="flex items-center gap-3">
                                                        <a href="mailto:support@entebhoomi.com" className="flex items-center gap-2 text-sm font-bold text-amber-900 hover:text-amber-700 transition-colors">
                                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                                <Mail className="w-4 h-4" />
                                                            </div>
                                                            Direct Support Line
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions Area */}
                        <div className="pt-8 border-t border-[#F5F5F5] flex flex-col items-center gap-6">
                            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Button
                                    onClick={() => navigate(`/order/${orderId}`)}
                                    className="w-full bg-[#1A1A1A] hover:bg-[#333333] text-white py-4 h-16 rounded-2xl text-lg font-bold transition-all hover:translate-y-[-2px] hover:shadow-lg flex items-center justify-center gap-3"
                                >
                                    View Detailed Order
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                                <Button
                                    onClick={() => navigate('/')}
                                    variant="outline"
                                    className="w-full border-2 border-[#E5E5E5] hover:border-[#5bab00] hover:text-[#5bab00] hover:bg-[#f1f7e8] py-4 h-16 rounded-2xl text-lg font-bold transition-all flex items-center justify-center gap-3"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Keep Shopping
                                </Button>
                            </div>

                            <div className="flex items-center gap-3 text-[#999999] text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#5bab00] animate-pulse" />
                                Redirecting to dashboard in <span className="font-bold text-[#1A1A1A] tabular-nums">{countdown}s</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer Info */}
                <div className="mt-12 text-center text-[#999999] text-sm flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white">
                    <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#5bab00]" /> SSL Secured Payment</p>
                    <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#5bab00]" /> Official Order Confirmation</p>
                    <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#5bab00]" /> 24/7 Logistics Support</p>
                </div>
            </div>
        </div>
    );
}
