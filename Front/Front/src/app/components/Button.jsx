import { forwardRef } from "react";

const variants = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-dark shadow-sm",
  secondary:
    "bg-foreground text-background hover:opacity-90",
  outline:
    "border border-border bg-card text-foreground hover:bg-secondary hover:border-primary/40",
  ghost:
    "text-foreground hover:bg-secondary",
  link:
    "text-foreground underline-offset-4 hover:underline p-0",
};

const sizes = {
  sm: "px-4 py-2 text-sm rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3.5 text-sm rounded-xl",
};

export const Button = forwardRef(
  ({ variant = "primary", size = "md", children, className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  ),
);

Button.displayName = "Button";
