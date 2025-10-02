// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/app/lib/bigcommerce';
import { saveStoreData } from '@/app/lib/db';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const context = searchParams.get('context');
  const state = searchParams.get('state'); // This might be null in BigCommerce
  const scope = searchParams.get('scope');

  console.log('🔐 CALLBACK TRIGGERED - BigCommerce OAuth:');
  console.log('   - Code:', code ? '✅ Present' : '❌ Missing');
  console.log('   - Context:', context || '❌ Missing');
  console.log('   - State:', state || '⚠️ Not provided by BigCommerce');
  console.log('   - Scope:', scope || 'No scope');

  // According to BigCommerce docs, only code and context are required
  // State is optional in BigCommerce OAuth flow
  if (!code) {
    console.error('❌ MISSING AUTHORIZATION CODE');
    return NextResponse.json({ 
      error: 'Missing authorization code' 
    }, { status: 400 });
  }

  if (!context) {
    console.error('❌ MISSING CONTEXT PARAMETER');
    return NextResponse.json({ 
      error: 'Missing context parameter' 
    }, { status: 400 });
  }

  // State is optional in BigCommerce - only verify if provided
  if (state) {
    console.log('🔒 State parameter provided, but BigCommerce OAuth does not require state validation');
    // If you want to add state validation later, you can implement it here
  } else {
    console.log('ℹ️ State parameter not provided - this is normal for BigCommerce OAuth');
  }

  try {
    console.log('🔄 Exchanging authorization code for access token...');
    
    // Exchange authorization code for access token
    const tokenData = await exchangeCodeForToken(code, context, context);
    
    console.log('✅ TOKEN EXCHANGE SUCCESSFUL!');
    console.log('   - Access Token Length:', tokenData.access_token.length);
    console.log('   - User:', tokenData.user?.email);
    console.log('   - Scopes:', tokenData.scope);
    
    // Extract store hash from context (format: stores/{store_hash})
    const storeHash = context.replace('stores/', '');
    console.log('   - Store Hash:', storeHash);

    // Store the access token and store data in Upstash Redis
    const scopes = scope ? scope.split(' ') : [];
    console.log('💾 Saving store data to Upstash...');

    const savedData = await saveStoreData(
      storeHash, 
      tokenData.access_token, 
      {
        id: tokenData.user?.id,
        email: tokenData.user?.email,
      }, 
      scopes
    );

    console.log('✅ STORE DATA SAVED TO UPSTASH!');
    console.log('   - Store Hash:', savedData.storeHash);
    console.log('   - User Email:', savedData.user.email);

    // Redirect to app dashboard
    const redirectUrl = `${request.nextUrl.origin}/dashboard`;
    console.log('🔄 Redirecting to dashboard:', redirectUrl);

    const response = NextResponse.redirect(redirectUrl);
    
    // Set session cookie with store hash
    response.cookies.set('store_hash', storeHash, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    console.log('🎉 BIGCOMMERCE OAUTH FLOW COMPLETED SUCCESSFULLY!');
    return response;

  } catch (error) {
    console.error('❌ OAUTH CALLBACK ERROR:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('client_id')) {
        return NextResponse.json({ 
          error: 'Invalid client configuration. Please check your BigCommerce app credentials.' 
        }, { status: 500 });
      }
      if (error.message.includes('redirect_uri')) {
        return NextResponse.json({ 
          error: 'Redirect URI mismatch. Please check your BigCommerce app callback URL configuration.' 
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Authentication failed. Please try again.' 
    }, { status: 500 });
  }
}