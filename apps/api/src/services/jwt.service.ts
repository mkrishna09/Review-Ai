import jwt from "jsonwebtoken";
import config from "../config/env";

class JwtService {
  generateToken(payload: { userId: string; email: string }) {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: "7d",
    });
  }

  verifyToken(token: string) {
    return jwt.verify(token, config.jwtSecret);
  }
}

export default new JwtService();
