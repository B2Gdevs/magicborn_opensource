// components/ui/Button.tsx
// Standardized button component for Magicborn UI

"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const variantStyles = {
  primary: "bg-ember text-white border-2 border-ember-glow hover:bg-ember/90",
  secondary: "bg-deep text-text-secondary hover:text-ember-glow border-2 border-border hover:border-ember/50",
  ghost: "bg-transparent text-text-secondary hover:text-ember-glow border-2 border-transparent hover:border-border",
  danger: "bg-red-600/20 text-red-400 border-2 border-red-600/50 hover:bg-red-600/30",
};

const sizeStyles = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-lg font-semibold transition-all",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}

