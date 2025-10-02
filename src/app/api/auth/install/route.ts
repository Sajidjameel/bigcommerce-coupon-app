// app/api/auth/install/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { bigcommerceConfig } from '@/app/lib/bigcommerce';
import { saveState, getState } from '@/app/lib/db'; // We'll create this

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
    scope: 'store_v2_information store_v2_products', // Basic scopes for testing
    state: state,
  };

  // Only include context if store_hash is provided and valid
  if (storeHash && storeHash !== '[object Object]' && storeHash.length > 3) {
    authParams.context = `stores/${storeHash}`;
    console.log('✅ Including store hash in OAuth context:', storeHash);
  }

  const authUrl = `${bigcommerceConfig.loginUrl}/oauth2/authorize?` + new URLSearchParams(authParams);

  console.log('🔗 OAuth URL generated');
  console.log('   - State:', state);

  // Store state in Upstash Redis instead of cookies
  await saveState(state, {
    storeHash: storeHash,
    timestamp: new Date().toISOString()
  });

  console.log('✅ State saved to Upstash:', state);

  return NextResponse.json({ 
    url: authUrl,
    state: state // For debugging
  });
}