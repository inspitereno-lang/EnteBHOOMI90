import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#151d0c] pt-16 pb-8 text-white/80 font-sans">
      <div className="mx-auto max-w-7xl px-4 lg:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 mb-16">
          {/* Brand & Quote */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-white group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img
                src="/ente bhoomi  copy.jpg"
                alt="Ente Bhoomi Logo"
                className="h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-110 rounded-lg"
              />
              <h2 className="text-3xl font-black tracking-tight text-[#5bab00] transition-colors">Ente Bhoomi</h2>
            </div>
            <p className="text-base leading-relaxed text-white/70">
              A Kerala-based agricultural initiative connecting farmers and consumers. We are committed to making farming profitable, sustainable, and community-driven.
            </p>
            <div className="bg-[#5bab00]/10 border border-[#5bab00]/20 p-4 rounded-xl">
              <p className="text-sm font-bold text-[#5bab00] italic">
                "The Earth is our responsibility — and agriculture is our future. 🌱"
              </p>
            </div>
          </div>

          {/* Company */}
          <div className="md:pl-12">
            <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-[#5bab00]">Company</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/about" className="hover:text-[#5bab00] transition-colors flex items-center gap-2 text-white/80 group"><span className="w-1.5 h-1.5 rounded-full bg-[#5bab00] group-hover:scale-150 transition-transform"></span> About Us</Link></li>
              <li><Link to="/contact" className="hover:text-[#5bab00] transition-colors flex items-center gap-2 text-white/80 group"><span className="w-1.5 h-1.5 rounded-full bg-[#5bab00] group-hover:scale-150 transition-transform"></span> Contact</Link></li>
              <li><Link to="/terms" className="hover:text-[#5bab00] transition-colors flex items-center gap-2 text-white/80 group"><span className="w-1.5 h-1.5 rounded-full bg-[#5bab00] group-hover:scale-150 transition-transform"></span> Terms & Conditions</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-[#5bab00] transition-colors flex items-center gap-2 text-white/80 group"><span className="w-1.5 h-1.5 rounded-full bg-[#5bab00] group-hover:scale-150 transition-transform"></span> Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:pl-12">
            <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-[#5bab00]">Contact</h3>
            <ul className="space-y-4 text-sm font-medium text-white/80">
              <li className="flex items-start gap-3 group">
                <span className="material-symbols-outlined text-[#5bab00] mt-0.5 group-hover:-translate-y-1 transition-transform">location_on</span>
                <span>Kerala, India</span>
              </li>
              <li className="flex items-center gap-3 group">
                <span className="material-symbols-outlined text-[#5bab00] group-hover:scale-110 transition-transform">mail</span>
                <span>entebhoomiofficial@gmail.com</span>
              </li>
              <li className="flex items-center gap-3 group">
                <span className="material-symbols-outlined text-[#5bab00] group-hover:rotate-12 transition-transform">call</span>
                <span>+91 9188910005</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-white/50">
          <p>© 2024 Ente Bhoomi Agro LLP. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
