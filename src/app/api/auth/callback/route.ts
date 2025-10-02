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
  const account_uuid = searchParams.get('account_uuid');

  console.log('🔐 CALLBACK TRIGGERED - BigCommerce OAuth:');
  console.log('   - Code:', code ? `✅ Present (${code.length} chars)` : '❌ Missing');
  console.log('   - Context:', context || '⚠️ Not provided by BigCommerce');
  console.log('   - Account UUID:', account_uuid || 'Not provided');
  console.log('   - Scope:', scope || 'No scope');
  console.log('   - Full URL:', request.url);

  // Validate required parameters - ONLY code is absolutely required
  if (!code) {
    console.error('❌ MISSING AUTHORIZATION CODE');
    return NextResponse.json({ 
      error: 'Missing authorization code' 
    }, { status: 400 });
  }

  try {
    console.log('🔄 STEP 1: Exchanging authorization code for access token...');
    
    // If context is not provided, we need to handle this differently
    let storeHash = '';
    
    if (context) {
      // Extract store hash from context (format: stores/{store_hash})
      storeHash = context.replace('stores/', '');
      console.log('📦 Store hash from context:', storeHash);
    } else {
      console.log('⚠️ No context provided - BigCommerce will provide store hash in token response');
      // We'll get the store hash from the token exchange response
    }
    
    // Exchange authorization code for access token
    const tokenData = await exchangeCodeForToken(code, context || '', storeHash);
    
    console.log('✅ STEP 1 COMPLETE: Token received successfully!');
    console.log('   - Access Token Length:', tokenData.access_token?.length);
    console.log('   - User:', tokenData.user);
    console.log('   - Token Context:', tokenData.context);
    
    // If we didn't get store hash from context, get it from token response
    if (!storeHash && tokenData.context) {
      storeHash = tokenData.context.replace('stores/', '');
      console.log('📦 Store hash from token response:', storeHash);
    }
    
    // If we still don't have store hash, we can't proceed
    if (!storeHash) {
      console.error('❌ COULD NOT EXTRACT STORE HASH');
      return NextResponse.json({ 
        error: 'Could not determine store hash' 
      }, { status: 400 });
    }

    // Store the access token and store data in Upstash Redis
    const scopes = scope ? scope.split(' ') : [];
    console.log('💾 STEP 3: Saving to Upstash Redis...');
    console.log('   - Store Hash:', storeHash);
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
    console.log('   - Saved store hash:', savedData.storeHash);
    console.log('   - Saved user email:', savedData.user.email);

    // Redirect to home page
    const redirectUrl = `${request.nextUrl.origin}/`;
    console.log('🔄 STEP 4: Redirecting to home page:', redirectUrl);

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
    }
    
    return NextResponse.json({ 
      error: 'Authentication failed. Please try reinstalling the app.' 
    }, { status: 500 });
  }
}