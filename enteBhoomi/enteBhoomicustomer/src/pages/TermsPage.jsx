import { ScrollText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsPage() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-24 pb-12">
            <div className="section-container">

                {/* Header */}
                <div className="max-w-4xl mx-auto mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-[#666666] hover:text-[#5bab00] transition-colors mb-6"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Home
                    </button>

                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E5E5E5] flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-[#f1f7e8] rounded-xl flex items-center justify-center">
                            <ScrollText className="w-6 h-6 text-[#5bab00]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[#1A1A1A]">Terms & Conditions</h1>
                            <p className="text-[#666666]">Last Updated: February 2026</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-[#E5E5E5] overflow-hidden">
                    <div className="p-8 md:p-12 space-y-8">

                        <section>
                            <p className="text-[#666666] leading-relaxed">
                                Welcome to Ente Bhoomi. By accessing and using our website, you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully before using our services. If you do not agree with any part of these terms, you should not use our website or services.
                            </p>
                        </section>

                        <div className="w-full h-px bg-[#E5E5E5]" />

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-[#1A1A1A]">1. General Information</h2>
                            <p className="text-[#666666] leading-relaxed">
                                This website is owned and operated by Ente Bhoomi, located in Kerala, India. We reserve the right to update, modify, or replace these Terms and Conditions at any time without prior notice. Continued use of the website after changes are posted constitutes acceptance of those changes.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-[#1A1A1A]">2. Eligibility</h2>
                            <p className="text-[#666666] leading-relaxed">
                                By using this website, you confirm that you are at least 18 years of age or accessing the website under the supervision of a parent or legal guardian.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-[#1A1A1A]">3. Services</h2>
                            <ul className="list-disc pl-5 text-[#666666] space-y-2">
                                <li>Ente Bhoomi provides real estate-related services, including property listings, property promotion, land sales assistance, and related consultancy services through its online platform.</li>
                                <li>All property descriptions, images, pricing, availability, and related information are subject to change without prior notice.</li>
                                <li>While we strive to provide accurate and up-to-date information, we do not guarantee that all property details, images, or content are completely error-free or current.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-[#1A1A1A]">4. Property Listings & Enquiries</h2>
                            <ul className="list-disc pl-5 text-[#666666] space-y-2">
                                <li>By submitting an enquiry, you agree to provide accurate and complete information.</li>
                                <li>Ente Bhoomi does not guarantee the sale, purchase, or rental of any listed property.</li>
                                <li>Property transactions are subject to mutual agreement between buyers and sellers.</li>
                                <li>We reserve the right to remove, edit, or reject any listing that violates our policies or contains misleading information.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-[#1A1A1A]">5. Payments & Charges</h2>
                            <ul className="list-disc pl-5 text-[#666666] space-y-2">
                                <li>Any service charges, consultation fees, or listing fees (if applicable) will be clearly communicated before processing.</li>
                                <li>All prices are listed in Indian Rupees (INR).</li>
                                <li>Payments, if collected online, are processed through secure third-party payment gateways.</li>
                                <li>Ente Bhoomi reserves the right to refuse or cancel services in case of suspicious or fraudulent activity.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-[#1A1A1A]">6. User Responsibilities</h2>
                            <p className="text-[#666666] mb-2">When using our website, you agree:</p>
                            <ul className="list-disc pl-5 text-[#666666] space-y-2">
                                <li>Not to use the platform for illegal or unauthorized purposes.</li>
                                <li>Not to attempt unauthorized access to systems, servers, or databases.</li>
                                <li>Not to upload false, misleading, or fraudulent property information.</li>
                                <li>Not to copy, reproduce, or distribute website content without written permission from Ente Bhoomi.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-[#1A1A1A]">7. Intellectual Property</h2>
                            <p className="text-[#666666] leading-relaxed">
                                All content on this website — including text, images, logos, branding, graphics, and design — is the property of Ente Bhoomi and protected under applicable intellectual property laws. Unauthorized use is strictly prohibited.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-[#1A1A1A]">8. Limitation of Liability</h2>
                            <p className="text-[#666666] mb-2">Ente Bhoomi shall not be liable for any indirect, incidental, or consequential damages arising from:</p>
                            <ul className="list-disc pl-5 text-[#666666] space-y-2">
                                <li>Use or inability to use the website</li>
                                <li>Property transaction disputes between buyers and sellers</li>
                                <li>Errors in property listings</li>
                                <li>Delays or issues beyond our control</li>
                            </ul>
                            <p className="text-[#666666] mt-2">Users are responsible for conducting independent verification of property documents and legal status before proceeding with any transaction.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-[#1A1A1A]">9. Privacy</h2>
                            <p className="text-[#666666] leading-relaxed">
                                Your use of this website is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal information.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-[#1A1A1A]">10. Governing Law</h2>
                            <p className="text-[#666666] leading-relaxed">
                                These Terms and Conditions shall be governed by the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the courts in Kerala.
                            </p>
                        </section>

                        <div className="w-full h-px bg-[#E5E5E5]" />

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-[#1A1A1A]">11. Contact Us</h2>
                            <div className="bg-[#FAFAFA] rounded-xl p-6 border border-[#E5E5E5]">
                                <p className="text-[#666666] mb-4">For any questions regarding these Terms and Conditions, please contact:</p>
                                <div className="space-y-2 text-sm font-medium text-[#1A1A1A]">
                                    <p>Ente Bhoomi Customer Support</p>
                                    <p className="flex items-center gap-2"><span className="text-[#666666]">📍</span> Kerala, India</p>
                                    <p className="flex items-center gap-2"><span className="text-[#666666]">📧</span> support@entebhoomi.com</p>
                                    <p className="flex items-center gap-2"><span className="text-[#666666]">📞</span> +91-XXXXXXXXXX</p>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
}
