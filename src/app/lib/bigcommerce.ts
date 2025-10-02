// app/lib/bigcommerce.ts
import { BigCommerceTokenResponse } from '@/types/bigcommerce';

export const bigcommerceConfig = {
  clientId: process.env.BIGCOMMERCE_CLIENT_ID || '',
  clientSecret: process.env.BIGCOMMERCE_CLIENT_SECRET || '',
  authCallback: process.env.BIGCOMMERCE_AUTH_CALLBACK_URL || '',
  apiUrl: 'https://api.bigcommerce.com',
  loginUrl: 'https://login.bigcommerce.com',
};
// app/lib/bigcommerce.ts - Update the exchangeCodeForToken function
export async function exchangeCodeForToken(
  code: string, 
  context: string, 
  storeHash: string
): Promise<BigCommerceTokenResponse> {
  
  console.log('🔄 EXCHANGING CODE FOR TOKEN:');
  console.log('   - Code length:', code.length);
  console.log('   - Context provided:', context || 'Not provided');
  console.log('   - Store hash provided:', storeHash || 'Not provided');

  const requestBody: any = {
    client_id: bigcommerceConfig.clientId,
    client_secret: bigcommerceConfig.clientSecret,
    code: code,
    grant_type: 'authorization_code',
    redirect_uri: bigcommerceConfig.authCallback,
  };

  // Only include context if it's provided
  if (context) {
    requestBody.context = context;
  }

  console.log('📤 TOKEN REQUEST BODY:', {
    ...requestBody,
    client_secret: '***HIDDEN***'
  });

  try {
    const response = await fetch(`${bigcommerceConfig.loginUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 TOKEN RESPONSE STATUS:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ TOKEN EXCHANGE FAILED:', errorText);
      throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
    }

    const tokenData = await response.json() as BigCommerceTokenResponse;
    
    console.log('✅ TOKEN EXCHANGE SUCCESSFUL:');
    console.log('   - Access Token Received:', !!tokenData.access_token);
    console.log('   - Context in Response:', tokenData.context);
    console.log('   - User:', tokenData.user);

    return tokenData;

  } catch (error) {
    console.error('❌ TOKEN EXCHANGE ERROR:', error);
    throw error;
  }
}