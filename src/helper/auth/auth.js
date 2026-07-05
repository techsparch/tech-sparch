import { verifyAccess } from "../jwt/jwt";

export function getUser(request) {
  const auth = request.headers.get("authorization");

  if (!auth) return null;

  const token = auth.split(" ")[1];

  try {
    return verifyAccess(token);
  } catch {
    return null;
  }
}