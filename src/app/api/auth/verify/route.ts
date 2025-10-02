// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getStoreData } from '@/app/lib/db';
import { AuthLoadResponse } from '@/types/bigcommerce';

export async function GET(request: NextRequest): Promise<NextResponse> {
  // 1. Get storeHash from the cookie set during the callback
  const storeHash = request.cookies.get('store_hash')?.value;

  if (!storeHash) {
    return NextResponse.json(
      { error: 'Not authenticated via cookie' }, 
      { status: 401 }
    );
  }

  // 2. Load the store data from the DB
  const storeData = await getStoreData(storeHash);

  if (!storeData) {
    return NextResponse.json(
      { error: 'Store data not found in database' }, 
      { status: 404 }
    );
  }

  // 3. Respond with necessary, non-sensitive data
  const responseData: AuthLoadResponse = {
    storeHash: storeData.storeHash,
    user: storeData.user,
    installedAt: storeData.installedAt,
    scopes: storeData.scopes,
    hasAccessToken: !!storeData.accessToken, // Confirm the token exists
  };

  return NextResponse.json(responseData);
}