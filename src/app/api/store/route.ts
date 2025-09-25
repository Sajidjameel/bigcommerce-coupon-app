import { cookies } from "next/headers";

export async function GET() {
    const cookieStore = await cookies();
    const storeHash = cookieStore.get('bigcommerce_store_hash')?.value;
    const accessToken = cookieStore.get("bigcommerce_access_token")?.value;

    if (!storeHash || !accessToken) {
        console.error("Missing BigCommerce store credentials.");
        return new Response(JSON.stringify({ error: "Server misconfigured" }), { status: 500 });
    }

    try {
        const response = await fetch(`https://api.bigcommerce.com/stores/${storeHash}/v2/store`, {
            method: "GET",
            headers: {
                "X-Auth-Token": accessToken,
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("BigCommerce API Error:", errorText);
            return new Response(JSON.stringify({ error: "Failed to fetch store info", details: errorText }), { status: response.status });
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { status: 200 });

    } catch (error) {
        console.error("Unexpected API Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}