import { User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getUserById } from "../../../prisma/script";

type Data = {
  user?: User;
  msg?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // Get data submitted in request's body.
  try {
    const userId: string | string[] | undefined = req.headers["user-id"];
    if (!userId || typeof userId != "string") {
      return res.status(400).json({
        msg: "No user id available or user id was of the wrong type (expected string).",
      });
    }
    const user = await getUserById(userId);
    if (!user) {
      return res.status(400).json({
        msg: "Unable to find user by ID.",
      });
    }
    return res.status(200).json({ user: user, msg: "Active user returned." });
  } catch (e: any) {
    return res.status(400).json({ msg: `${e.message}` });
  }
}
