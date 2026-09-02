"use client";

import { Bot, FolderGit2, Gauge, MessageSquare, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const items = [
  {
    icon: Gauge,
    label: "Dashboard",
    href: "/repositories",
  },
  {
    icon: FolderGit2,
    label: "Repositories",
    href: "/repositories",
  },
  {
    icon: Bot,
    label: "AI Reviews",
    href: "/repositories",
  },
  {
    icon: MessageSquare,
    label: "AI Chat",
    href: "/repositories",
  },
];

export default function NavigationRail() {
  const pathname = usePathname();
  return (
    <aside className="flex w-20 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-20 items-center justify-center border-b border-border">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
          <div className="h-3 w-3 rounded-full bg-primary" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col items-center gap-3 py-6">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Button
              key={item.label}
              variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
              size="icon-lg"
              className="rounded-2xl"
              title={item.label}
              render={<Link href={item.href} />}
            >
              <Icon className="h-5 w-5" />
            </Button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="flex flex-col items-center gap-3 border-t border-border p-4">
        <Button
          variant="ghost"
          size="icon-lg"
          className="rounded-2xl"
          aria-label="Settings"
          title="Settings"
          onClick={() =>
            toast("Settings are not available yet", {
              description: "Account settings will be added in a future update.",
            })
          }
        >
          <Settings className="h-5 w-5" />
        </Button>

        <Avatar size="lg">
          <AvatarFallback>K</AvatarFallback>
        </Avatar>
      </div>
    </aside>
  );
}
