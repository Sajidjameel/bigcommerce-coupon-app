// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/app/lib/bigcommerce';
import { saveStoreData, getState, deleteState } from '@/app/lib/db';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const context = searchParams.get('context');
  const state = searchParams.get('state');
  const scope = searchParams.get('scope');

  console.log('🔐 CALLBACK TRIGGERED:');
  console.log('   - Code:', code ? 'Present' : 'Missing');
  console.log('   - Context:', context || 'Missing');
  console.log('   - State from URL:', state || 'Missing');
  console.log('   - Scope:', scope || 'Missing');

  // Validate required parameters
  if (!code || !context || !state) {
    console.error('❌ Missing required parameters');
    return NextResponse.json({ 
      error: 'Missing required authentication parameters' 
    }, { status: 400 });
  }

  // Get stored state from Upstash Redis
  const storedStateData = await getState(state);
  console.log('   - Stored state from DB:', storedStateData);

  if (!storedStateData) {
    console.error('❌ State not found in database');
    return NextResponse.json({ 
      error: 'Invalid state parameter' 
    }, { status: 400 });
  }

  try {
    console.log('🔄 Exchanging code for token...');
    
    // Exchange authorization code for access token
    const tokenData = await exchangeCodeForToken(code, context, context);
    
    console.log('✅ Token received successfully!');
    console.log('   - User:', tokenData.user?.email);
    
    // Extract store hash from context (format: stores/{store_hash})
    const storeHash = context.replace('stores/', '');
    console.log('   - Store Hash:', storeHash);

    // Store the access token and store data in Upstash Redis
    const scopes = scope ? scope.split(' ') : [];
    console.log('   - Scopes:', scopes);

    await saveStoreData(
      storeHash, 
      tokenData.access_token, 
      {
        id: tokenData.user?.id,
        email: tokenData.user?.email,
      }, 
      scopes
    );

    console.log('✅ Store data saved to Upstash!');

    // Clean up the used state
    await deleteState(state);

    // Redirect to app dashboard
    const redirectUrl = `${request.nextUrl.origin}/dashboard`;
    console.log('🔄 Redirecting to:', redirectUrl);

    const response = NextResponse.redirect(redirectUrl);
    
    // Set session cookie with store hash
    response.cookies.set('store_hash', storeHash, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    console.log('🎉 AUTH FLOW COMPLETED SUCCESSFULLY!');
    return response;

  } catch (error) {
    console.error('❌ AUTH CALLBACK ERROR:', error);
    // Clean up state on error too
    await deleteState(state);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}