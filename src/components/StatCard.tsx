import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  change?: string;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "brand" | "success" | "warning";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  change,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  const iconColors = {
    default: "bg-[#192435] text-[#3987F5] border-[#263345]",
    brand: "bg-[#3987F5]/10 text-[#3987F5] border-[#3987F5]/30",
    success: "bg-[#35B982]/10 text-[#35B982] border-[#35B982]/30",
    warning: "bg-[#E8B45E]/10 text-[#E8B45E] border-[#E8B45E]/30",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-[#131C29] p-5 border border-[#263345] shadow-card transition-all duration-200 hover:border-[#3987F5]/40 hover:shadow-glow",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#91A0B5] uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={cn("p-2 rounded-lg border", iconColors[variant])}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-[#EAF0F8] tracking-tight">
          {value}
        </span>
        {change && (
          <span
            className={cn(
              "inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded",
              trend === "up"
                ? "text-[#35B982] bg-[#35B982]/10"
                : trend === "down"
                ? "text-[#E36C75] bg-[#E36C75]/10"
                : "text-[#91A0B5] bg-[#192435]"
            )}
          >
            {trend === "up" && <ArrowUpRight className="w-3 h-3 mr-0.5" />}
            {trend === "down" && <ArrowDownRight className="w-3 h-3 mr-0.5" />}
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-[#91A0B5] line-clamp-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}
