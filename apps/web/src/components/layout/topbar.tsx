import { Bell, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import SearchInput from "@/components/core/search-input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { removeToken } from "@/lib/auth";
import api from "@/lib/api";

export default function Topbar() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  async function signOut() {
    try {
      await api.post("/auth/logout");
    } finally {
      removeToken();
      router.replace("/");
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl sm:h-20 sm:px-8">
      <SearchInput
        className="hidden max-w-lg sm:block"
        placeholder="Search repositories..."
      />

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
          title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Show notifications"
          title="Notifications"
          onClick={() =>
            toast("You’re all caught up", {
              description: "There are no new notifications.",
            })
          }
        >
          <Bell className="h-5 w-5" />
        </Button>

        <div className="mx-2 h-8 w-px bg-border" />

        <button aria-label="Sign out" onClick={signOut} title="Sign out">
          <Avatar size="lg">
            <AvatarFallback>K</AvatarFallback>
          </Avatar>
        </button>
      </div>
    </header>
  );
}
