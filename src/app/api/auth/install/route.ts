// app/api/auth/install/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { bigcommerceConfig } from '@/app/lib/bigcommerce';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const storeHash = searchParams.get('store_hash');
  
  console.log('🔧 INSTALL ROUTE - Starting BigCommerce OAuth:');
  console.log('   - Store hash:', storeHash || 'Not provided');

  // Build OAuth URL according to BigCommerce documentation
  const authParams: Record<string, string> = {
    client_id: bigcommerceConfig.clientId,
    redirect_uri: bigcommerceConfig.authCallback,
    response_type: 'code',
    scope: 'store_v2_information store_v2_products', // Basic scopes for testing
    // State is optional in BigCommerce - we're not including it
  };

  // Include context if store hash is provided
  if (storeHash && storeHash !== '[object Object]' && storeHash.length > 3) {
    authParams.context = `stores/${storeHash}`;
    console.log('✅ Including store hash in context:', storeHash);
  }

  const authUrl = `${bigcommerceConfig.loginUrl}/oauth2/authorize?` + new URLSearchParams(authParams);

  console.log('🔗 BigCommerce OAuth URL generated');
  console.log('   - Client ID:', bigcommerceConfig.clientId ? '✅ Set' : '❌ Missing');
  console.log('   - Redirect URI:', bigcommerceConfig.authCallback);
  console.log('   - Scopes:', authParams.scope);

  return NextResponse.json({ 
    url: authUrl,
    note: 'BigCommerce OAuth does not use state parameter for security'
  });
}