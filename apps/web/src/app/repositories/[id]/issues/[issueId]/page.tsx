"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, ShieldAlert } from "lucide-react";
import AppShell from "@/components/layout/app-shell";
import Panel from "@/components/core/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CodeViewer from "@/components/review/code-viewer";
import reviewService, { ReviewIssue } from "@/services/review.service";

export default function IssueDetailsPage() {
  const { id, issueId } = useParams<{ id: string; issueId: string }>();
  const reviewId = useSearchParams().get("reviewId");
  const [issue, setIssue] = useState<ReviewIssue | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reviewId) return;
    reviewService
      .getReview(reviewId)
      .then((response) => {
        const found = response.data.issues.find(
          (candidate) => candidate.id === issueId,
        );
        if (found) setIssue(found);
        else setError("This issue was not found in the selected review.");
      })
      .catch(() => setError("We could not load this issue."));
  }, [issueId, reviewId]);

  const backHref = `/repositories/${id}/issues${reviewId ? `?reviewId=${reviewId}` : ""}`;
  if (!reviewId || error)
    return (
      <AppShell>
        <div className="mx-auto max-w-6xl">
          <Button variant="ghost" render={<Link href={backHref} />}>
            <ArrowLeft className="mr-2 size-4" />
            Back to issues
          </Button>
          <p className="mt-8 text-destructive">
            {error ?? "A review is required to open an issue."}
          </p>
        </div>
      </AppShell>
    );
  if (!issue)
    return (
      <AppShell>
        <div className="mx-auto max-w-6xl text-muted-foreground">
          Loading issue…
        </div>
      </AppShell>
    );

  const severity =
    issue.severity === "CRITICAL"
      ? "Critical"
      : `${issue.severity[0]}${issue.severity.slice(1).toLowerCase()}`;
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-8">
        <Button variant="ghost" render={<Link href={backHref} />}>
          <ArrowLeft className="mr-2 size-4" />
          Back to issues
        </Button>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <ShieldAlert className="size-8 text-red-500" />
            <h1 className="text-4xl font-semibold">{issue.title}</h1>
            <Badge variant="destructive">{severity}</Badge>
          </div>
          <p className="font-mono text-sm text-muted-foreground">
            {issue.filePath} · Line {issue.line}
            {issue.column ? `, column ${issue.column}` : ""}
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Panel className="p-6">
              <h2 className="text-xl font-semibold">AI explanation</h2>
              <p className="mt-4 leading-8 text-muted-foreground">
                {issue.description}
              </p>
            </Panel>
            <Panel className="p-6">
              <h2 className="text-xl font-semibold">Suggested fix</h2>
              <p className="mt-4 leading-8 text-muted-foreground">
                {issue.recommendation}
              </p>
            </Panel>
            {issue.codeSnippet ? (
              <Panel className="p-6">
                <h2 className="text-xl font-semibold">Affected code</h2>
                <div className="mt-4">
                  <CodeViewer code={issue.codeSnippet} />
                </div>
              </Panel>
            ) : null}
          </div>
          <div className="space-y-6">
            <Panel className="p-6">
              <h3 className="font-semibold">Classification</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                {issue.category.replaceAll("_", " ")}
              </p>
              <Badge className="mt-4" variant="outline">
                {severity}
              </Badge>
            </Panel>
            <Panel className="p-6">
              <h3 className="font-semibold">Confidence</h3>
              <p className="mt-3 text-2xl font-semibold">
                {issue.confidence === null
                  ? "—"
                  : `${Math.round(issue.confidence * 100)}%`}
              </p>
            </Panel>
            <Button
              variant="outline"
              className="w-full"
              render={
                <a
                  href={`https://github.com/search?q=${encodeURIComponent(issue.filePath)}`}
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              <ExternalLink className="mr-2 size-4" />
              Find file on GitHub
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
