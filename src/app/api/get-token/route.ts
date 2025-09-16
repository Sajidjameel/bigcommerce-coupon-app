import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token } = await req.json();

  const response = NextResponse.json({ success: true });

  response.cookies.set("bigcommerce_access_token", token, {
    httpOnly: true,  
    secure: process.env.NODE_ENV === "production", 
    sameSite: "lax",
    path: "/",
  });

  return response;
}
