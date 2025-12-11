import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "@/hooks/use-auth";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#demo", label: "Demo" },
    { href: "#pricing", label: "Pricing" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="max-w-360 mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo variant="full" size="sm" linkTo="/" />

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-foreground/80 hover:text-primary transition-colors font-inter"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="/dashboard/deployed"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-inter font-medium"
              >
                {isAuthenticated ? "Dashboard" : "Sign In"}
              </a>
            </div>

            <button
              className="md:hidden p-2 text-foreground/80 hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden pt-4 pb-2 border-t border-border/40 mt-4">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-foreground/80 hover:text-primary transition-colors font-inter py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href="/dashboard/deployed"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-inter font-medium text-center mt-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {isAuthenticated ? "Dashboard" : "Sign In"}
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
