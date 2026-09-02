"use client";

import { useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";

import PageHeader from "@/components/core/page-header";
import RepositoryCard from "@/components/repository/repository-card";
import AppShell from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

import repositoryService, { Repository } from "@/services/repository.service";

export default function RepositoriesPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadRepositories() {
    try {
      setError(null);
      setLoading(true);

      const response = await repositoryService.getRepositories({
        page: 1,
        limit: 10,
        sortBy: "updatedAt",
        order: "desc",
      });

      setRepositories(response.data);
    } catch (error) {
      console.error("Failed to load repositories:", error);

      setError("Unable to load repositories. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function syncRepositories() {
    try {
      setError(null);
      setSyncing(true);

      await repositoryService.syncRepositories();

      await loadRepositories();
    } catch (error) {
      console.error("Failed to sync repositories:", error);

      setError("Unable to sync repositories from GitHub.");
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    loadRepositories();
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHeader
          eyebrow="Repositories"
          title="Your repositories"
          description="Manage connected repositories and monitor AI code reviews."
          actions={
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={syncRepositories}
                disabled={syncing}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`}
                />

                {syncing ? "Syncing..." : "Sync GitHub"}
              </Button>

              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Repository
              </Button>
            </div>
          }
        />

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-2xl border border-border bg-muted/20"
              />
            ))}
          </div>
        ) : repositories.length === 0 ? (
          <div className="rounded-2xl border border-border p-10 text-center">
            <h3 className="text-lg font-semibold">No repositories found</h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Connect your GitHub account and sync your repositories to get
              started.
            </p>

            <Button
              className="mt-5"
              onClick={syncRepositories}
              disabled={syncing}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync GitHub
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {repositories.map((repository) => (
              <RepositoryCard key={repository.id} repository={repository} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
