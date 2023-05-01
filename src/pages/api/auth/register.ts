// this file is responsible for registering face encodings for a user

import { NextApiRequest, NextApiResponse } from "next";
import {
  addFaceEncoding,
  addRefreshTokenToWhitelist,
  createUser,
  getUserByUsername,
  hasRegisteredFaceEncodings,
} from "../../../prisma/script";
import { User } from "@prisma/client";
import { generateTokens } from "@/auth/jwt";
import { setCookie } from "cookies-next";
import { v4 } from "uuid";

type Data = {
  approved: boolean;
  msg?: string;
};

// api handler that registers face encodings for a user
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // Get data submitted in request's body.
  try {
    const body = req.body;
    const username: string = body.username;
    const encodingsToSave: number[][] = body.encodings;
    // reject if no user/encodings are supplied
    if (!username || !encodingsToSave) {
      return res
        .status(400)
        .json({ msg: "Username and encodinga are required", approved: false });
    }
    // register new user
    let user: User | null = await getUserByUsername(username);
    if (!user) {
      user = await createUser(username);
    }
    const hasEncodings: boolean = await hasRegisteredFaceEncodings(user.id);
    if (hasEncodings) {
      throw new Error("User already has encodings registered.");
    }
    // register all encodings
    for (const encoding of encodingsToSave) {
      const newEncoding = await addFaceEncoding(user.id, encoding, true);
    }
    const jti = v4();
    const { accessToken, refreshToken } = generateTokens(user, jti);
    await addRefreshTokenToWhitelist(jti, refreshToken, user.id);
    setCookie("accessToken", accessToken, {
      req,
      res,
      secure: process.env.APP_STAGE == "production",
      httpOnly: true,
    });
    setCookie("refreshToken", refreshToken, {
      req,
      res,
      secure: process.env.APP_STAGE == "production",
      httpOnly: true,
    });
    return res
      .status(200)
      .json({ msg: "User encodings have been registered.", approved: true });
  } catch (e: any) {
    return res.status(400).json({ msg: `${e.message}`, approved: false });
  }
}
