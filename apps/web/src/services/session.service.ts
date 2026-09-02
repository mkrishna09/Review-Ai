import api from "@/lib/api";

class SessionService {
  async hasSession() {
    try {
      await api.get("/repositories/me");
      return true;
    } catch {
      return false;
    }
  }
}

export default new SessionService();
