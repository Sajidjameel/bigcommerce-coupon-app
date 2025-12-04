// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const signedRequest = searchParams.get('signed_payload');

    if (!signedRequest) {
      throw new Error('Missing signed payload.');
    }

    // Split into JSON + signature
    const [encodedJson, encodedSignature] = signedRequest.split('.');

    if (!encodedJson || !encodedSignature) {
      throw new Error('Invalid signed payload format.');
    }

    const json = Buffer.from(encodedJson, 'base64').toString();
    const signature = Buffer.from(encodedSignature, 'base64').toString();
    const data = JSON.parse(json);

    // Validate HMAC signature from BigCommerce
    const expected = crypto
      .createHmac('sha256', process.env.BIGCOMMERCE_CLIENT_SECRET!)
      .update(json)
      .digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
      throw new Error('Invalid signature.');
    }

    // At this point: LOAD request is valid
    const storeHash = data.store_hash;

    // 🔍 Check if store exists in Supabase
    const { data: storeRecord } = await supabase
      .from('stores')
      .select('*')
      .eq('store_hash', storeHash)
      .single();

    let redirectUrl;

    if (storeRecord) {
      // 🎉 Store installed → Allow access
      redirectUrl = `${process.env.NEXT_AUTH_URL}?storehash=${storeHash}`;
    } else {
      // 🚫 Not installed → App must redirect without storehash
      redirectUrl = `${process.env.NEXT_AUTH_URL}`;
    }

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('❌ LOAD callback error:', error);

    return NextResponse.json(
      {
        error: 'Load endpoint failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
