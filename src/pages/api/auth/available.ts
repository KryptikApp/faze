// this file is responsible for registering face encodings for a user

import { NextApiRequest, NextApiResponse } from "next";
import {
  getUserByUsername,
  hasRegisteredFaceEncodings,
} from "../../../../prisma/script";

type Data = {
  isAvailable: boolean;
  isRegistered: boolean;
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
    // reject if no user/encodings are supplied
    if (!username) {
      return res.status(400).json({
        msg: "Username is required.",
        isAvailable: false,
        isRegistered: false,
      });
    }
    // check if user exists
    const user = await getUserByUsername(username);

    if (user) {
      // check if has registered encodings
      const isRegistered = await hasRegisteredFaceEncodings(user.id);
      return res.status(200).json({
        msg: "Username is not available.",
        isAvailable: false,
        isRegistered: isRegistered,
      });
    } else {
      return res.status(200).json({
        msg: "Username is available.",
        isAvailable: true,
        isRegistered: false,
      });
    }
  } catch (e: any) {
    return res
      .status(400)
      .json({ msg: `${e.message}`, isAvailable: false, isRegistered: false });
  }
}
