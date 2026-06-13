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
    <nav className={`${transparent ? 'bg-transparent' : 'bg-white/95 backdrop-blur-sm border-b'} sticky top-0 z-50`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-3">
              <img 
                src="/manus-storage/logo_optimized_92a39fa3.png" 
                alt="RegulaSync" 
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold text-slate-900">RegulaSync</span>
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

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Log In
              </Button>
            </Link>
            <Link href="/#request-demo">
              <Button size="sm" className="bg-[#b87333] hover:bg-[#a06329]">
                Request Demo
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <a 
                    className={`text-sm font-medium py-2 ${
                      isActive(link.href) ? 'text-[#b87333]' : 'text-slate-600'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </Link>
              ))}
              <div className="flex gap-3 mt-4">
                <Link href="/dashboard?demo=true">
                  <Button variant="outline" size="sm" className="flex-1">
                    Try Demo
                  </Button>
                </Link>
                <Link href="/#request-demo">
                  <Button size="sm" className="flex-1 bg-[#b87333] hover:bg-[#a06329]">
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
