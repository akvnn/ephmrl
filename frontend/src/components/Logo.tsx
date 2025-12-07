import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "icon" | "text";
  size?: "sm" | "md" | "lg";
  className?: string;
  linkTo?: string;
}

const sizeConfig = {
  sm: { width: 160, height: 28, iconSize: 28, fontSize: 22 },
  md: { width: 240, height: 40, iconSize: 40, fontSize: 32 },
  lg: { width: 320, height: 52, iconSize: 52, fontSize: 40 },
};

function LogoMark({ size = 48 }: { size?: number }) {
  // The mark is 63 units wide (0 to 60 for dot center + 3 for radius) and 60 units tall
  const aspectRatio = 63 / 60;
  const width = size * aspectRatio;
  const height = size;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 63 60"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Top Bar (Solid) - full height */}
      <rect x="0" y="0" width="12" height="60" rx="2" className="fill-primary" />

      {/* Middle Bar - shorter, offset from top */}
      <rect
        x="18"
        y="10"
        width="12"
        height="40"
        rx="2"
        className="fill-primary opacity-80"
      />

      {/* Bottom Bar - shortest, centered vertically */}
      <rect
        x="36"
        y="20"
        width="12"
        height="20"
        rx="2"
        className="fill-primary opacity-60"
      />

      {/* Dot - centered vertically */}
      <circle cx="60" cy="30" r="3" className="fill-primary opacity-40" />
    </svg>
  );
}

// Icon-only logo (for favicon, app icon, etc.)
export function LogoIcon({
  size = 48,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center justify-center", className)}>
      <LogoMark size={size} />
    </div>
  );
}

// Full logo with icon and text
export function Logo({
  variant = "full",
  size = "md",
  className,
  linkTo,
}: LogoProps) {
  const config = sizeConfig[size];

  const content = (
    <div
      className={cn(
        "flex flex-row justify-center items-center gap-2",
        className
      )}
    >
      {variant !== "text" && <LogoMark size={config.iconSize} />}
      {variant !== "icon" && (
        <span
          className="font-semibold tracking-tight text-foreground leading-none"
          style={{ fontSize: config.fontSize, letterSpacing: "-0.025em" }}
        >
          ephmrl
        </span>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link
        to={linkTo}
        className="inline-flex items-center hover:opacity-80 transition-opacity"
      >
        {content}
      </Link>
    );
  }

  return content;
}

// App icon with background (for profile pictures, app store icons, etc.)
export function AppIcon({
  size = 100,
  variant = "dark",
  className,
}: {
  size?: number;
  variant?: "light" | "dark";
  className?: string;
}) {
  const borderRadius = size * 0.2;
  const markScale = size / 100;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        width="100"
        height="100"
        rx={borderRadius}
        className={
          variant === "dark" ? "fill-[#2D2D2D]" : "fill-white stroke-[#E5E5E5]"
        }
        strokeWidth={variant === "light" ? 2 : 0}
      />

      {/* Centered Mark */}
      <g transform={`translate(${26 * markScale}, ${20 * markScale})`}>
        <rect
          x="0"
          y="0"
          width="12"
          height="60"
          rx="2"
          className="fill-[#A9B3A9]"
        />
        <rect
          x="18"
          y="10"
          width="12"
          height="40"
          rx="2"
          className="fill-[#A9B3A9] opacity-80"
        />
        <rect
          x="36"
          y="20"
          width="12"
          height="20"
          rx="2"
          className="fill-[#A9B3A9] opacity-60"
        />
        <circle cx="60" cy="30" r="3" className="fill-[#A9B3A9] opacity-40" />
      </g>
    </svg>
  );
}

export default Logo;
