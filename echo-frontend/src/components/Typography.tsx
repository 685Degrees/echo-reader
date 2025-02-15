import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface TypographyProps {
  children: ReactNode;
  className?: string;
}

export function Header({ children, className }: TypographyProps) {
  return (
    <h1
      className={cn("text-2xl md:text-3xl font-bold tracking-tight", className)}
    >
      {children}
    </h1>
  );
}

export function Subheader({ children, className }: TypographyProps) {
  return (
    <h2
      className={cn(
        "text-xl md:text-2xl font-semibold tracking-tight",
        className
      )}
    >
      {children}
    </h2>
  );
}

export function Subheader2({ children, className }: TypographyProps) {
  return (
    <h3
      className={cn("text-lg md:text-xl font-medium tracking-tight", className)}
    >
      {children}
    </h3>
  );
}

export function Paragraph({ children, className }: TypographyProps) {
  return (
    <p className={cn("text-sm md:text-base leading-relaxed", className)}>
      {children}
    </p>
  );
}

export function SmallText({ children, className }: TypographyProps) {
  return (
    <p className={cn("text-xs md:text-sm text-gray-500", className)}>
      {children}
    </p>
  );
}
