import { NextRequest, NextResponse } from 'next/server';
import { getStoreData } from '@/app/lib/db';
import { AuthLoadResponse } from '@/types/bigcommerce';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const storeHash = request.cookies.get('store_hash')?.value;

  if (!storeHash) {
    return NextResponse.json(
      { error: 'Not authenticated' }, 
      { status: 401 }
    );
  }

  const storeData = await getStoreData(storeHash);

  if (!storeData) {
    return NextResponse.json(
      { error: 'Store not found' }, 
      { status: 404 }
    );
  }

  const responseData: AuthLoadResponse = {
    storeHash: storeData.storeHash,
    user: storeData.user,
    installedAt: storeData.installedAt,
    scopes: storeData.scopes,
  };

  return NextResponse.json(responseData);
}