import { NextResponse } from "next/server";

export function proxy(req) {
  const url = req.nextUrl.clone();
  const token = req.cookies.get("token");
  if (!token && url.pathname.startsWith("/profile")) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
};
