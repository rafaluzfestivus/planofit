"use client";
import { CATEGORIES, Category } from "@/types";
import { cn } from "@/lib/cn";

export function CategoryBadge({ category, className }: { category: string; className?: string }) {
  const cat = CATEGORIES.find((c) => c.value === category);
  if (!cat) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        cat.color,
        className
      )}
    >
      {cat.emoji} {cat.label}
    </span>
  );
}
