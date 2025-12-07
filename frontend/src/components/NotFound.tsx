import { Link } from "@tanstack/react-router";
import { Home, Rocket } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 pt-24 sm:pt-32 pb-16">
        <div className="max-w-lg mx-auto text-center space-y-6 sm:space-y-8">
          <div className="space-y-4">
            <div className="flex justify-center">
              <Rocket className="w-16 h-16 sm:w-20 sm:h-20 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-foreground font-inter tracking-tight">
              Coming Soon
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg font-inter max-w-md mx-auto">
              We're working hard to bring you something amazing. Stay tuned for
              updates!
            </p>
          </div>

          <div className="flex justify-center pt-4">
            <Link
              to="/"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all duration-200 cursor-pointer shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
