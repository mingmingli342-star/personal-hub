import { cn } from "../lib/utils";

interface Props {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  trend?: "up" | "down";
  className?: string;
}

export default function StatCard({ title, value, sub, icon, trend, className }: Props) {
  return (
    <div className={cn("rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 md:p-5", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-[hsl(var(--muted-foreground))]">{title}</span>
        <div className="p-2 rounded-lg bg-[hsl(var(--accent))]">{icon}</div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && (
        <div className={cn("text-xs mt-1", trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-[hsl(var(--muted-foreground))]")}>
          {sub}
        </div>
      )}
    </div>
  );
}
