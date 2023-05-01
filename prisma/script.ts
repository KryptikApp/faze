import hashToken from "@/auth/hashtoken";
import { FaceEncoding, PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

// check if user exists
export async function getUserByUsername(
  userName: string
): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: {
      username: userName,
    },
  });
  if (user) {
    return user;
  }
  return null;
}

// get user by id
export async function getUserById(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  if (user) {
    return user;
  }
  return null;
}

// create user
export async function createUser(userName: string): Promise<User> {
  const user = await prisma.user.create({
    data: {
      username: userName,
    },
  });
  return user;
}

// delete user... will delete all data associated with user
export async function deleteUserById(id: string): Promise<User | null> {
  try {
    const user = await prisma.user.delete({
      where: {
        id: id,
      },
    });
    return user;
  } catch (e) {
    return null;
  }
}

// add new face encoding
export async function addFaceEncoding(
  userId: string,
  encoding: number[],
  registered: boolean
): Promise<FaceEncoding> {
  // check if user exists
  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User does not exist");
  }
  // add face encoding
  const newEncoding = await prisma.faceEncoding.create({
    data: {
      encoding: encoding,
      userId: user.id,
      registered: registered,
    },
  });
  return newEncoding;
}

// async delete all face encodings for a user
export async function deleteAllFaceEncodings(id: string): Promise<void> {
  // check if user exists
  const user = await getUserById(id);
  if (!user) {
    throw new Error("User does not exist");
  }
  // delete all encodings
  await prisma.faceEncoding.deleteMany({
    where: {
      userId: user.id,
    },
  });
}

// get all face encodings for a user
export async function getAllUserFaceEncodings(
  id: string,
  registered?: boolean
): Promise<FaceEncoding[]> {
  // check if user exists
  const user = await getUserById(id);
  if (!user) {
    throw new Error("User does not exist");
  }
  if (registered) {
    // get all encodings that are registered
    const encodings = await prisma.faceEncoding.findMany({
      where: {
        userId: user.id,
        registered: registered,
      },
    });
    return encodings;
  } else {
    // get all encodings
    const encodings = await prisma.faceEncoding.findMany({
      where: {
        userId: user.id,
      },
    });
    return encodings;
  }
}

export type EncodingsSet = (FaceEncoding & { user: User })[];
export async function getAllFaceEncodings(
  registered: boolean = true
): Promise<EncodingsSet> {
  const encodings: (FaceEncoding & { user: User })[] =
    await prisma.faceEncoding.findMany({
      where: {
        registered: registered,
      },
      include: {
        user: true,
      },
    });
  return encodings;
}

// check if user has registered face encodings
export async function hasRegisteredFaceEncodings(id: string): Promise<boolean> {
  // check if user exists
  const user = await getUserById(id);
  if (!user) {
    throw new Error("User does not exist");
  }
  // get all encodings
  const encodings = await prisma.faceEncoding.findMany({
    where: {
      userId: user.id,
    },
  });
  return encodings.length > 0;
}

/**
 * Revoke refresh token.
 */
export function deleteRefreshToken(id: string) {
  return prisma.refreshToken.update({
    where: {
      id,
    },
    data: {
      revoked: true,
    },
  });
}

export function revokeTokens(userId: string) {
  return prisma.refreshToken.updateMany({
    where: {
      userId,
    },
    data: {
      revoked: true,
    },
  });
}

/**
 * Creates refresh token.
 */
export function addRefreshTokenToWhitelist(
  jti: any,
  refreshToken: any,
  userId: any
) {
  return prisma.refreshToken.create({
    data: {
      id: jti,
      hashedToken: hashToken(refreshToken),
      userId,
    },
  });
}

/**
 * Check if user is in db.
 */
export function findRefreshTokenById(id: string) {
  return prisma.refreshToken.findUnique({
    where: {
      id,
    },
  });
}
