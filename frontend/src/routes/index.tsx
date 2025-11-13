import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Cpu, Shield, Zap, Globe, Code, Database } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      <section className="relative py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-primary/10 via-accent/10 to-primary/5"></div>
        <div className="relative max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-black text-foreground mb-6">
            ephemeral<span className="text-primary">.ai</span>
          </h1>
          <p className="text-3xl md:text-4xl text-accent mb-4 font-light border-l-4 border-primary pl-6 inline-block">
            Rent LLMs With Ease
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8 mt-8">
            The first platform designed for organizations to rent dedicated LLM
            instances. No complex setup. No shared resources. Just powerful AI
            at your fingertips.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors shadow-lg shadow-primary/50 text-lg"
              onClick={() => navigate({ to: "/auth/login" })}
            >
              Get Started
            </button>
            <button
              className="px-8 py-4 bg-transparent border-2 border-primary hover:bg-primary/10 text-accent font-semibold rounded-lg transition-colors text-lg"
              onClick={() =>
                (window.location.href =
                  "/api/checkout?products=e2d99c7c-62ef-415f-9c87-2675294b8ea8")
              }
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-foreground text-center mb-12">
          Why Choose ephemeral?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card backdrop-blur-sm border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-foreground text-center mb-4">
          Flexible Pricing
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Start free and scale as you grow. No hidden fees.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className="bg-card backdrop-blur-sm border border-border rounded-xl p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
            >
              <h3 className="text-2xl font-bold text-card-foreground mb-2">
                {tier.name}
              </h3>
              <p className="text-3xl font-black text-primary mb-6">
                {tier.price}
              </p>
              <ul className="space-y-3">
                {tier.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="text-muted-foreground flex items-start"
                  >
                    <span className="text-primary mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-6 max-w-5xl mx-auto text-center">
        <div className="bg-linear-to-r from-secondary/50 to-accent/30 border border-border rounded-2xl p-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Join organizations using ephemeral.ai to power their AI
            infrastructure
          </p>
          <button
            className="px-10 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors shadow-lg shadow-primary/50 text-lg"
            onClick={() =>
              (window.location.href =
                "/api/checkout?products=e2d99c7c-62ef-415f-9c87-2675294b8ea8")
            }
          >
            Start Your Free Trial
          </button>
        </div>
      </section>
    </div>
  );
}
