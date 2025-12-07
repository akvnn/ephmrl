import { type ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  index: number;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-5 sm:p-6 lg:p-8 group">
      <div className="mb-4 sm:mb-6 text-primary/80 [&>svg]:w-10 [&>svg]:h-10 sm:[&>svg]:w-12 sm:[&>svg]:h-12">{icon}</div>

      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3 font-inter">
        {title}
      </h3>

      <p className="text-muted-foreground/80 leading-relaxed font-inter text-sm">
        {description}
      </p>
    </div>
  );
}
