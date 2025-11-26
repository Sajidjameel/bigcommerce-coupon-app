// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import crypto from 'crypto';

export async function GET(request: NextRequest): Promise<NextResponse> {

  const { searchParams } = new URL(request.url)
  const signedRequest = searchParams.get('signed_payload') 
  try{
    const supabase = await createClient()

    if (!signedRequest) {
      throw new Error('The signed request is required to verify the call.');
    }

    const splitRequest = signedRequest.split('.');
    if (splitRequest.length < 2) {
      throw new Error(
        'The signed request will come in two parts seperated by a .(full stop). ' +
        'this signed request contains less than 2 parts.'
      );
    }

    const signature = Buffer.from(splitRequest[1], 'base64').toString('utf8');
    const json = Buffer.from(splitRequest[0], 'base64').toString('utf8');
    const data = JSON.parse(json);

    const expected = crypto.createHmac('sha256', process.env.BIGCOMMERCE_CLIENT_SECRET!)
      .update(json)
      .digest('hex');


    if (expected.length !== signature.length ||
      !crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(signature, 'utf8'))) {
      throw new Error('Signature is invalid');
    }

    const {error} = await supabase.auth.signInWithPassword({email: data.user_email, password: `bc-${data.store_hash}-${data.user_email}`})

    // STEP 4: Redirect to home page and set cookie
    const redirectUrl = `${process.env.NEXT_AUTH_URL}?storehash=${data.store_hash}`;
    NextResponse.redirect(redirectUrl);

    return data;
  }catch(er){
    console.log(er)
    return NextResponse.json({ 
      error: 'Authentication failed. Please check app credentials and callback URL.', 
      details: er instanceof Error ? er.message : 'Unknown error'
    }, { status: 500 });
  }
}