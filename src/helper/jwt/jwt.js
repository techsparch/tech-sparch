import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

export function signAccessToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: "30d", }
  );
}

export function signRefreshToken(user) {
  return jwt.sign(
    { id: user._id },
    REFRESH_SECRET,
    { expiresIn: "1y" }
  );
}

// verify
export function verifyAccess(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function verifyRefresh(token) {
  return jwt.verify(token, REFRESH_SECRET);
}