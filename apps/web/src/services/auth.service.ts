import api from "@/lib/api";

class AuthService {
  me() {
    return api.get("/auth/me");
  }
}

export default new AuthService();
