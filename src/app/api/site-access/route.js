import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "site_access";
const COOKIE_VALUE = "granted";

export async function GET() {
  const cookieStore = await cookies();
  const granted = cookieStore.get(COOKIE_NAME)?.value === COOKIE_VALUE;
  return NextResponse.json({ granted });
}

export async function POST(request) {
  const { password } = await request.json().catch(() => ({}));
  const expected = process.env.SITE_PASSWORD || "deveshe@#2026";

  if (!password || password !== expected) {
    return NextResponse.json(
      { ok: false, message: "Incorrect password" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}

