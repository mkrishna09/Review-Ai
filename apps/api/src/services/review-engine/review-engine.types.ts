export interface RepositoryFile {
  path: string;
  content: string;
}

export interface ParsedRepository {
  files: RepositoryFile[];

  readme?: string;

  packageJson?: string;

  totalFiles: number;
}
