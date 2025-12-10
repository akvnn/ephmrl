import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Cpu,
  Shield,
  Zap,
  Globe,
  Code,
  Database,
  Rocket,
  Building2,
} from "lucide-react";
import { FeatureCard } from "../components/landing/FeatureCard";
import { PricingCard } from "../components/landing/PricingCard";
import { Terminal, TypingAnimation } from "@/components/ui/terminal";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DataStreamCanvas } from "@/components/DataStreamCanvas";
import { useAuthStore } from "@/hooks/use-auth";
import { useThemeStore } from "@/hooks/use-theme";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);

  const features = [
    {
      icon: <Cpu className="w-12 h-12 text-primary" />,
      title: "Rent Any Open-Source LLM",
      description:
        "Access any open-source LLM directly from our platform. Get instant chat interfaces and API endpoints.",
    },
    {
      icon: <Shield className="w-12 h-12 text-primary" />,
      title: "Full Privacy & Dedicated Instances",
      description:
        "Your models run in dedicated containers. Zero data retention policies available. Your data stays private with dedicated LLM instances for your organization. No sharing, no leaks.",
    },
    {
      icon: <Zap className="w-12 h-12 text-primary" />,
      title: "Ship AI Projects in Minutes",
      description:
        "Easy-to-use plugins that streamline AI development. Go from idea to production faster than ever.",
    },
    {
      icon: <Globe className="w-12 h-12 text-primary" />,
      title: "Ready-to-Use Web Interfaces",
      description:
        "Get public-facing chat interfaces instantly. Share with your team or customers immediately.",
    },
    {
      icon: <Code className="w-12 h-12 text-primary" />,
      title: "OpenAI-Compatible API",
      description:
        "Drop-in replacement for OpenAI APIs. Use in data processing, agentic applications, and more.",
    },
    {
      icon: <Database className="w-12 h-12 text-primary" />,
      title: "RAG Plugin Support",
      description:
        "Chat with your data using built-in RAG plugins. Get API endpoints and web interfaces for your knowledge base.",
    },
  ];

  const pricingTiers = [
    {
      name: "Starter",
      price: "Free",
      tagline: "Perfect for exploring and testing the platform capabilities.",
      features: [
        "Full playground access",
        "Test any open-source model with generous limits",
        "Community support",
        "Public documentation",
      ],
      cta: "Start Free",
      icon: <Rocket className="w-5 h-5" />,
    },
    {
      name: "Enterprise",
      price: "Custom",
      tagline:
        "Tailored solutions for organizations with specific requirements.",
      features: [
        "Dedicated LLM instances",
        "Custom integrations & SLAs",
        "24/7 priority support",
        "Volume-based pricing",
      ],
      cta: "Contact Sales",
      featured: true,
      icon: <Building2 className="w-5 h-5" />,
    },
  ];

  const handleGetStarted = () => {
    if (user) {
      navigate({ to: "/dashboard/deployed" });
    } else {
      navigate({ to: "/auth" });
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <section
        id="hero"
        className="relative py-12 sm:py-20 px-4 sm:px-6 overflow-hidden min-h-screen flex items-center pt-24 sm:pt-32 bg-background"
      >
        <div className="relative max-w-360 mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-4 sm:space-y-6">
                <h1 className="font-inter font-bold text-foreground leading-tight tracking-tight">
                  <span className="block text-4xl sm:text-5xl lg:text-7xl mb-1 sm:mb-2">
                    Make your enterprise
                  </span>
                  <span className="block text-4xl sm:text-5xl lg:text-7xl bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                    AI-Native
                  </span>
                  <span className="block text-4xl sm:text-5xl lg:text-7xl mt-1 sm:mt-2">
                    in minutes
                  </span>
                </h1>

                <p className="text-base sm:text-xl text-muted-foreground leading-relaxed font-inter max-w-xl">
                  Private LLM infrastructure for your needs.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4 pt-2 sm:pt-4">
                <button
                  onClick={handleGetStarted}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all duration-200 cursor-pointer shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                >
                  Get Started
                </button>
                <button
                  onClick={() => navigate({ to: "/docs" })}
                  className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-border text-foreground font-semibold rounded-lg hover:bg-muted/50 hover:border-muted-foreground/20 transition-all duration-200 cursor-pointer"
                >
                  Documentation
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="relative h-[280px] sm:h-[400px] lg:h-[500px] rounded-xl border border-border/50 bg-linear-to-br from-background to-muted/20 overflow-hidden shadow-2xl">
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex items-center gap-2">
                  <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-[10px] sm:text-xs font-mono text-muted-foreground">
                    SYSTEM_ACTIVE
                  </span>
                </div>
                <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 text-[10px] sm:text-xs font-mono text-muted-foreground/60 hidden xs:block sm:block">
                  CPU: 12% | MEM: 402MB | NET: 1.2GB/s
                </div>

                <DataStreamCanvas
                  className={`w-full h-full object-cover opacity-70 ${
                    resolvedTheme === "dark"
                      ? "mix-blend-screen"
                      : "mix-blend-multiply"
                  }`}
                />

                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
                      backgroundSize: "40px 40px",
                    }}
                  ></div>
                </div>

                <div className="absolute inset-0 bg-linear-to-tr from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>
              </div>
              <div className="absolute -top-4 -right-4 w-20 sm:w-32 h-20 sm:h-32 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-8 -left-8 w-24 sm:w-40 h-24 sm:h-40 bg-primary/5 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 max-w-7xl mx-auto"
      >
        <div className="text-center mb-12 sm:mb-16 lg:mb-20 space-y-3 sm:space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground font-inter tracking-tight">
            Why Choose Ephmrl
          </h2>
          <p className="text-muted-foreground font-inter text-base sm:text-lg max-w-2xl mx-auto px-4">
            Everything you need to deploy and manage LLMs at enterprise scale
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </section>

      <section
        id="privacy"
        className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="relative bg-linear-to-br from-muted/50 to-background border border-border rounded-2xl p-6 sm:p-8 lg:p-12 shadow-2xl">
              <div className="space-y-6 sm:space-y-8">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
                    <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                    Security First
                  </h3>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Dedicated Containers
                      </h4>
                      <p className="text-muted-foreground">
                        Your models run in isolated, dedicated containers. No
                        sharing with other organizations.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Zero Data Retention
                      </h4>
                      <p className="text-muted-foreground">
                        Choose zero data retention policies. Your data is never
                        stored or used for training.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Private Infrastructure
                      </h4>
                      <p className="text-muted-foreground">
                        Complete infrastructure isolation ensures your
                        proprietary data stays yours.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        Compliance Ready
                      </h4>
                      <p className="text-muted-foreground">
                        Built for enterprises with strict data governance and
                        compliance requirements.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight">
              Your Data. Your Control. Your Privacy.
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground font-inter leading-relaxed">
              Unlike public AI services, Ephmrl gives you complete control over
              your data. Every model instance is dedicated to your organization
              with enterprise-grade security and privacy guarantees.
            </p>
            <div className="pt-2 sm:pt-4">
              <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all duration-200 cursor-pointer shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5">
                Learn More About Security
              </button>
            </div>
          </div>
        </div>
      </section>

      <section
        id="demo"
        className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight">
              Developer First API
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground font-inter leading-relaxed">
              Full pragmatic SDKs for Python and Node.js. Integrate document
              chat into your internal tools with just a few lines of code.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 sm:pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Python SDK</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span>REST API</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <Terminal>
              <TypingAnimation className="font-inter" duration={20}>
                import ephmrl &#10;# Initialize client &#10;client =
                ephmrl.Client(key="...") &#10;# Chat with docs &#10;resp =
                client.chat.create( &#10; &#9;docs=["sales_Q3.pdf"], &#10;
                &#9;query="Summarize revenue" &#10;)
              </TypingAnimation>
            </Terminal>
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 max-w-5xl mx-auto"
      >
        <div className="text-center mb-10 sm:mb-12 lg:mb-16 space-y-3 sm:space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            Simple Pricing
          </h2>
          <p className="text-muted-foreground text-center text-base sm:text-lg max-w-2xl mx-auto font-inter px-4">
            Start free and scale when you're ready. No hidden fees, no
            surprises.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-3xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <PricingCard
              key={index}
              name={tier.name}
              price={tier.price}
              tagline={tier.tagline}
              features={tier.features}
              index={index}
              featured={tier.featured}
              cta={tier.cta}
              icon={tier.icon}
              onCtaClick={
                tier.featured
                  ? () => {
                      navigate({ to: "/contact" });
                    }
                  : handleGetStarted
              }
            />
          ))}
        </div>
      </section>

      <section className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6">
        <div className="relative max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/50 bg-background/80 backdrop-blur-xl">
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-linear-to-b from-primary/20 via-transparent to-primary/10 opacity-50 pointer-events-none" />

            <div
              className="absolute inset-0 opacity-[0.02] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
                backgroundSize: "32px 32px",
              }}
            />

            <div className="relative px-5 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-20">
              <div className="text-center space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground tracking-tight leading-[1.1]">
                  Ready to regain
                  <span className="block mt-1 sm:mt-2 bg-linear-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                    control?
                  </span>
                </h2>

                <p className="text-muted-foreground text-sm sm:text-lg lg:text-xl font-inter max-w-xl mx-auto leading-relaxed px-2">
                  Join companies using dedicated, private AI infrastructure. No
                  shared resources. No data leaks.
                </p>

                <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4 pt-4 sm:pt-6">
                  <button
                    onClick={() =>
                      (window.location.href =
                        "/api/checkout?products=e2d99c7c-62ef-415f-9c87-2675294b8ea8")
                    }
                    className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground font-semibold rounded-xl transition-all duration-300 cursor-pointer shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Create Account
                      <svg
                        className="w-4 h-4 transition-transform group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </span>
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </button>
                  <button
                    onClick={() => navigate({ to: "/contact" })}
                    className="px-6 sm:px-8 py-3 sm:py-4 text-foreground font-semibold rounded-xl border border-border hover:bg-muted/50 hover:border-muted-foreground/30 transition-all duration-200 cursor-pointer"
                  >
                    Contact Us
                  </button>
                </div>

                <p className="text-muted-foreground/60 text-xs sm:text-sm pt-3 sm:pt-4">
                  Free tier available.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
