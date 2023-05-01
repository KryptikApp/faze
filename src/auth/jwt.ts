import { User } from "@prisma/client";
import jwt from "jsonwebtoken";

export function generateAccessToken(user: User) {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("No secret available for JWT generation.");
  return jwt.sign({ userId: user.id }, secret, {
    expiresIn: "10h",
  });
}

export function generateRefreshToken(user: User, jti: any) {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("No secret available for JWT generation.");
  return jwt.sign(
    {
      userId: user.id,
      jti,
    },
    secret,
    {
      expiresIn: "2 days",
    }
  );
}

export function generateTokens(user: User, jti: any) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, jti);

  return {
    accessToken,
    refreshToken,
  };
}
