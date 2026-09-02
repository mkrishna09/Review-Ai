"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bot, GitFork, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import sessionService from "@/services/session.service";

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/repositories";

  useEffect(() => {
    sessionService.hasSession().then((hasSession) => {
      if (hasSession) router.replace(next);
    });
  }, [next, router]);

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6">
      <section className="max-w-xl text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Bot className="size-7" />
        </div>
        <p className="mt-8 text-sm font-medium text-primary">REVIEWAI</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Understand your codebase before the next bug does.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Connect GitHub, run an AI review, and investigate actionable findings
          in one workspace.
        </p>
        <Button
          className="mt-8 h-11 px-5"
          render={<a href={`${apiUrl}/auth/github`} />}
        >
          <GitFork className="mr-2 size-4" />
          Continue with GitHub
        </Button>
        <p className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="size-4" />
          You choose which repositories to synchronize.
        </p>
      </section>
    </main>
  );
}
