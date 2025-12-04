// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/app/lib/bigcommerce';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Missing OAuth code' }, { status: 400 });
    }

    // 1️⃣ Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);

    const storeHash = tokenData.context.replace('stores/', '');

    // 2️⃣ Store token in Supabase keyed by store_hash
    await supabase
      .from('stores')
      .upsert({
        store_hash: storeHash,
        access_token: tokenData.access_token,
        scope: tokenData.scope,
      });

    // 3️⃣ Redirect into your app
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}?storehash=${storeHash}`;

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error("OAuth Callback Error:", error);

    return NextResponse.json(
      {
        error: "OAuth callback failed",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
