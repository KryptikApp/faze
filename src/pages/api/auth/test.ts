// this file is responsible for registering face encodings for a user

import { NextApiRequest, NextApiResponse } from "next";
import { getUserByUsername } from "../../../../prisma/script";

type Data = {
  msg?: string;
};

// api handler that registers face encodings for a user
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const user = await getUserByUsername("jett");
  return res.status(200).json({
    msg: "Test successful." + user?.username,
  });
}
