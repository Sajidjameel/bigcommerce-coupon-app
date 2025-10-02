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

  console.log('🔐 CALLBACK TRIGGERED - Detailed parameter check:');
  console.log('   - Code present:', !!code, code ? `${code.substring(0, 10)}...` : 'NO CODE');
  console.log('   - Context:', context || 'NO CONTEXT');
  console.log('   - State from URL:', state || 'NO STATE IN URL');
  console.log('   - State from cookie:', storedState || 'NO STATE IN COOKIE');
  console.log('   - Scope:', scope || 'NO SCOPE');
  console.log('   - All cookies:', request.cookies.getAll());

  // Enhanced state validation with detailed error messages
  if (!code) {
    console.error('❌ MISSING AUTHORIZATION CODE');
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
  }

  if (!context) {
    console.error('❌ MISSING CONTEXT PARAMETER');
    return NextResponse.json({ error: 'Missing context parameter' }, { status: 400 });
  }

  if (!state || !storedState) {
    console.error('❌ MISSING STATE PARAMETER');
    console.error('   - State in URL:', state);
    console.error('   - State in cookie:', storedState);
    return NextResponse.json({ error: 'Missing state parameter' }, { status: 400 });
  }

  if (state !== storedState) {
    console.error('❌ STATE MISMATCH');
    console.error('   - URL State:', state);
    console.error('   - Cookie State:', storedState);
    console.error('   - Match:', state === storedState);
    return NextResponse.json({ error: 'State parameter mismatch' }, { status: 400 });
  }

  try {
    console.log('🔄 STEP 1: Exchanging authorization code for access token...');
    
    // Exchange authorization code for access token
    const tokenData = await exchangeCodeForToken(code, context, context);
    
    console.log('✅ STEP 1 COMPLETE: Token received from BigCommerce!');
    
    // Extract store hash from context (format: stores/{store_hash})
    const storeHash = context.replace('stores/', '');
    console.log('📦 STEP 2: Extracted store hash:', storeHash);

    // Store the access token and store data in Upstash Redis
    const scopes = scope ? scope.split(' ') : []; // BigCommerce uses space separation
    console.log('💾 STEP 3: Saving to Upstash Redis...');

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

    // Redirect to app dashboard
    const redirectUrl = `${request.nextUrl.origin}/dashboard`;
    console.log('🔄 STEP 4: Redirecting to dashboard:', redirectUrl);

    const response = NextResponse.redirect(redirectUrl);
    
    // Clear the OAuth cookie
    response.cookies.delete('oauth_state');
    
    // Set session cookie with store hash
    response.cookies.set('store_hash', storeHash, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    console.log('🎉 AUTH FLOW COMPLETED SUCCESSFULLY!');
    return response;

  } catch (error) {
    console.error('❌ AUTH CALLBACK ERROR:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}