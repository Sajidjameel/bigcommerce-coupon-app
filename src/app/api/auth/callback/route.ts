import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    const searchParams = new URL(request.url).searchParams;
    const code = searchParams.get("code");
    const context = searchParams.get("context");

    const dashboard_url = process.env.APP_URL + "/dashboard"; // Define dashboard URL

    // 🔹 Check if an access token already exists in cookies
    const cookieStore = await cookies();
    const existingToken = cookieStore.get("bigcommerce_access_token")?.value;

    // ✅ If no `code` but token exists, redirect to dashboard
    if (!code || !context) {
        if (existingToken) {
            return NextResponse.redirect(dashboard_url);
        }
        return NextResponse.json({ error: "Missing auth code or context" }, { status: 400 });
    }

    const client_id = process.env.BIGCOMMERCE_CLIENT_ID;
    const client_secret = process.env.BIGCOMMERCE_CLIENT_SECRET;
    const redirect_uri = process.env.AUTH_CALLBACK_URL;

    const payload = {
        client_id,
        client_secret,
        code,
        context,
        grant_type: "authorization_code",
        redirect_uri,
    };

    try {
        const response = await fetch("https://login.bigcommerce.com/oauth2/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok && data.access_token) {
            // ✅ Store or update the token in cookies
            (await
                // ✅ Store or update the token in cookies
                cookies()).set("bigcommerce_access_token", data.access_token, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                path: "/",
                maxAge: 60 * 60 * 24 * 30, // 30 days
            });

            // ✅ Redirect to dashboard on success
            return NextResponse.redirect(dashboard_url);
        } else {
            // ✅ If OAuth fails but token exists, redirect to dashboard
            if (existingToken) {
                return NextResponse.redirect(dashboard_url);
            }
            return NextResponse.json({ error: "OAuth failed", details: data }, { status: 400 });
        }
    } catch (error) {
        return NextResponse.json({ error: "OAuth request failed", details: (error as Error).message }, { status: 500 });
    }
}
