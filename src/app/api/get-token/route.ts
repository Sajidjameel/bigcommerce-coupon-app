// app/api/get-token/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    
    const token = cookieStore.get("bigcommerce_access_token")?.value;
    const storeHash = cookieStore.get("bigcommerce_store_hash")?.value;

    console.log("🔍 Token check:", { hasToken: !!token, hasStoreHash: !!storeHash });

    if (!token || !storeHash) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      token,
      storeHash,
      status: "connected"
    });

  } catch (error) {
    console.error("❌ Error fetching token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}