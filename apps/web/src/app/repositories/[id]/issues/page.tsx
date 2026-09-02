"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import AppShell from "@/components/layout/app-shell";
import PageHeader from "@/components/core/page-header";
import IssueCard from "@/components/review/issue-card";
import { Button } from "@/components/ui/button";
import reviewService, { Review } from "@/services/review.service";

function displaySeverity(severity: string): "High" | "Medium" | "Low" {
  if (severity === "CRITICAL" || severity === "HIGH") return "High";
  if (severity === "MEDIUM") return "Medium";
  return "Low";
}

function IssuesContent() {
  const { id } = useParams<{ id: string }>();
  const reviewId = useSearchParams().get("reviewId");
  const [review, setReview] = useState<Review | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reviewId) return;
    reviewService
      .getReview(reviewId)
      .then((response) => setReview(response.data))
      .catch(() => setError("We could not load the findings for this review."));
  }, [reviewId]);

  if (!reviewId)
    return (
      <AppShell>
        <div className="mx-auto max-w-7xl">
          <Button
            variant="ghost"
            render={<Link href={`/repositories/${id}`} />}
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to repository
          </Button>
          <p className="mt-8 text-muted-foreground">
            Choose a completed review from the repository overview to view its
            findings.
          </p>
        </div>
      </AppShell>
    );

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-8">
        <Button variant="ghost" render={<Link href={`/repositories/${id}`} />}>
          <ArrowLeft className="mr-2 size-4" />
          Back to repository
        </Button>
        <PageHeader
          eyebrow="AI Review"
          title="Detected issues"
          description={
            review
              ? `AI found ${review.issues.length} issue${review.issues.length === 1 ? "" : "s"} in this review.`
              : "Loading findings…"
          }
        />
        {error ? (
          <p className="text-destructive">{error}</p>
        ) : !review ? (
          <p className="text-muted-foreground">Loading issues…</p>
        ) : review.issues.length === 0 ? (
          <p className="rounded-xl border border-border p-8 text-center text-muted-foreground">
            No issues were found in this review.
          </p>
        ) : (
          <div className="space-y-5">
            {review.issues.map((issue) => (
              <IssueCard
                key={issue.id}
                title={issue.title}
                severity={displaySeverity(issue.severity)}
                file={`${issue.filePath}:${issue.line}`}
                description={issue.description}
                href={`/repositories/${id}/issues/${issue.id}?reviewId=${review.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function IssuesPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="mx-auto max-w-7xl text-muted-foreground">
            Loading issues…
          </div>
        </AppShell>
      }
    >
      <IssuesContent />
    </Suspense>
  );
}
