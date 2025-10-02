// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/app/lib/bigcommerce';
import { saveStoreData } from '@/app/lib/db';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const context = searchParams.get('context');
  const state = searchParams.get('state');
  const scope = searchParams.get('scope');

  console.log('🔐 CALLBACK TRIGGERED - BigCommerce OAuth:');
  console.log('   - Code:', code ? `✅ Present (${code.length} chars)` : '❌ Missing');
  console.log('   - Context:', context || '❌ Missing');
  console.log('   - State:', state || '⚠️ Optional');
  console.log('   - Scope:', scope || 'No scope');
  console.log('   - Full URL:', request.url);

  // Validate required parameters
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

  try {
    console.log('🔄 STEP 1: Exchanging authorization code for access token...');
    
    // Exchange authorization code for access token
    const tokenData = await exchangeCodeForToken(code, context, context);
    
    console.log('✅ STEP 1 COMPLETE: Token received successfully!');
    
    // Extract store hash from context (format: stores/{store_hash})
    const storeHash = context.replace('stores/', '');
    console.log('📦 STEP 2: Extracted store hash:', storeHash);

    // Store the access token and store data in Upstash Redis
    const scopes = scope ? scope.split(' ') : [];
    console.log('💾 STEP 3: Saving to Upstash Redis...');
    console.log('   - Store Hash:', storeHash);
    console.log('   - Scopes:', scopes);
    console.log('   - User:', tokenData.user);

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
    console.log('   - Saved store hash:', savedData.storeHash);
    console.log('   - Saved user email:', savedData.user.email);

    // Redirect to app dashboard
    const redirectUrl = `${request.nextUrl.origin}/`;
    console.log('🔄 STEP 4: Redirecting to dashboard:', redirectUrl);

    const response = NextResponse.redirect(redirectUrl);
    
    // Set session cookie with store hash
    response.cookies.set('store_hash', storeHash, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    console.log('🎉 BIGCOMMERCE OAUTH FLOW COMPLETED SUCCESSFULLY!');
    console.log('   - Redirecting to:', redirectUrl);
    console.log('   - Store hash cookie set:', storeHash);

    return response;

  } catch (error) {
    console.error('❌ OAUTH CALLBACK ERROR:');
    
    // Detailed error logging
    if (error instanceof Error) {
      console.error('   - Error name:', error.name);
      console.error('   - Error message:', error.message);
      console.error('   - Error stack:', error.stack);
      
      // Specific error handling
      if (error.message.includes('client_id') || error.message.includes('client_secret')) {
        console.error('   - ISSUE: Invalid client credentials');
        return NextResponse.json({ 
          error: 'Invalid app configuration. Please check your BigCommerce app credentials.' 
        }, { status: 500 });
      }
      
      if (error.message.includes('redirect_uri')) {
        console.error('   - ISSUE: Redirect URI mismatch');
        return NextResponse.json({ 
          error: 'Callback URL mismatch. Please verify your BigCommerce app callback URL settings.' 
        }, { status: 500 });
      }
      
      if (error.message.includes('code') || error.message.includes('authorization')) {
        console.error('   - ISSUE: Invalid authorization code');
        return NextResponse.json({ 
          error: 'Invalid authorization code. The code may have expired or been used already.' 
        }, { status: 400 });
      }
    } else {
      console.error('   - Unknown error type:', error);
    }
    
    return NextResponse.json({ 
      error: 'Authentication failed. Please try reinstalling the app.' 
    }, { status: 500 });
  }
}