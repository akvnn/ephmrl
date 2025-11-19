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
  featured = false,
}: PricingCardProps) {
  return (
    <div
      className={`bg-card backdrop-blur-sm border ${
        featured
          ? "border-primary shadow-lg shadow-primary/20"
          : "border-border"
      } rounded-xl p-8 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 relative`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full">
          POPULAR
        </div>
      )}

      <div>
        <h3 className="text-2xl font-bold text-card-foreground mb-2">{name}</h3>
        <p className="text-3xl font-black text-primary mb-6">{price}</p>
        <ul className="space-y-3">
          {features.map((feature, idx) => (
            <li
              key={idx}
              className="text-muted-foreground flex items-start font-inter"
            >
              <span className="text-primary mr-2">✓</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
