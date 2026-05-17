import { PackageOpen } from "lucide-react";

interface Props { message?: string; }

export default function EmptyState({ message = "暂无数据" }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-[hsl(var(--muted-foreground))]">
      <PackageOpen size={48} className="mb-3 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
