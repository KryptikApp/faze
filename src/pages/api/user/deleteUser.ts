import { NextApiRequest, NextApiResponse } from "next";
import { deleteUserById, getUserById } from "../../../../prisma/script";
import { deleteCookie } from "cookies-next";

type Data = {
  msg?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log("running delete user");
  // Get data submitted in request's body.
  try {
    const userId: string | string[] | undefined = req.headers["user-id"];
    console.log(req.headers);
    console.log(userId);
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
    // delete token cookies
    deleteCookie("accessToken", {
      req,
      res,
    });
    deleteCookie("refreshToken", {
      req,
      res,
    });
    await deleteUserById(userId);
    return res.status(200).json({ msg: "Active user returned." });
  } catch (e: any) {
    return res.status(400).json({ msg: `${e.message}` });
  }
}
