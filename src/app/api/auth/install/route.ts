import { NextRequest, NextResponse } from 'next/server';
// Assuming these dependencies exist and bigcommerceConfig is correctly defined
import { bigcommerceConfig } from '@/app/lib/bigcommerce'; 
import { saveState } from '@/app/lib/db'; 

/**
 * Handles the initiation of the BigCommerce OAuth flow.
 * This route is called either by BigCommerce during the app install process 
 * or by the frontend for a manual connection.
 * * @param request The incoming NextRequest containing search parameters.
 * @returns A JSON response containing the OAuth URL for the client to redirect to.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Ensure the configuration is loaded
  if (!bigcommerceConfig.clientId || !bigcommerceConfig.authCallback || !bigcommerceConfig.loginUrl) {
    console.error("❌ BigCommerce configuration missing. Check environment variables.");
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  // store_hash is typically provided by BigCommerce on initial install
  const storeHash = searchParams.get('store_hash'); 
  
  console.log('🔧 INSTALL ROUTE - Store hash received:', storeHash || 'Not provided');

  // Generate a unique state parameter for security. 
  // This value must be saved and verified in the /api/auth/callback route.
  const state = Buffer.from(Date.now().toString() + Math.random().toString()).toString('base64');
  
  // Build OAuth URL parameters
  const authParams: Record<string, string> = {
    client_id: bigcommerceConfig.clientId,
    redirect_uri: bigcommerceConfig.authCallback,
    response_type: 'code',
    scope: 'store_v2_information store_v2_products store_v2_orders_read', // Added a common scope
    state: state,
  };

  // If a store hash is provided (e.g., from an App Store install), add it to the context.
  if (storeHash && storeHash.length > 3) {
    // The context format is required by BigCommerce when installing within the control panel
    authParams.context = `stores/${storeHash}`; 
    console.log('✅ Including store hash in OAuth context:', storeHash);
  }

  const authUrl = `${bigcommerceConfig.loginUrl}/oauth2/authorize?` + new URLSearchParams(authParams);

  console.log('🔗 OAuth URL generated. Saving state...');

  // Store state and associated data (like storeHash) in Upstash Redis
  // This allows the callback route to confirm the request originated from us.
  await saveState(state, {
    storeHash: storeHash,
    timestamp: new Date().toISOString()
  });

  console.log('✅ State saved to DB:', state);

  // Send the URL back to the client for immediate redirection to BigCommerce
  return NextResponse.json({ 
    url: authUrl,
    state: state 
  });
}
