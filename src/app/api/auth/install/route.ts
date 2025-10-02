import { NextRequest, NextResponse } from 'next/server';
import { bigcommerceConfig } from '@/app/lib/bigcommerce';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const storeHash = searchParams.get('store_hash');
  
  console.log('🔧 INSTALL ROUTE - Store hash received:', storeHash || 'Not provided');

  // Generate a unique state parameter for security
  const state = Buffer.from(Date.now().toString()).toString('base64');
  
  // Build OAuth URL
  const authParams: Record<string, string> = {
    client_id: bigcommerceConfig.clientId,
    redirect_uri: bigcommerceConfig.authCallback,
    response_type: 'code',
    scope: 'store_v2_information store_v2_products',
    state: state,
  };

  // Only include context if store_hash is provided and valid
  if (storeHash && storeHash !== '[object Object]' && storeHash.length > 3) {
    authParams.context = `stores/${storeHash}`;
    console.log('✅ Including store hash in OAuth context:', storeHash);
  } else {
    console.log('ℹ️ No valid store hash provided - BigCommerce will provide it in callback');
  }

  const authUrl = `${bigcommerceConfig.loginUrl}/oauth2/authorize?` + new URLSearchParams(authParams);

  console.log('🔗 OAuth URL generated');
  console.log('   - Store Hash provided:', storeHash || 'None');
  console.log('   - State:', state);
  console.log('   - Redirect URI:', bigcommerceConfig.authCallback);

  // Create JSON response instead of redirect
  const response = NextResponse.json({ 
    url: authUrl,
    storeHashProvided: !!storeHash
  });

  // Store state in httpOnly cookie for verification
  // Use sameSite: 'none' and proper domain for cross-origin
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: true, // Must be true for HTTPS
    sameSite: 'none', // Allow cross-origin
    maxAge: 60 * 10, // 10 minutes
    path: '/', // Available on all paths
  });

  console.log('✅ State cookie set:', state);

  return response;
}