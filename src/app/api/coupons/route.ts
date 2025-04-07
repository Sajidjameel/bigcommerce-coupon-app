import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";

const STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH!;
const BASE_URL = `https://api.bigcommerce.com/stores/${STORE_HASH}/v3/promotions`;

async function generateUniqueCode(): Promise<string> {
    return crypto.randomBytes(5).toString("hex").toUpperCase();
}

// Define a type for the function parameters
interface CouponPayloadParams {
    code: string;
    discountAmount: number;
    discountType: "percentage_discount" | "fixed_amount";
    appliesTo: number[];
    maxUses: number;
    excludeSaleItems: boolean;
    excludedCategories: number[];
}

// Define a type for the API request body
interface CouponRequestBody {
    discountAmount: number;
    discountType: "percentage_discount" | "fixed_amount";
    appliesTo: number[];
    maxUses: number;
    excludeSaleItems: boolean;
    excludedCategories: number[];
}

// Define the response type for `createPromotion`
interface PromotionResponse {
    data?: { id: number };
    errors?: unknown;
}

function generateCouponPayload({
    code = "",
    discountAmount = 5,
    discountType = "percentage_discount",
    appliesTo = [],
    maxUses = 1,
    excludeSaleItems = true,
    excludedCategories = [],
}: CouponPayloadParams) {
    const itemsField = excludedCategories.length > 0 
        ? { not: { categories: excludedCategories } } 
        : undefined; // Do not include `not` if there are no excluded categories

    return {
        name: code,
        code: code,
        redemption_type: "COUPON",
        type: discountType,
        amount: discountAmount,
        applies_to: { entity: "products", ids: appliesTo },
        enabled: true,
        can_be_used_with_other_promotions: false,
        currency_code: "*",
        channels: [],
        max_uses: maxUses,
        rules: [
            {
                action: {
                    cart_items: {
                        add_free_item: false,
                        discount: {
                            percentage_amount: discountType === "percentage_discount" ? discountAmount : undefined,
                            fixed_amount: discountType === "fixed_amount" ? discountAmount : undefined,
                        },
                        exclude_items_on_sale: excludeSaleItems,
                        include_items_considered_by_condition: true,
                        items: itemsField, // Conditionally include `not`
                        strategy: "LEAST_EXPENSIVE",
                    },
                },
                apply_once: true,
                stop: false,
            },
        ],
    };
}

async function createPromotion(payload: object, accessToken: string): Promise<PromotionResponse> {
    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
            "X-Auth-Token": accessToken,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    return response.json() as Promise<PromotionResponse>;
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        // const accessToken = process.env.BIGCOMMERCE_ACCESS_TOKEN;
        const accessToken = cookieStore.get("bigcommerce_access_token")?.value;
        if (!accessToken) {
            return NextResponse.json({ error: "Missing access token. Please log in again." }, { status: 401 });
        }

        const body: CouponRequestBody = await req.json();
        const code = await generateUniqueCode();

        const payload = generateCouponPayload({
            code,
            discountAmount: body.discountAmount,
            discountType: body.discountType,
            appliesTo: body.appliesTo,
            maxUses: body.maxUses,
            excludeSaleItems: body.excludeSaleItems,
            excludedCategories: body.excludedCategories,
        });

        console.log("Payload: ", payload);

        const promoResponse = await createPromotion(payload, accessToken);
        console.log("Promotion Response: ", promoResponse);
        if (!promoResponse.data?.id) throw new Error("Failed to create promotion");

        return NextResponse.json({ message: "Coupon created", coupon: code });
    } catch (error: unknown) {
        console.error("Coupon creation error:", error);
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : "An unknown error occurred" 
        }, { status: 500 });
    }
}
