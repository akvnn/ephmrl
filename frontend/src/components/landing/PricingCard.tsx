import { Check } from "lucide-react";
import { ReactNode } from "react";

interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  tagline?: string;
  features: string[];
  index: number;
  featured?: boolean;
  cta?: string;
  onCtaClick?: () => void;
  icon?: ReactNode;
}

export function PricingCard({
  name,
  price,
  period,
  tagline,
  features,
  featured = false,
  cta = "Get Started",
  onCtaClick,
  icon,
}: PricingCardProps) {
  return (
    <div
      className={`group relative flex flex-col h-full w-full rounded-2xl sm:rounded-3xl p-1 transition-all duration-500 ${
        featured
          ? "bg-linear-to-b from-primary via-primary/60 to-primary/20"
          : "bg-linear-to-b from-border/80 to-border/20"
      }`}
    >
      <div className="relative flex flex-col h-full bg-background rounded-[calc(1rem-4px)] sm:rounded-[calc(1.5rem-4px)] p-5 sm:p-6 lg:p-8">
        {featured && (
          <div className="absolute -top-px left-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="inline-flex items-center px-4 py-1 text-xs font-semibold tracking-wide uppercase bg-primary text-primary-foreground rounded-full shadow-md">
              Recommended
            </span>
          </div>
        )}

        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            {icon && (
              <div
                className={`p-1.5 sm:p-2 rounded-lg ${featured ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
              >
                {icon}
              </div>
            )}
            <h3 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">
              {name}
            </h3>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-4xl sm:text-5xl font-bold tracking-tight ${featured ? "text-primary" : "text-foreground"}`}
            >
              {price}
            </span>
            {period && (
              <span className="text-sm text-muted-foreground font-medium">
                {period}
              </span>
            )}
          </div>

          {tagline && (
            <p className="mt-2 sm:mt-3 text-sm text-muted-foreground leading-relaxed">
              {tagline}
            </p>
          )}
        </div>

        <div className="flex-1 mb-6 sm:mb-8">
          <div className="h-px bg-border mb-6" />
          <ul className="space-y-4">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span
                  className={`shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                    featured
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </span>
                <span className="text-sm text-foreground/90 leading-tight">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={onCtaClick}
          className={`w-full py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
            featured
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110"
              : "bg-muted/50 text-foreground hover:bg-muted border border-border/50"
          }`}
        >
          {cta}
        </button>
      </div>
    </div>
  );
}
