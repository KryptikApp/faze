import { KryptikFetch } from "@/kryptikFetch";
import { User } from "@prisma/client";

/**
 * @description Checks if username is available and registered
 * @param username username to check
 * @returns an object with isAvailable and isRegistered properties
 */
export async function checkUserRegistered(username: string) {
  const params = {
    username: username,
  };
  // make request to server to check if username is available
  // return true if available, false if not
  const res = await KryptikFetch("/api/auth/available", {
    method: "POST",
    timeout: 8000,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (res.status != 200) {
    return {
      isAvailable: false,
      isRegistered: false,
    };
  }
  const isAvailable = res.data.isAvailable;
  const isRegistered = res.data.isRegistered;
  return {
    isAvailable: isAvailable,
    isRegistered: isRegistered,
  };
}

export async function getActiveUser(): Promise<User | null> {
  // try to create share on db
  try {
    const res = await KryptikFetch("/api/user/activeUser", {
      method: "POST",
      timeout: 8000,
      headers: { "Content-Type": "application/json" },
    });
    const user: User | undefined = res.data.user;
    if (res.status != 200 || !user) {
      return null;
    }
    console.log(user);
    return user;
  } catch (e) {
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    const res = await KryptikFetch("/api/auth/logout", {
      method: "POST",
      timeout: 8000,
      headers: { "Content-Type": "application/json" },
    });
    if (res.status != 200) {
      throw new Error("Unable to logout");
    }
  } catch (e) {
    // for now do nothing
  }
}

/**Makes request to delete user from database. Returns true if successful. */
export async function deleteUser(): Promise<boolean> {
  // try to add new friend on server
  try {
    const res = await KryptikFetch("/api/user/deleteUser", {
      method: "POST",
      timeout: 8000,
      headers: { "Content-Type": "application/json" },
    });
    if (res.status != 200) {
      throw new Error("Unable to delete user");
    }
    return true;
  } catch (e) {
    return false;
  }
}
