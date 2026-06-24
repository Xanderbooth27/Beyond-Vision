import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/admin-token";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value;
  const authenticated = isValidAdminSessionToken(token);
  return NextResponse.json({ authenticated });
}
