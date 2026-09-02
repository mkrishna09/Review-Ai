"use client";

import QueryProvider from "./query-provider";
import ThemeProvider from "./theme-provider";
import { Toaster } from "@/components/ui/sonner";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <QueryProvider>
        {children}
        <Toaster richColors />
      </QueryProvider>
    </ThemeProvider>
  );
}
