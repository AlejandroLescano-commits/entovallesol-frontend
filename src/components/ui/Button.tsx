import { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variants = {
  primary: "bg-primary text-white hover:bg-primary-dark disabled:opacity-50",
  secondary: "bg-secondary text-white hover:bg-secondary-dark disabled:opacity-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100",
};

const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };

export default function Button({ variant = "primary", size = "md", loading, children, className, disabled, ...rest }: Props) {
  return (
    <button
      className={clsx("rounded-lg font-medium transition-colors", variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? "Cargando..." : children}
    </button>
  );
}
