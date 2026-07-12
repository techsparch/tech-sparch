import { verifyAccess } from "../jwt/jwt";

export function getUser(request) {
  const auth = request.headers.get("authorization");

  // 1. Check if it exists AND is formatted correctly
  if (!auth || !auth.startsWith("Bearer ")) {
    return null;
  }

  // 2. Now it's safe to split
  const token = auth.split(" ")[1];

  try {
    const lg = verifyAccess(token);
    return lg;
  } catch (error) {
    // It's helpful to log the error in development so you know IF it failed
    // because it expired vs. being an invalid signature.
    console.log("JWT Verification Failed:", error.message);
    return null;
  }
}
