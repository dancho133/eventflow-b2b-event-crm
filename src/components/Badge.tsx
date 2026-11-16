import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info" | "outline" | "purple";
  className?: string;
  size?: "sm" | "md";
}

export function Badge({
  children,
  variant = "default",
  className,
  size = "sm",
}: BadgeProps) {
  const variantStyles = {
    default: "bg-[#192435] text-[#91A0B5] border-[#263345]",
    success: "bg-[#35B982]/10 text-[#35B982] border-[#35B982]/30",
    warning: "bg-[#E8B45E]/10 text-[#E8B45E] border-[#E8B45E]/30",
    error: "bg-[#E36C75]/10 text-[#E36C75] border-[#E36C75]/30",
    info: "bg-[#3987F5]/10 text-[#3987F5] border-[#3987F5]/30",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    outline: "bg-transparent text-[#91A0B5] border-[#263345]",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-xs font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "Published":
    case "Attended":
    case "Won":
    case "Completed":
    case "Qualified":
    case "Customer":
      return (
        <Badge variant="success">
          <span className="w-1.5 h-1.5 rounded-full bg-[#35B982]" />
          {status}
        </Badge>
      );
    case "Confirmed":
    case "In_Progress":
    case "Contacted":
    case "Proposal":
    case "Negotiation":
    case "Nurturing":
      return (
        <Badge variant="info">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3987F5]" />
          {status.replace("_", " ")}
        </Badge>
      );
    case "Draft":
    case "Pending":
    case "New":
    case "Discovery":
      return (
        <Badge variant="warning">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8B45E]" />
          {status}
        </Badge>
      );
    case "No-show":
    case "Cancelled":
    case "Lost":
    case "Inactive":
      return (
        <Badge variant="error">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E36C75]" />
          {status}
        </Badge>
      );
    case "Registered":
      return (
        <Badge variant="info">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3987F5]" />
          Registered
        </Badge>
      );
    default:
      return <Badge variant="default">{status}</Badge>;
  }
}
