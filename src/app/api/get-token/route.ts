import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
    const cookieStore = await cookies(); // ✅ Await cookies() before using .get()
    const token = cookieStore.get("bigcommerce_access_token");

    if (!token) {
        return NextResponse.json({ error: "No token found" }, { status: 401 });
    }

    return NextResponse.json({ token: token.value });
}
