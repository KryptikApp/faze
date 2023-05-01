import { KryptikFetch } from "@/kryptikFetch";

export async function logout(): Promise<void> {
  // try to add new friend on server
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
