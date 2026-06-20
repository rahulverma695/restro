import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-8 w-full rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-[13px] text-white/90 placeholder:text-white/30 focus:outline-none focus:border-orange-500 focus:bg-white/8 disabled:cursor-not-allowed disabled:opacity-40 transition-colors",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
