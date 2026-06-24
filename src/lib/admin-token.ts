import { createHmac, timingSafeEqual } from "node:crypto";

/** HttpOnly cookie name for dev / hardcoded admin bypass (see API routes). */
export const ADMIN_SESSION_COOKIE = "bv_admin_session";

/**
 * Defaults are for local development only. Override with ADMIN_EMAIL, ADMIN_PASSWORD,
 * and ADMIN_SESSION_SECRET in production.
 */
export function getAdminCredentials() {
  const email = (process.env.ADMIN_EMAIL?.trim() || "admin@beyondvision.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim() || "beyondvision-admin";
  const secret = process.env.ADMIN_SESSION_SECRET?.trim() || "bv-dev-admin-cookie-signing-key";
  return { email, password, secret };
}

export function signAdminSessionToken(): string {
  const { email, password, secret } = getAdminCredentials();
  return createHmac("sha256", secret).update(`${email}\n${password}`).digest("hex");
}

export function isValidAdminSessionToken(token: string | undefined): boolean {
  if (!token || typeof token !== "string") return false;
  const expected = signAdminSessionToken();
  if (token.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(token, "utf8"), Buffer.from(expected, "utf8"));
  } catch {
    return false;
  }
}

export function timingSafeStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
  } catch {
    return false;
  }
}
