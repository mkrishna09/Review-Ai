import config from "../../config/env";
import { githubApi, githubOAuth } from "../../lib/github";
import authRepository from "./auth.repository";
import jwtService from "../../services/jwt.service";

import {
  GithubAccessTokenResponse,
  GithubEmail,
  GithubUser,
} from "./auth.types";

class AuthService {
  /**
   * Redirect URL for GitHub OAuth
   */
  getGithubAuthorizationUrl(state: string) {
    const params = new URLSearchParams({
      client_id: config.github.clientId,
      redirect_uri: `${config.apiUrl}/api/v1/auth/github/callback`,
      scope: "read:user user:email repo",
      state,
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  /**
   * Handles the complete GitHub OAuth flow
   */
  async githubCallback(code: string) {
    /**
     * STEP 1
     * Exchange authorization code for access token
     */

    const tokenResponse = await githubOAuth.post<GithubAccessTokenResponse>(
      "/login/oauth/access_token",
      {
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code,
      },
    );

    const accessToken = tokenResponse.data.access_token;

    /**
     * STEP 2
     * Fetch GitHub profile
     */

    const userResponse = await githubApi.get<GithubUser>("/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const githubUser = userResponse.data;

    /**
     * STEP 3
     * Fetch primary email
     */

    const emailResponse = await githubApi.get<GithubEmail[]>("/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const primaryEmail = emailResponse.data.find((email) => email.primary);

    if (!primaryEmail) {
      throw new Error("Primary GitHub email not found.");
    }

    /**
     * STEP 4
     * Save / Update user
     */

    const user = await authRepository.upsertUser({
      email: primaryEmail.email,
      name: githubUser.name ?? githubUser.login,
      avatarUrl: githubUser.avatar_url,
      githubId: githubUser.id.toString(),
      username: githubUser.login,
      accessToken,
    });

    /**
     * STEP 5
     * Generate JWT
     */

    const token = jwtService.generateToken({
      userId: user.id,
      email: user.email,
    });

    /**
     * STEP 6
     * Return authenticated user
     */
    return {
      token,
      user,
    };
  }
}

export default new AuthService();
