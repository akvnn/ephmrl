import { type ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  index: number;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-8 group">
      <div className="mb-6 text-primary/80">{icon}</div>

      <h3 className="text-xl font-semibold text-foreground mb-3 font-inter">
        {title}
      </h3>

      <p className="text-muted-foreground/80 leading-relaxed font-inter text-sm">
        {description}
      </p>
    </div>
  );
}
