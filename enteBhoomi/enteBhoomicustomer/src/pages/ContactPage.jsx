import React from 'react';
import { Mail, Phone, MapPin, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useNavigate } from 'react-router-dom';

export default function ContactPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#FAFAFA] pb-20">
            {/* Header */}
            <div
                className="relative flex items-center justify-center py-24 px-4 h-[40vh] min-h-[400px] text-center bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/panoramic-shot-agrucultural-field-with-rays-sun-shining-through-clouds.jpg')" }}
            >
                <div className="absolute inset-0 bg-black/50"></div>

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-6 left-6 md:top-8 md:left-10 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/40 hover:scale-105"
                    aria-label="Go back"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 drop-shadow-lg">Contact Us</h1>
                    <p className="text-lg md:text-xl text-white/95 max-w-2xl mx-auto drop-shadow-md font-medium">
                        We'd love to hear from you. Whether you have a question about our products, pricing, or anything else, our team is ready to answer all your questions.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 lg:px-10 mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Contact Info */}
                <div className="space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold text-[#151d0c] mb-6">Get in Touch</h2>
                        <p className="text-[#4b5f3e] mb-8">
                            Reach out to us through any of the following methods, or fill out the form and we will get back to you shortly.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-[#eef4e6]">
                            <div className="w-12 h-12 bg-[#f1f7e8] rounded-xl flex items-center justify-center shrink-0">
                                <MapPin className="w-6 h-6 text-[#5bab00]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#151d0c] text-lg mb-1">Our Office</h3>
                                <p className="text-[#666666]">
                                    123 Green Valley Road,<br />
                                    Kochi, Kerala, India 682001
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-[#eef4e6]">
                            <div className="w-12 h-12 bg-[#f1f7e8] rounded-xl flex items-center justify-center shrink-0">
                                <Mail className="w-6 h-6 text-[#5bab00]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#151d0c] text-lg mb-1">Email Us</h3>
                                <p className="text-[#666666]">
                                    support@entebhoomi.com<br />
                                    info@entebhoomi.com
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-[#eef4e6]">
                            <div className="w-12 h-12 bg-[#f1f7e8] rounded-xl flex items-center justify-center shrink-0">
                                <Phone className="w-6 h-6 text-[#5bab00]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#151d0c] text-lg mb-1">Call Us</h3>
                                <p className="text-[#666666]">
                                    +91 00000 00000<br />
                                    Mon-Fri, 9am - 6pm
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#eef4e6]">
                    <h2 className="text-2xl font-bold text-[#151d0c] mb-6">Send us a Message</h2>
                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Thanks for contacting us! We'll reply soon."); }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">First Name</label>
                                <Input type="text" placeholder="John" className="w-full bg-[#FAFAFA]" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Last Name</label>
                                <Input type="text" placeholder="Doe" className="w-full bg-[#FAFAFA]" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Email Address</label>
                            <Input type="email" placeholder="john@example.com" className="w-full bg-[#FAFAFA]" required />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Subject</label>
                            <Input type="text" placeholder="How can we help?" className="w-full bg-[#FAFAFA]" required />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Message</label>
                            <textarea
                                className="w-full h-32 p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#5bab00]/20 focus:outline-none resize-none"
                                placeholder="Write your message here..."
                                required
                            ></textarea>
                        </div>

                        <Button type="submit" className="w-full bg-[#5bab00] hover:bg-[#4a8a00] text-white py-4 h-14 text-lg font-bold">
                            Send Message
                        </Button>
                    </form>
                </div>

            </div>
        </div>
    );
}
