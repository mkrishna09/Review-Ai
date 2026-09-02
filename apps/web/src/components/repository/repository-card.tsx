import { ArrowUpRight, Clock3, GitBranch, Lock, Star } from "lucide-react";
import Link from "next/link";

import Panel from "@/components/core/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { Repository } from "@/services/repository.service";

interface RepositoryCardProps {
  repository: Repository;
}

function formatUpdatedAt(date: string) {
  const updated = new Date(date);

  if (Number.isNaN(updated.getTime())) {
    return "Unknown";
  }

  const diffMs = Date.now() - updated.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 30) {
    return `${diffDays}d ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);

  if (diffMonths < 12) {
    return `${diffMonths}mo ago`;
  }

  const diffYears = Math.floor(diffMonths / 12);

  return `${diffYears}y ago`;
}

function formatVisibility(visibility: Repository["visibility"]) {
  return visibility === "PRIVATE" ? "Private" : "Public";
}

function formatReviewStatus(status?: string) {
  switch (status) {
    case "COMPLETED":
      return "Reviewed";

    case "RUNNING":
      return "Reviewing";

    case "QUEUED":
      return "Queued";

    case "FAILED":
      return "Failed";

    default:
      return "Not Reviewed";
  }
}

export default function RepositoryCard({ repository }: RepositoryCardProps) {
  const {
    name,
    fullName,
    visibility,
    defaultBranch,
    reviewCount,
    latestReview,
    updatedAt,
  } = repository;

  const score = latestReview?.overallScore;

  return (
    <Panel className="group p-6 transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">{name}</h3>

            <p className="mt-1 text-sm text-muted-foreground">{fullName}</p>

            <div className="mt-3 flex items-center gap-3">
              <Badge variant="outline">
                <Lock className="mr-1 h-3 w-3" />
                {formatVisibility(visibility)}
              </Badge>

              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" />
                {formatUpdatedAt(updatedAt)}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <GitBranch className="h-4 w-4" />
              {defaultBranch}
            </div>

            <div>
              {reviewCount} {reviewCount === 1 ? "Review" : "Reviews"}
            </div>

            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-current text-yellow-400" />

              {score !== null && score !== undefined ? score : "—"}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-4">
          <Badge>{formatReviewStatus(latestReview?.status)}</Badge>

          <Button
            variant="outline"
            render={<Link href={`/repositories/${repository.id}`} />}
          >
            Open
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Panel>
  );
}
