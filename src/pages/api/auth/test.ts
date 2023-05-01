// this file is responsible for registering face encodings for a user

import { NextApiRequest, NextApiResponse } from "next";

type Data = {
  msg?: string;
};

// api handler that registers face encodings for a user
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  return res.status(200).json({
    msg: "Test successful.",
  });
}
