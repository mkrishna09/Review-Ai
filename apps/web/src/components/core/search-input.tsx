import { Search } from "lucide-react";

import { Input } from "@base-ui/react";
import { cn } from "@/lib/cn";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  placeholder = "Search...",
  className,
}: SearchInputProps) {
  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

      <Input
        placeholder={placeholder}
        className="h-12 rounded-2xl border-border bg-card pl-11 pr-16"
      />

      <kbd className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground">
        ⌘ K
      </kbd>
    </div>
  );
}
