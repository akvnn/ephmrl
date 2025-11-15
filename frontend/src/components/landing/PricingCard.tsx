import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef, type MouseEvent } from "react";

interface PricingCardProps {
  name: string;
  price: string;
  features: string[];
  index: number;
  featured?: boolean;
}

export function PricingCard({
  name,
  price,
  features,
  index,
  featured = false,
}: PricingCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    ["7.5deg", "-7.5deg"]
  );
  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    ["-7.5deg", "7.5deg"]
  );

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`bg-card backdrop-blur-sm border ${
        featured
          ? "border-primary shadow-lg shadow-primary/20"
          : "border-border"
      } rounded-xl p-8 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 relative`}
    >
      {featured && (
        <motion.div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full font-geo"
          animate={{
            y: [0, -2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          POPULAR
        </motion.div>
      )}

      <div style={{ transform: "translateZ(50px)" }}>
        <h3 className="text-2xl font-bold text-card-foreground mb-2 font-geo">
          {name}
        </h3>
        <p className="text-3xl font-black text-primary mb-6 font-geo">
          {price}
        </p>
        <ul className="space-y-3">
          {features.map((feature, idx) => (
            <motion.li
              key={idx}
              className="text-muted-foreground flex items-start font-montserrat"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 + idx * 0.05 }}
            >
              <span className="text-primary mr-2">✓</span>
              {feature}
            </motion.li>
          ))}
        </ul>
      </div>

      {featured && (
        <motion.div
          className="absolute inset-0 rounded-xl blur-xl opacity-0 group-hover:opacity-50 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, oklch(0.64 0.18 160 / 0.4), transparent 70%)",
          }}
          animate={{
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </motion.div>
  );
}
