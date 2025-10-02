// app/api/auth/install/route.ts - Production version
import { NextRequest, NextResponse } from 'next/server';
import { bigcommerceConfig } from '@/app/lib/bigcommerce';

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Get store hash from:
  // 1. Query parameters (from App Marketplace)
  // 2. Headers (for embedded apps)
  // 3. If not available, BigCommerce will provide it in the OAuth callback
  const { searchParams } = new URL(request.url);
  const storeHash = searchParams.get('store_hash') || 
                   request.headers.get('x-store-hash');

  const state = Buffer.from(Date.now().toString()).toString('base64');
  
  const authUrl = `${bigcommerceConfig.loginUrl}/oauth2/authorize?` + new URLSearchParams({
    client_id: bigcommerceConfig.clientId,
    redirect_uri: bigcommerceConfig.authCallback,
    response_type: 'code',
    scope: 'store_v2_information store_v2_products',
    state: state,
    ...(storeHash && { context: `stores/${storeHash}` }),
  });

  const response = NextResponse.json({ url: authUrl });

  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
  });

  return response;
}