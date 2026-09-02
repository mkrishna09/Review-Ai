"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // The API sets an HttpOnly cookie before redirecting here. Keeping the token
    // out of browser storage prevents client-side scripts from reading it.
    router.replace("/repositories");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Signing you in...</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please wait while we finish authentication.
        </p>
      </div>
    </div>
  );
}
