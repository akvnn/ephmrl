import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

export function StatCard({ title, value, subtitle, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg sm:rounded-xl border bg-card transition-all hover:shadow-lg",
        className
      )}
    >
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative p-3 sm:p-4 lg:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5 sm:space-y-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">{value}</h3>
            </div>
            {subtitle && (
              <p className="text-[10px] sm:text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
