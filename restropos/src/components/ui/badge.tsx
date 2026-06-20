import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold tracking-wide",
  {
    variants: {
      variant: {
        default:     "bg-orange-500/15 text-orange-400",
        secondary:   "bg-white/8 text-white/60",
        destructive: "bg-red-500/15 text-red-400",
        success:     "bg-emerald-500/15 text-emerald-400",
        warning:     "bg-amber-500/15 text-amber-400",
        outline:     "border border-white/15 text-white/60",
        blue:        "bg-blue-500/15 text-blue-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
