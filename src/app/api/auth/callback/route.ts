// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/app/lib/bigcommerce';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const context = searchParams.get('context'); // BigCommerce might provide this initially

  try {
    const supabase = await createClient()
    // STEP 1: Exchange authorization code for access token
    const tokenData = await exchangeCodeForToken(code ?? '');
        
    // Format is always 'stores/{store_hash}'
    const storeHash = tokenData.context.replace('stores/', '');

    const email = tokenData.user.email;

    // STEP 3: Try to sign in the user, otherwise create them
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: `bc-${storeHash}-${email}`,
    });
    
    // STEP 4: Redirect to home page and set cookie
    const redirectUrl = `${process.env.NEXT_AUTH_URL}?storehash=${storeHash}&token=${tokenData.access_token}`;
    const response = NextResponse.redirect(redirectUrl);

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