import { KryptikFetch } from "@/kryptikFetch";

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
  const res = await KryptikFetch("/api/user/available", {
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
