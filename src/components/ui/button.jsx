import React from "react";
import { cn } from "@/lib/utils";

const Button = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-neutral-900 text-white hover:bg-neutral-800",
    outline: "border border-neutral-300 bg-transparent hover:bg-neutral-100",
    ghost: "hover:bg-neutral-100"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button };
