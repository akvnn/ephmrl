import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Cpu, Shield, Zap, Globe, Code, Database } from "lucide-react";
import { FeatureCard } from "../components/landing/FeatureCard";
import { PricingCard } from "../components/landing/PricingCard";
import { ShinyButton } from "@/components/ui/shiny-button";
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/ui/terminal";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import Header from "@/components/Header";
import { FloatingPaths } from "@/components/kokonutui/background-paths";
import Footer from "@/components/Footer";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const navigate = useNavigate();

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
        "Your data stays private with dedicated LLM instances for your organization. No sharing, no leaks.",
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
      name: "Basic",
      price: "Free",
      features: ["Playground access", "Try before you buy"],
    },
    {
      name: "Pay as You Use",
      price: "Flexible",
      features: ["Credit system", "No commitments", "Scale as needed"],
    },
    {
      name: "Business",
      price: "Starting at $99/mo",
      features: [
        "Up to 300B models",
        "Up to 4 models at once",
        "50 requests/second",
        "Up to 4 team members",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: ["Custom pricing", "Unlimited scale", "Dedicated support"],
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <section
        id="hero"
        className="relative py-20 px-6 text-center overflow-hidden min-h-screen flex items-center justify-center pt-32 bg-background"
      >
        <FloatingPaths position={1} />
        <div className="relative max-w-5xl mx-auto z-10">
          <h1
            className="font-black text-primary mb-6 font-geo"
            style={{
              fontSize: "clamp(3.75rem, 12vw, 7.5rem)",
              letterSpacing: "0.05em",
            }}
          >
            EPHMRL.AI
          </h1>

          <p className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-montserrat">
            Rent LLM With Ease
          </p>

          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8 mt-8 font-montserrat">
            The first platform designed for organizations to rent dedicated LLM
            instances. No complex setup. No shared resources. Just powerful AI
            at your fingertips.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <ShinyButton
              onClick={() => navigate({ to: "/auth/login" })}
              className="px-8 py-4"
            >
              Get Started
            </ShinyButton>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="relative py-32 px-6 max-w-7xl mx-auto z-10"
      >
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold text-foreground font-montserrat mb-3">
            Why Choose EPHMRL
          </h2>
          <p className="text-muted-foreground/60 font-montserrat text-sm">
            Everything you need to deploy and manage LLMs
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
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

      <section id="demo" className="relative py-20 px-6 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-foreground mb-4 font-geo">
              Deploy in Minutes
            </h2>
            <p className="text-lg text-muted-foreground font-montserrat">
              Deploy your LLM instances in minutes with our simple CLI tool
            </p>
          </div>

          <div>
            <Terminal>
              <TypingAnimation>
                &gt; ephemeral deploy --model llama-3.1-70b
              </TypingAnimation>

              <AnimatedSpan className="text-green-500">
                ✔ Authenticating with Ephemeral.AI
              </AnimatedSpan>

              <AnimatedSpan className="text-green-500">
                ✔ Validating organization quota
              </AnimatedSpan>

              <AnimatedSpan className="text-green-500">
                ✔ Provisioning dedicated GPU instance
              </AnimatedSpan>

              <AnimatedSpan className="text-blue-500">
                ℹ Downloading model weights (70B parameters)
              </AnimatedSpan>

              <AnimatedSpan className="text-green-500">
                ✔ Model loaded successfully
              </AnimatedSpan>

              <AnimatedSpan className="text-green-500">
                ✔ Starting inference server
              </AnimatedSpan>

              <AnimatedSpan className="text-green-500">
                ✔ Health check passed
              </AnimatedSpan>

              <TypingAnimation className="text-muted-foreground">
                🚀 Deployment complete!
              </TypingAnimation>

              <AnimatedSpan className="text-blue-500">
                <span>
                  📡 API Endpoint:
                  https://api.ephemeral.ai/v1/org-123/llama-3.1-70b
                </span>
              </AnimatedSpan>

              <AnimatedSpan className="text-blue-500">
                <span>
                  🌐 Chat Interface:
                  https://chat.ephemeral.ai/org-123/llama-3.1-70b
                </span>
              </AnimatedSpan>

              <TypingAnimation className="text-green-500">
                ✨ Your LLM is ready to use!
              </TypingAnimation>
            </Terminal>
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="relative py-20 px-6 max-w-7xl mx-auto z-10"
      >
        <h2 className="text-4xl font-bold text-foreground text-center mb-4 font-geo">
          Flexible Pricing
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto font-montserrat">
          Pay as you go with our credit system or choose a plan that fits your
          organization's needs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingTiers.map((tier, index) => (
            <PricingCard
              key={index}
              name={tier.name}
              price={tier.price}
              features={tier.features}
              index={index}
              featured={tier.name === "Business"}
            />
          ))}
        </div>
      </section>

      <section className="relative py-16 px-6 max-w-5xl mx-auto text-center z-10">
        <div className="relative bg-card/50 backdrop-blur-sm border border-primary/30 rounded-2xl p-12 overflow-hidden">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.54 0.17 162 / 0.3), oklch(0.74 0.16 155 / 0.3), oklch(0.64 0.18 160 / 0.3))",
              backgroundSize: "200% 200%",
            }}
          />

          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-foreground mb-4 font-geo">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg font-montserrat">
              Join organizations using ephemeral.ai to power their AI
              infrastructure
            </p>
            <div className="flex justify-center">
              <ShimmerButton
                background="var(--primary)"
                shimmerColor="var(--accent)"
                onClick={() =>
                  (window.location.href =
                    "/api/checkout?products=e2d99c7c-62ef-415f-9c87-2675294b8ea8")
                }
              >
                <span className="text-accent-foreground font-bold">
                  Start Your Free Trial
                </span>
              </ShimmerButton>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
