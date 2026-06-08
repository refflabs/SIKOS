const variants = {
  default: "bg-card border border-border",
  flat: "bg-secondary/50 border-0",
  outline: "bg-transparent border border-border",
  elevated: "bg-card border border-border shadow-[0_1px_0_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(15,23,42,0.08)]",
  featured:
    "bg-card border-2 border-foreground/5 shadow-[0_24px_48px_-12px_rgba(15,23,42,0.12)]",
};

export function Card({ children, className = "", variant = "default", hover = false }) {
  return (
    <div
      className={`rounded-lg overflow-hidden transition-all duration-200 ${variants[variant]} ${
        hover ? "hover:border-primary/30 hover:-translate-y-0.5" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return <div className={`p-6 md:p-8 ${className}`}>{children}</div>;
}

export function CardContent({ children, className = "" }) {
  return <div className={`px-6 md:px-8 pb-6 md:pb-8 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return <div className={`px-6 md:px-8 pb-6 md:pb-8 pt-0 ${className}`}>{children}</div>;
}
