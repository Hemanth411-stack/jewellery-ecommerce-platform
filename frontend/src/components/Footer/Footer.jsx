import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <h2 className="font-display text-2xl font-bold">Himapriya</h2>
          <p className="mt-4 text-sm leading-6 text-white/65">
            Elegant jewellery crafted for celebrations, traditions, and everyday refinement.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/80">Quick Links</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/65">
            <Link to="/">Collections</Link>
            <Link to="/">Rings</Link>
            <Link to="/">Necklaces</Link>
            <Link to="/">Earrings</Link>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/80">Customer Support</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/65">
            <Link to="/">Size Guide</Link>
            <Link to="/">Shipping</Link>
            <Link to="/">Returns</Link>
            <Link to="/">Care Instructions</Link>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/80">Contact</h3>
          <div className="mt-4 space-y-3 text-sm text-white/65">
            <p className="flex items-center gap-2"><MapPin size={16} /> Hyderabad, India</p>
            <p className="flex items-center gap-2"><Phone size={16} /> +91 98765 43210</p>
            <p className="flex items-center gap-2"><Mail size={16} /> care@himapriya.com</p>
          </div>
          <div className="mt-5 flex gap-3">
            <Instagram size={19} />
            <Facebook size={19} />
            <Twitter size={19} />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-sm text-white/55">
        Copyright {new Date().getFullYear()} Himapriya Jewellery. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
