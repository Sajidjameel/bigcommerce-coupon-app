import { NextRequest, NextResponse } from 'next/server';
import { getStoreData } from '@/app/lib/db';

export async function GET(request: NextRequest) {
  try {
    const storeHash = request.cookies.get('store_hash')?.value;

    console.log("🔍 Get Token - Store hash:", storeHash);

    if (!storeHash) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const storeData = await getStoreData(storeHash);

    if (!storeData) {
      return NextResponse.json(
        { error: "Store data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      token: storeData.accessToken,
      storeHash: storeData.storeHash,
      user: storeData.user,
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