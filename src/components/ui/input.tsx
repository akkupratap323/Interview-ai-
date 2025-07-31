import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "search" | "ghost";
  inputSize?: "sm" | "md" | "lg";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, variant = "default", inputSize = "md", ...props },
    ref,
  ) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex w-full rounded-lg border bg-background text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",

          // Variant styles
          {
            "border-input focus-visible:ring-ring hover:border-gray-300":
              variant === "default",
            "border-gray-200 bg-gray-50/50 focus-visible:ring-indigo-500 focus-visible:border-indigo-300":
              variant === "search",
            "border-transparent bg-transparent focus-visible:ring-indigo-500":
              variant === "ghost",
          },

          // Size styles
          {
            "h-8 px-2 py-1 text-xs": inputSize === "sm",
            "h-10 px-3 py-2": inputSize === "md",
            "h-12 px-4 py-3 text-base": inputSize === "lg",
          },

          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
