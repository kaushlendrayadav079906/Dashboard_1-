import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { name: "Bras", href: "/shop?category=bras" },
      { name: "Panties", href: "/shop?category=panties" },
      { name: "Sets", href: "/shop?category=sets" },
      { name: "Loungewear", href: "/shop?category=loungewear" },
    ],
    about: [
      { name: "Our Story", href: "/about" },
      { name: "Sustainability", href: "/about#sustainability" },
      { name: "Careers", href: "/careers" },
    ],
    help: [
      { name: "Contact Us", href: "/contact" },
      { name: "Size Guide", href: "/size-guide" },
      { name: "Shipping & Returns", href: "/shipping" },
      { name: "FAQs", href: "/faqs" },
    ],
  };

  return (
    <footer className="relative bg-primary text-primary-foreground overflow-hidden">
      {/* Decorative top line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-brand to-transparent opacity-40" />
      
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand/5 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-brand/5 -translate-x-1/2 translate-y-1/2" />

      <div className="container-wide py-20 md:py-24 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="font-serif text-3xl mb-2 tracking-tight">Ela</h3>
            <div className="editorial-line mb-6" />
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-8 max-w-xs">
              Premium lingerie and loungewear crafted for modern women. 
              Beautiful, inside out.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
                { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
                { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-primary-foreground/20 hover:bg-brand hover:border-brand transition-all duration-300"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs tracking-[0.2em] uppercase mb-6 text-primary-foreground/50">
                {title}
              </h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-primary-foreground/70 hover:text-brand text-sm transition-colors duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-20 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/40 text-xs tracking-wide">
              © {currentYear} Ela by KOOL LIFESTYLE. All rights reserved.
            </p>
            <div className="flex gap-8 text-xs tracking-wide">
              <Link
                to="/privacy"
                className="text-primary-foreground/40 hover:text-primary-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-primary-foreground/40 hover:text-primary-foreground transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
