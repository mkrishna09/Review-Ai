import axios from "axios";

export const githubOAuth = axios.create({
  baseURL: "https://github.com",
  headers: {
    Accept: "application/json",
  },
});

export const githubApi = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github+json",
  },
});
