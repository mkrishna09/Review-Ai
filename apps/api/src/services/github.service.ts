import { githubApi } from "../lib/github";
import { GithubApiRepository, GithubTreeItem } from "../types/github.types";

class GithubService {
  async getRepositories(accessToken: string) {
    const response = await githubApi.get<GithubApiRepository[]>("/user/repos", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },

      params: {
        per_page: 100,
        sort: "updated",
      },
    });
    return response.data;
  }
  async getRepositoryTree(
    accessToken: string,
    owner: string,
    repo: string,
    branch: string,
  ) {
    const response = await githubApi.get<{ tree: GithubTreeItem[] }>(
      `/repos/${owner}/${repo}/git/trees/${branch}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          recursive: 1,
        },
      },
    );

    return response.data.tree;
  }
  async getFileContent(
    accessToken: string,
    owner: string,
    repo: string,
    path: string,
  ) {
    const response = await githubApi.get(
      `/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const file = response.data;

    if (file.encoding !== "base64") {
      throw new Error("Unsupported file encoding");
    }

    return Buffer.from(file.content, "base64").toString("utf-8");
  }
}

export default new GithubService();
