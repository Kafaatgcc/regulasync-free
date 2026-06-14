import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

interface PublicHeaderProps {
  transparent?: boolean;
}

export default function PublicHeader({ transparent = false }: PublicHeaderProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/about", label: "About" },
    { href: "/pricing", label: "Pricing" },
    { href: "/case-studies", label: "Case Studies" },
    { href: "/integrations", label: "Integrations" },
    { href: "/security", label: "Security" },
    { href: "/careers", label: "Careers" },
  ];

  const isActive = (href: string) => location === href;

  return (
    <nav className={`${transparent ? 'bg-transparent' : 'bg-white/95 backdrop-blur-sm border-b border-slate-200'} sticky top-0 z-50`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-2.5">
              <img 
                src="/manus-storage/logo_optimized_92a39fa3.png" 
                alt="RegulaSync" 
                className="h-9 w-9 object-contain flex-shrink-0"
              />
              <span className="text-xl font-bold text-slate-900">
                Regula<span className="text-[#b87333]">Sync</span>
              </span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a className={`text-sm font-medium transition-colors ${
                  isActive(link.href) 
                    ? 'text-[#b87333]' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}>
                  {link.label}
                </a>
              </Link>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm" className="text-slate-700 border-slate-300 hover:bg-slate-50">
                Log In
              </Button>
            </Link>
            <Link href="/#request-demo">
              <Button size="sm" className="bg-[#b87333] hover:bg-[#a06329] text-white">
                Request Demo
              </Button>
            </Link>
          </div>

          {/* Mobile: Log In button + hamburger */}
          <div className="lg:hidden flex items-center gap-2">
            <Link href="/login">
              <Button variant="outline" size="sm" className="text-slate-700 border-slate-300 text-xs px-3">
                Log In
              </Button>
            </Link>
            <button 
              className="p-2 text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pb-4 border-t border-slate-200 pt-4">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <a 
                    className={`text-sm font-medium py-2.5 px-2 rounded-md block transition-colors ${
                      isActive(link.href) 
                        ? 'text-[#b87333] bg-orange-50' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <Link href="/#request-demo">
                  <Button size="sm" className="w-full bg-[#b87333] hover:bg-[#a06329] text-white">
                    Request Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
