import githubService from "../github.service";
import { ParsedRepository } from "./review-engine.types";
import { GithubTreeItem } from "../../types/github.types";

class RepositoryParser {
  private readonly MAX_FILES = 100;
  private readonly MAX_FILE_CHARACTERS = 20_000;

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
    ".pem",
    ".key",
    ".p12",
    ".pfx",
    ".der",
  ];

  private shouldIgnore(path: string): boolean {
    const parts = path.split("/");

    if (parts.some((part) => this.ignoredDirectories.has(part))) {
      return true;
    }

    const lowerPath = path.toLowerCase();
    if (
      path.startsWith(".env") ||
      path.includes("/.env") ||
      /(^|\/)(credentials|secrets?|id_rsa|id_ed25519)(\.|$)/.test(lowerPath)
    ) {
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

    const concurrency = 8;
    for (let i = 0; i < files.length; i += concurrency) {
      const chunk = files.slice(i, i + concurrency);
      await Promise.all(
        chunk.map(async (file: GithubTreeItem) => {
          try {
            const content = await githubService.getFileContent(
              accessToken,
              owner,
              repo,
              file.path,
            );

            if (content.length > this.MAX_FILE_CHARACTERS) return;

            // Keep README separate
            if (file.path === "README.md") {
              parsedRepository.readme = content;
              return;
            }

            // Keep package.json separate
            if (file.path === "package.json") {
              parsedRepository.packageJson = content;
              return;
            }

            parsedRepository.files.push({
              path: file.path,
              content,
            });
          } catch {
            // Silently skip unreadable or non-decodable files
          }
        }),
      );
    }

    return parsedRepository;
  }
}

export default new RepositoryParser();
