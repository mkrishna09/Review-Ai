import githubService from "../github.service";
import { ParsedRepository } from "./review-engine.types";
import { GithubTreeItem } from "../../types/github.types";

class RepositoryParser {
  private readonly MAX_FILES = 100;

  private readonly ignoredDirectories = new Set([
    "node_modules",
    ".git",
    "dist",
    "build",
    "coverage",
    ".next",
    "vendor",
    "out",
  ]);

  private readonly ignoredExtensions = [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".ico",
    ".pdf",
    ".zip",
    ".lock",
    ".exe",
    ".mp4",
    ".mp3",
    ".webp",
    ".avif",
  ];

  private shouldIgnore(path: string): boolean {
    const parts = path.split("/");

    if (parts.some((part) => this.ignoredDirectories.has(part))) {
      return true;
    }

    if (path.startsWith(".env") || path.includes("/.env")) {
      return true;
    }

    return this.ignoredExtensions.some((extension) => path.endsWith(extension));
  }

  async parseRepository(
    accessToken: string,
    owner: string,
    repo: string,
    branch: string,
  ): Promise<ParsedRepository> {
    const tree = await githubService.getRepositoryTree(
      accessToken,
      owner,
      repo,
      branch,
    );

    const files = tree
      .filter(
        (item: GithubTreeItem) =>
          item.type === "blob" && !this.shouldIgnore(item.path),
      )
      .slice(0, this.MAX_FILES);

    const parsedRepository: ParsedRepository = {
      files: [],
      totalFiles: files.length,
    };

    for (const file of files) {
      try {
        const content = await githubService.getFileContent(
          accessToken,
          owner,
          repo,
          file.path,
        );

        // Keep README separate
        if (file.path === "README.md") {
          parsedRepository.readme = content;
          continue;
        }

        // Keep package.json separate
        if (file.path === "package.json") {
          parsedRepository.packageJson = content;
          continue;
        }

        parsedRepository.files.push({
          path: file.path,
          content,
        });
      } catch {
        continue;
      }
    }

    return parsedRepository;
  }
}

export default new RepositoryParser();
