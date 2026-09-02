"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, GitBranch, Lock, Play, RefreshCw } from "lucide-react";
import AppShell from "@/components/layout/app-shell";
import Panel from "@/components/core/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import repositoryService, {
  RepositoryDetail,
  ReviewHistoryItem,
} from "@/services/repository.service";
import reviewService, { Review } from "@/services/review.service";

const runningStatuses = new Set(["QUEUED", "RUNNING"]);

export default function RepositoryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [repository, setRepository] = useState<RepositoryDetail | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [history, setHistory] = useState<ReviewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const [repoResponse, historyResponse] = await Promise.all([
          repositoryService.getRepository(params.id),
          repositoryService.getReviewHistory(params.id),
        ]);
        setRepository(repoResponse.data);
        setHistory(historyResponse.data);

        if (repoResponse.data.latestReview?.id) {
          const latest = await reviewService.getReview(
            repoResponse.data.latestReview.id,
          );
          setReview(latest.data);
        }
      } catch {
        setError("We could not load this repository.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [params.id]);

  useEffect(() => {
    if (!review || !runningStatuses.has(review.status)) return;
    const timer = window.setInterval(async () => {
      try {
        const result = await reviewService.getReview(review.id);
        setReview(result.data);
      } catch {
        // Keep the last known review state available to the user.
      }
    }, 3000);
    return () => window.clearInterval(timer);
  }, [review]);

  async function startReview() {
    try {
      setStarting(true);
      setError(null);
      const response = await reviewService.createReview(params.id);
      const created = await reviewService.getReview(response.data.reviewId);
      setReview(created.data);
    } catch {
      setError("Unable to start a review. Please try again.");
    } finally {
      setStarting(false);
    }
  }

  if (loading)
    return (
      <AppShell>
        <div className="text-muted-foreground">Loading repository…</div>
      </AppShell>
    );
  if (error && !repository)
    return (
      <AppShell>
        <p className="text-destructive">{error}</p>
      </AppShell>
    );
  if (!repository) return null;

  const isRunning = review && runningStatuses.has(review.status);
  const metrics = [
    ["Security", review?.securityScore],
    ["Performance", review?.performanceScore],
    ["Maintainability", review?.maintainabilityScore],
    ["Documentation", review?.documentationScore],
  ] as const;

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-8">
        <Button variant="ghost" render={<Link href="/repositories" />}>
          <ArrowLeft className="mr-2 size-4" />
          Back to repositories
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-semibold">{repository.name}</h1>
              <Badge variant="outline">
                <Lock className="mr-1 size-3" />
                {repository.visibility === "PRIVATE" ? "Private" : "Public"}
              </Badge>
            </div>
            <div className="mt-4 flex gap-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <GitBranch className="size-4" />
                {repository.defaultBranch}
              </span>
              <span>{repository.reviewCount} reviews</span>
            </div>
          </div>
          <Button
            onClick={startReview}
            disabled={starting || Boolean(isRunning)}
          >
            {starting || isRunning ? (
              <RefreshCw className="mr-2 size-4 animate-spin" />
            ) : (
              <Play className="mr-2 size-4" />
            )}
            {isRunning
              ? "Review in progress"
              : starting
                ? "Starting review"
                : "Start new review"}
          </Button>
        </div>
        {error && (
          <p className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </p>
        )}
        {review && review.status !== "COMPLETED" ? (
          <Panel className="p-6">
            <h2 className="font-semibold">
              {review.status === "FAILED"
                ? "Review failed"
                : "Analyzing repository"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {review.status === "FAILED"
                ? "Start another review to try again."
                : "This page refreshes automatically when the review is ready."}
            </p>
          </Panel>
        ) : null}
        {review?.status === "COMPLETED" ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <Panel className="p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold">Repository health</h2>
              <p className="mt-3 text-muted-foreground">{review.summary}</p>
              <div className="mt-8 space-y-5">
                {metrics.map(([label, score]) => (
                  <div key={label}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span>{label}</span>
                      <span>{score ?? "—"}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${score ?? 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel className="p-6">
              <h2 className="text-xl font-semibold">Findings</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {review.issues.length} issues found in this review.
              </p>
              <Button
                className="mt-6 w-full"
                variant="outline"
                onClick={() =>
                  router.push(
                    `/repositories/${repository.id}/issues?reviewId=${review.id}`,
                  )
                }
              >
                View issues
              </Button>
            </Panel>
          </div>
        ) : !review ? (
          <Panel className="p-8 text-center">
            <h2 className="text-xl font-semibold">No review yet</h2>
            <p className="mt-2 text-muted-foreground">
              Start a review to see code health scores and actionable findings.
            </p>
          </Panel>
        ) : null}
        {history.length > 0 ? (
          <Panel className="p-6">
            <h2 className="text-xl font-semibold">Review history</h2>
            <div className="mt-5 space-y-3">
              {history.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  className="flex w-full items-center justify-between rounded-lg border border-border p-4 text-left hover:bg-muted"
                  onClick={() =>
                    router.push(
                      `/repositories/${repository.id}/issues?reviewId=${item.id}`,
                    )
                  }
                >
                  <span>
                    <span className="font-medium">
                      {item.status.toLowerCase()}
                    </span>
                    <span className="ml-3 text-sm text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {item.overallScore ?? "—"} score · {item._count.issues}{" "}
                    issues
                  </span>
                </button>
              ))}
            </div>
          </Panel>
        ) : null}
      </div>
    </AppShell>
  );
}
