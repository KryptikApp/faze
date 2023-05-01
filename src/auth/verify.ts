import { KryptikFetch } from "@/kryptikFetch";
import { IScan } from "@/recognition";

export async function registerUser(username: string, scans: IScan[]) {
  const encodings = scans.map((scan) => scan.encoding);
  const params = {
    username: username,
    encodings: encodings,
  };
  // make request to server to register user and scans
  const res = await KryptikFetch("/api/auth/register", {
    method: "POST",
    timeout: 8000,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (res.status != 200) {
    return false;
  }
  const approved = res.data.approved;
  return approved;
}

export async function verifyScan(username: string, scans: IScan[]) {
  // for now just use first scan
  const scan = scans[0];
  const params = {
    username: username,
    encoding: scan.encoding,
  };
  // make request to server to login user
  const res = await KryptikFetch("/api/auth/approve", {
    method: "POST",
    timeout: 8000,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (res.status != 200) {
    return false;
  }
  const approved = res.data.approved;
  return approved;
}
