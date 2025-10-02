import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/app/lib/bigcommerce';
import { saveStoreData } from '@/app/lib/db';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const context = searchParams.get('context');
  const state = searchParams.get('state');
  const scope = searchParams.get('scope');

  // Get the stored state from cookies
  const storedState = request.cookies.get('oauth_state')?.value;

  console.log('🔐 CALLBACK TRIGGERED - Checking parameters:');
  console.log('   - Code:', code ? '✅ Present' : '❌ Missing');
  console.log('   - Context:', context || '❌ Missing');
  console.log('   - State:', state || '❌ Missing');
  console.log('   - Stored State:', storedState ? '✅ Present' : '❌ Missing');
  console.log('   - Scope:', scope || '❌ Missing');

  if (!code || !context || !state || state !== storedState) {
    console.error('❌ AUTH FAILED: Invalid parameters');
    console.error('   Code present:', !!code);
    console.error('   Context present:', !!context);
    console.error('   State matches:', state === storedState);
    return NextResponse.json(
      { error: 'Invalid authentication request' }, 
      { status: 400 }
    );
  }

  try {
    console.log('🔄 STEP 1: Exchanging authorization code for access token...');
    console.log('   - Authorization Code:', code.substring(0, 10) + '...');
    console.log('   - Context:', context);
    
    // Exchange authorization code for access token
    const tokenData = await exchangeCodeForToken(code, context, context);
    
    console.log('✅ STEP 1 COMPLETE: Token received from BigCommerce!');
    console.log('   - Access Token:', tokenData.access_token);
    console.log('   - Token Length:', tokenData.access_token.length);
    console.log('   - Scopes:', tokenData.scope);
    console.log('   - User ID:', tokenData.user?.id);
    console.log('   - User Email:', tokenData.user?.email);
    console.log('   - Context:', tokenData.context);
    
    // Extract store hash from context (format: stores/{store_hash})
    const storeHash = context.replace('stores/', '');
    console.log('📦 STEP 2: Extracted store hash:', storeHash);

    // Store the access token and store data in Upstash Redis
    const scopes = scope ? scope.split(',') : [];
    console.log('💾 STEP 3: Saving to Upstash Redis...');
    console.log('   - Store Hash:', storeHash);
    console.log('   - Access Token:', tokenData.access_token.substring(0, 20) + '...');
    console.log('   - User:', tokenData.user);
    console.log('   - Scopes:', scopes);

    const savedData = await saveStoreData(
      storeHash, 
      tokenData.access_token, 
      {
        id: tokenData.user?.id,
        email: tokenData.user?.email,
      }, 
      scopes
    );

    console.log('✅ STEP 3 COMPLETE: Data saved to Upstash!');
    console.log('   - Saved Data:', JSON.stringify(savedData, null, 2));

    // Redirect to app dashboard
    const redirectUrl = `${request.nextUrl.origin}/dashboard`;
    console.log('🔄 STEP 4: Redirecting to dashboard:', redirectUrl);

    const response = NextResponse.redirect(redirectUrl);
    
    // Clear the OAuth cookies
    response.cookies.delete('oauth_state');
    
    // Set session cookie with store hash
    response.cookies.set('store_hash', storeHash, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    console.log('🎉 AUTH FLOW COMPLETED SUCCESSFULLY!');
    console.log('   - Store Hash Cookie Set:', storeHash);
    console.log('   - Redirecting to:', redirectUrl);

    return response;

  } catch (error) {
    console.error('❌ AUTH CALLBACK ERROR:', error);
    console.error('   Error details:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Authentication failed' }, 
      { status: 500 }
    );
  }
}