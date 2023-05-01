import { v4 } from "uuid";
import { NextApiRequest, NextApiResponse } from "next";

import { setCookie } from "cookies-next";
import {
  addRefreshTokenToWhitelist,
  getAllFaceEncodings,
  getUserByUsername,
} from "../../../../prisma/script";
import { validateEncoding } from "@/recognition";
import { generateTokens } from "@/auth/jwt";

type Data = {
  approved?: boolean;
  msg?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log("running approval");
  // Get data submitted in request's body.
  try {
    const body = req.body;
    const username: string = body.username;
    const encoding: number[] = body.encoding;
    // reject if no user is supplied
    if (!username || !encoding) {
      return res
        .status(400)
        .json({ msg: "Username and encoding are required" });
    }

    const user = await getUserByUsername(username);
    // reject if user already exists
    if (!user) {
      return res.status(400).json({ msg: "Unable to find user" });
    }
    // get registered face encodings
    const dbFaceEncodings = await getAllFaceEncodings(user.id, true);
    const registeredEncodings = dbFaceEncodings.map((e) => e.encoding);
    const isValid: boolean = await validateEncoding(
      encoding,
      registeredEncodings
    );
    if (!isValid) {
      return res
        .status(200)
        .json({ msg: "Scans do not match.", approved: false });
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
      .json({ msg: "Auth cookies have been set.", approved: true });
  } catch (e: any) {
    return res.status(400).json({ msg: `${e.message}`, approved: false });
  }
}
