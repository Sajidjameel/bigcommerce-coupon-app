// app/lib/bigcommerce.ts
import { BigCommerceTokenResponse } from '@/types/bigcommerce';

export const bigcommerceConfig = {
  clientId: process.env.BIGCOMMERCE_CLIENT_ID || '',
  clientSecret: process.env.BIGCOMMERCE_CLIENT_SECRET || '',
  authCallback: process.env.BIGCOMMERCE_AUTH_CALLBACK_URL || '',
  apiUrl: 'https://api.bigcommerce.com',
  loginUrl: 'https://login.bigcommerce.com',
};

export async function exchangeCodeForToken(
  code: string, 
  context: string, 
  storeHash: string
): Promise<BigCommerceTokenResponse> {
  
  console.log('🔄 EXCHANGING CODE FOR TOKEN:');
  console.log('   - Code length:', code.length);
  console.log('   - Context:', context);
  console.log('   - Store Hash:', storeHash);
  console.log('   - Client ID present:', !!bigcommerceConfig.clientId);
  console.log('   - Client Secret present:', !!bigcommerceConfig.clientSecret);
  console.log('   - Callback URL:', bigcommerceConfig.authCallback);

  const requestBody = {
    client_id: bigcommerceConfig.clientId,
    client_secret: bigcommerceConfig.clientSecret,
    code: code,
    context: context,
    grant_type: 'authorization_code',
    redirect_uri: bigcommerceConfig.authCallback,
  };

  // Log request (without exposing secret)
  console.log('📤 TOKEN REQUEST:');
  console.log('   - URL:', `${bigcommerceConfig.loginUrl}/oauth2/token`);
  console.log('   - Method: POST');
  console.log('   - Client ID:', bigcommerceConfig.clientId);
  console.log('   - Code:', code.substring(0, 10) + '...');
  console.log('   - Context:', context);
  console.log('   - Redirect URI:', bigcommerceConfig.authCallback);

  try {
    const response = await fetch(`${bigcommerceConfig.loginUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 TOKEN RESPONSE:');
    console.log('   - Status:', response.status);
    console.log('   - Status Text:', response.statusText);
    console.log('   - OK:', response.ok);

    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorText = await response.text();
        errorDetails = errorText;
        console.error('❌ TOKEN EXCHANGE FAILED - Response body:', errorText);
      } catch (e) {
        errorDetails = 'Could not read error response';
      }
      
      throw new Error(`BigCommerce API returned ${response.status}: ${response.statusText}. Details: ${errorDetails}`);
    }

    const tokenData = await response.json() as BigCommerceTokenResponse;
    
    console.log('✅ TOKEN EXCHANGE SUCCESSFUL:');
    console.log('   - Access Token Length:', tokenData.access_token?.length || 0);
    console.log('   - Scope:', tokenData.scope);
    console.log('   - User ID:', tokenData.user?.id);
    console.log('   - User Email:', tokenData.user?.email);

    if (!tokenData.access_token) {
      throw new Error('No access token received from BigCommerce');
    }

    return tokenData;

  } catch (error) {
    console.error('❌ TOKEN EXCHANGE ERROR:');
    if (error instanceof Error) {
      console.error('   - Error message:', error.message);
      console.error('   - Error stack:', error.stack);
    } else {
      console.error('   - Unknown error:', error);
    }
    throw error;
  }
}

export async function verifyToken(accessToken: string, storeHash: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${bigcommerceConfig.apiUrl}/stores/${storeHash}/v2/store`,
      {
        headers: {
          'X-Auth-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.ok;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}