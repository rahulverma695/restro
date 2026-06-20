import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-[13px] font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:     "bg-orange-500 text-white hover:bg-orange-400 shadow-sm",
        destructive: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
        outline:     "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white",
        secondary:   "bg-white/8 text-white/70 hover:bg-white/12 hover:text-white",
        ghost:       "text-white/60 hover:bg-white/8 hover:text-white",
        link:        "text-orange-400 underline-offset-4 hover:underline",
        success:     "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20",
      },
      size: {
        default: "h-8 px-3.5 py-1.5",
        sm:      "h-7 rounded px-2.5 text-xs",
        lg:      "h-10 rounded-lg px-5 text-sm",
        icon:    "h-8 w-8",
        "icon-sm": "h-7 w-7",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
