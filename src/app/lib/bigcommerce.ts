// app/lib/bigcommerce.ts
import { BigCommerceTokenResponse } from '@/types/bigcommerce';

// --- CONFIGURATION ---
export const bigcommerceConfig = {
  clientId: process.env.BIGCOMMERCE_CLIENT_ID || '',
  clientSecret: process.env.BIGCOMMERCE_CLIENT_SECRET || '',
  // This must match the URL you set in the BigCommerce Developer Portal
  authCallback: process.env.BIGCOMMERCE_AUTH_CALLBACK_URL || '', 
  apiUrl: 'https://api.bigcommerce.com',
  loginUrl: 'https://login.bigcommerce.com',
};

// --- CORE FUNCTIONALITY ---

/**
 * Exchanges the BigCommerce authorization code for an access token and store context.
 */
export async function exchangeCodeForToken(
  code: string, 
): Promise<BigCommerceTokenResponse> {
  
  const requestBody: any = {
    client_id: bigcommerceConfig.clientId,
    client_secret: bigcommerceConfig.clientSecret,
    code: code,
    grant_type: 'authorization_code',
    redirect_uri: bigcommerceConfig.authCallback,
  };
  
  // NOTE: BigCommerce does not require the context parameter for this request.
  // It will be returned in the response object. We pass it only for logging purposes.
  try {
    const response = await fetch(`${bigcommerceConfig.loginUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Log the full error to help debug issues like client_id/secret errors
      console.error('❌ TOKEN EXCHANGE FAILED:', errorText); 
      throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
    }

    const tokenData = await response.json() as BigCommerceTokenResponse;
    
    // Validate that we received a token and context
    if (!tokenData.access_token || !tokenData.context) {
        throw new Error('Token exchange successful but missing access_token or context in response.');
    }

    return tokenData;

  } catch (error) {
    console.error('❌ TOKEN EXCHANGE ERROR:', error);
    throw error;
  }
}