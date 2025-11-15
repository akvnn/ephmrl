import { motion } from "motion/react";
import { type ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  index: number;
}

export function FeatureCard({
  icon,
  title,
  description,
  index,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="p-8 group"
    >
      <div className="mb-6 text-primary/80">{icon}</div>

      <h3 className="text-xl font-semibold text-foreground mb-3 font-montserrat">
        {title}
      </h3>

      <p className="text-muted-foreground/80 leading-relaxed font-montserrat text-sm">
        {description}
      </p>
    </motion.div>
  );
}
