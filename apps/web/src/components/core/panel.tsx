import * as React from "react";
import { cn } from "@/lib/cn";

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function Panel({ children, className, ...props }: PanelProps) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-border bg-card transition-all duration-200",
        "hover:border-primary/30 hover:shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}
