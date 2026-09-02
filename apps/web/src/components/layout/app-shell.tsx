"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import NavigationRail from "./navigation-rail";
import TopBar from "./topbar";
import sessionService from "@/services/session.service";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    sessionService.hasSession().then((hasSession) => {
      if (!hasSession) router.replace(`/?next=${encodeURIComponent(pathname)}`);
      else setReady(true);
    });
  }, [pathname, router]);

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Loading your workspace…
      </main>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <NavigationRail />

      <div className="flex flex-1 flex-col">
        <TopBar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
