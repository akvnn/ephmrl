import { Link, useNavigate } from "@tanstack/react-router";
import { ShinyButton } from "./ui/shiny-button";

export default function Header() {
  const navigate = useNavigate();
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-primary">
              Ephmrl
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-foreground/80 hover:text-primary transition-colors font-inter"
              >
                Features
              </a>
              <a
                href="#demo"
                className="text-foreground/80 hover:text-primary transition-colors font-inter"
              >
                Demo
              </a>
              <a
                href="#pricing"
                className="text-foreground/80 hover:text-primary transition-colors font-inter"
              >
                Pricing
              </a>
              <ShinyButton onClick={() => navigate({ to: "/auth" })}>
                Sign in
              </ShinyButton>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
