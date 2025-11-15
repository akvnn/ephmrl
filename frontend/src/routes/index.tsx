import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Cpu, Shield, Zap, Globe, Code, Database } from "lucide-react";
import { FeatureCard } from "../components/landing/FeatureCard";
import { PricingCard } from "../components/landing/PricingCard";
import { motion } from "motion/react";
import TypewriterTitle from "@/components/kokonutui/type-writer";
import { ShinyButton } from "@/components/ui/shiny-button";
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/ui/terminal";
import { cn } from "@/lib/utils";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import Header from "@/components/Header";

export const Route = createFileRoute("/")({ component: App });

// Animated shape component for hero background
function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-primary/[0.08]",
  borderRadius = 16,
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
  borderRadius?: number;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          style={{ borderRadius }}
          className={cn(
            "absolute inset-0",
            "bg-linear-to-r to-transparent",
            gradient,
            "backdrop-blur-[1px]",
            "ring-1 ring-primary/5",
            "shadow-[0_2px_16px_-2px_rgba(0,0,0,0.04)]",
            "after:absolute after:inset-0",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(var(--color-primary),0.12),transparent_70%)]",
            "after:rounded-[inherit]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

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
        className="relative py-20 px-6 text-center overflow-hidden min-h-screen flex items-center justify-center pt-32"
      >
        <div className="absolute inset-0 overflow-hidden">
          <ElegantShape
            delay={0.3}
            width={300}
            height={500}
            rotate={-8}
            borderRadius={24}
            gradient="from-primary/[0.15]"
            className="left-[-15%] top-[-10%]"
          />

          <ElegantShape
            delay={0.5}
            width={600}
            height={200}
            rotate={15}
            borderRadius={20}
            gradient="from-accent/[0.12]"
            className="right-[-20%] bottom-[-5%]"
          />

          <ElegantShape
            delay={0.4}
            width={300}
            height={300}
            rotate={24}
            borderRadius={32}
            gradient="from-primary/[0.18]"
            className="left-[-5%] top-[40%]"
          />

          <ElegantShape
            delay={0.6}
            width={250}
            height={100}
            rotate={-20}
            borderRadius={12}
            gradient="from-accent/[0.1]"
            className="right-[10%] top-[5%]"
          />

          <ElegantShape
            delay={0.7}
            width={400}
            height={150}
            rotate={35}
            borderRadius={16}
            gradient="from-primary/[0.12]"
            className="right-[-10%] top-[45%]"
          />

          <ElegantShape
            delay={0.2}
            width={200}
            height={200}
            rotate={-25}
            borderRadius={28}
            gradient="from-accent/[0.15]"
            className="left-[20%] bottom-[10%]"
          />

          <ElegantShape
            delay={0.8}
            width={150}
            height={80}
            rotate={45}
            borderRadius={10}
            gradient="from-primary/[0.1]"
            className="left-[40%] top-[15%]"
          />

          <ElegantShape
            delay={0.9}
            width={450}
            height={120}
            rotate={-12}
            borderRadius={18}
            gradient="from-accent/[0.13]"
            className="left-[25%] top-[60%]"
          />
        </div>

        <div className="relative max-w-5xl mx-auto z-10">
          <h1
            className="font-black text-primary mb-6 font-geo"
            style={{
              fontSize: "clamp(3.75rem, 12vw, 7.5rem)",
              letterSpacing: "0.05em",
            }}
          >
            EPHEMERAL.AI
          </h1>

          <TypewriterTitle
            sequences={[
              {
                text: "Rent LLMs With Ease",
                pauseAfter: 400,
              },
            ]}
            autoLoop={false}
          />

          <motion.p
            className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8 mt-8 font-montserrat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            The first platform designed for organizations to rent dedicated LLM
            instances. No complex setup. No shared resources. Just powerful AI
            at your fingertips.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <ShinyButton
              onClick={() => navigate({ to: "/auth/login" })}
              className="px-8 py-4"
            >
              Get Started
            </ShinyButton>
          </motion.div>
        </div>
      </section>

      <section
        id="features"
        className="relative py-32 px-6 max-w-7xl mx-auto z-10"
      >
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-foreground font-montserrat mb-3">
            Why Choose Ephemeral
          </h2>
          <p className="text-muted-foreground/60 font-montserrat text-sm">
            Everything you need to deploy and manage LLMs
          </p>
        </motion.div>
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
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-foreground mb-4 font-geo">
              Deploy in Minutes
            </h2>
            <p className="text-lg text-muted-foreground font-montserrat">
              Deploy your LLM instances in minutes with our simple CLI tool
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
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
          </motion.div>
        </div>
      </section>

      <section
        id="pricing"
        className="relative py-20 px-6 max-w-7xl mx-auto z-10"
      >
        <motion.h2
          className="text-4xl font-bold text-foreground text-center mb-4 font-geo"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Flexible Pricing
        </motion.h2>
        <motion.p
          className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto font-montserrat"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Pay as you go with our credit system or choose a plan that fits your
          organization's needs.
        </motion.p>
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
        <motion.div
          className="relative bg-card/50 backdrop-blur-sm border border-primary/30 rounded-2xl p-12 overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.54 0.17 162 / 0.3), oklch(0.74 0.16 155 / 0.3), oklch(0.64 0.18 160 / 0.3))",
              backgroundSize: "200% 200%",
            }}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="relative z-10">
            <motion.h2
              className="text-4xl font-bold text-foreground mb-4 font-geo"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Ready to Get Started?
            </motion.h2>
            <motion.p
              className="text-muted-foreground mb-8 text-lg font-montserrat"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              Join organizations using ephemeral.ai to power their AI
              infrastructure
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="flex justify-center"
            >
              <ShimmerButton
                background="var(--primary)"
                shimmerColor="var(--accent)"
                onClick={() =>
                  (window.location.href =
                    "/api/checkout?products=e2d99c7c-62ef-415f-9c87-2675294b8ea8")
                }
              >
                <span className="text-accent font-bold">
                  Start Your Free Trial
                </span>
              </ShimmerButton>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
