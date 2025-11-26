// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/app/lib/bigcommerce';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const context = searchParams.get('context'); // BigCommerce might provide this initially
  const scope = searchParams.get('scope');

  console.log('🔐 CALLBACK TRIGGERED - BigCommerce OAuth:');
  
  if (!code) {
    console.error('❌ MISSING AUTHORIZATION CODE');
    return NextResponse.json({ 
      error: 'Missing authorization code' 
    }, { status: 400 });
  }

  try {
    console.log('🔄 STEP 1: Exchanging authorization code for access token...');
    
    // STEP 1: Exchange authorization code for access token
    // The context passed here (if present) is mainly for logging. 
    // The actual storeHash is reliably extracted from the tokenData.context.
    const tokenData = await exchangeCodeForToken(code, context || '');
    
    console.log('✅ STEP 1 COMPLETE: Token received successfully!', tokenData);
    
    // STEP 2: Extract the Store Hash from the token response
    // Format is always 'stores/{store_hash}'
    const storeHash = tokenData.context.replace('stores/', '');
    
    if (!storeHash) {
      console.error('❌ COULD NOT EXTRACT STORE HASH from token response');
      return NextResponse.json({ 
        error: 'Could not determine store hash after token exchange' 
      }, { status: 500 });
    }
    
    console.log('📦 Store hash successfully extracted:', storeHash);

    // STEP 4: Redirect to home page and set cookie
    const redirectUrl = `${request.nextUrl.origin}/`;
    const response = NextResponse.redirect(redirectUrl);
    
    // Set a secure cookie with the store hash for session management
    response.cookies.set('store_hash', storeHash, {
      httpOnly: true, // Prevents client-side JS access
      secure: process.env.NODE_ENV === 'production', // Use secure in production
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    console.log('🎉 OAUTH FLOW COMPLETED: Redirecting to:', redirectUrl);

    return response;

  } catch (error) {
    // Consolidated and improved error handling
    console.error('❌ FINAL OAUTH CALLBACK ERROR:', error);
    
    return NextResponse.json({ 
      error: 'Authentication failed. Please check app credentials and callback URL.', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}