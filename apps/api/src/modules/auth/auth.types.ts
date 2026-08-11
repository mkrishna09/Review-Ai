export interface GithubAccessTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

export interface GithubUser {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  email: string | null;
}

export interface GithubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}
