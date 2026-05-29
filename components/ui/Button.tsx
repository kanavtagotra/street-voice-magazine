import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  href?: string;
  /** For buttons placed on the gradient hero */
  onHero?: boolean;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-zinc-900 text-white shadow-lg shadow-zinc-900/15 hover:bg-zinc-800 hover:-translate-y-0.5 dark:bg-white dark:text-zinc-950 dark:shadow-white/10 dark:hover:bg-zinc-100",
  secondary:
    "border border-zinc-300/80 bg-white/80 text-zinc-900 backdrop-blur-md hover:border-zinc-400 hover:bg-white dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:border-white/40 dark:hover:bg-white/10",
  ghost:
    "text-zinc-700 hover:bg-zinc-900/5 hover:text-zinc-900 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white",
};

const heroPrimary =
  "bg-zinc-900 text-white shadow-xl shadow-zinc-900/20 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:shadow-red-900/20";

export function Button({
  variant = "primary",
  className = "",
  children,
  href,
  onHero = false,
  ...props
}: ButtonProps) {
  const variantClass =
    onHero && variant === "primary" ? heroPrimary : variants[variant];
  const classes = `inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 ${variantClass} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
