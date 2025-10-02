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
  const response = await fetch(`${bigcommerceConfig.loginUrl}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: bigcommerceConfig.clientId,
      client_secret: bigcommerceConfig.clientSecret,
      code: code,
      context: context,
      grant_type: 'authorization_code',
      redirect_uri: bigcommerceConfig.authCallback,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${response.statusText} - ${errorText}`);
  }

  return await response.json() as BigCommerceTokenResponse;
}

export async function verifyToken(accessToken: string, storeHash: string): Promise<boolean> {
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
}