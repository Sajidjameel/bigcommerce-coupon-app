import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";

// ENV VARS
const STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH!;
const BASE_URL = `https://api.bigcommerce.com/stores/${STORE_HASH}/v3/promotions`;

// Types
interface PromotionRequestBody {
    name?: string;
    displayName?: string;
    startDate?: string;
    endDate?: string;
    canBeUsedWithOtherPromotions?: boolean;
    maxUses?: number;
    maxUsesPerCustomer?: number;
    minOrderCount?: number;
    discountType: "percentage_discount" | "fixed_amount";
    discountAmount: number;
    excludeSaleItems?: boolean;
    strategy?: string;
    categories?: string[] | number[];
    customerGroupIds?: string | string[];
    excludedCustomerGroupIds?: string | string[];
    quantity?: number;
}

interface CouponCodeResponse {
    data?: {
        id: number;
        code: string;
        max_uses: number;
        max_uses_per_customer: number;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

// Helpers
async function generateUniqueCode(): Promise<string> {
    return crypto.randomBytes(5).toString("hex").toUpperCase();
}

async function createCouponCode(
    promotionId: number,
    code: string,
    accessToken: string
): Promise<CouponCodeResponse> {
    const couponPayload = {
        code: code,
        max_uses: 1,
        max_uses_per_customer: 1
    };

    const couponResponse = await fetch(
        `https://api.bigcommerce.com/stores/${STORE_HASH}/v3/promotions/${promotionId}/codes`,
        {
            method: "POST",
            headers: {
                "X-Auth-Token": accessToken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(couponPayload)
        }
    );

    return await couponResponse.json();
}

// Route Handler
export async function POST(req: Request): Promise<NextResponse> {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("bigcommerce_access_token")?.value;

        // const accessToken = "l6723djf2ubh28oa4df6wfcon6duyln"; // Replace with valid token in production

        if (!accessToken) {
            return NextResponse.json(
                { error: "Missing access token. Please log in again." },
                { status: 401 }
            );
        }

        const body: PromotionRequestBody = await req.json();

        const quantity = Number(body.quantity) > 0 ? Number(body.quantity) : 1;

        const codes: string[] = [];

        for (let i = 0; i < quantity; i++) {
            
            const code = await generateUniqueCode();
            // const now = new Date();
    
            // const startDate = body.startDate ? new Date(body.startDate).toISOString() : now.toISOString();
            const endDate = body.endDate ? new Date(body.endDate).toISOString() : null;
    
            const customerGroupIds = Array.isArray(body.customerGroupIds)
                ? body.customerGroupIds
                    .map(id => String(id).trim()) // ✅ Convert to string first
                    .filter(id => id !== "")
                : typeof body.customerGroupIds === "string"
                ? body.customerGroupIds
                    .split(",")
                    .map(id => id.trim())
                    .filter(id => id !== "")
                : [];
    
            // const excludedCustomerGroupIds = Array.isArray(body.excludedCustomerGroupIds)
            //     ? body.excludedCustomerGroupIds
            //         .map(id => String(id).trim())
            //         .filter(id => id !== "")
            //     : typeof body.excludedCustomerGroupIds === "string"
            //     ? body.excludedCustomerGroupIds
            //         .split(",")
            //         .map(id => id.trim())
            //         .filter(id => id !== "")
            //     : [];
            
    
            // if (customerGroupIds.length > 0 && excludedCustomerGroupIds.length > 0) {
            //     return NextResponse.json(
            //         {
            //             error: "You can only provide either 'customerGroupIds' or 'excludedCustomerGroupIds', not both."
            //         },
            //         { status: 400 }
            //     );
            // }
    
            const finalCustomerGroupIds = customerGroupIds.map(Number);
            // const finalExcludedCustomerGroupIds = excludedCustomerGroupIds.map(Number);
    
            const payload = {
                redemption_type: "COUPON",
                name: body.name || code,
                status: "ENABLED",
                end_date: endDate,
                created_from: "react_ui",
                display_name: body.displayName?.trim() || "",
                coupon_overrides_automatic_when_offering_higher_discounts: false,
                can_be_used_with_other_promotions: body.canBeUsedWithOtherPromotions ?? true,
                currency_code: "*",
                max_uses: body.maxUses ?? "1",
                codes: {
                    code: code,
                    max_uses_per_customer: body.maxUsesPerCustomer ?? null
                },
                channels: [],
                customer: {
                    group_ids: finalCustomerGroupIds.length > 0 ? finalCustomerGroupIds : undefined,
                    // excluded_group_ids: finalExcludedCustomerGroupIds.length > 0 ? finalExcludedCustomerGroupIds : undefined,
                    minimum_order_count: body.minOrderCount ?? 0,
                    segments: null
                },
                rules: [
                    {
                        apply_once: true,
                        stop: false,
                        action: {
                            cart_items: {
                                add_free_item: false,
                                discount: {
                                    percentage_amount: body.discountType === "percentage_discount" ? body.discountAmount : undefined,
                                    fixed_amount: body.discountType === "fixed_amount" ? body.discountAmount : undefined
                                },
                                exclude_items_on_sale: body.excludeSaleItems ?? true,
                                include_items_considered_by_condition: true,
                                items: {
                                    categories: body.categories?.map((id: string | number) => Number(id)) ?? []
                                },
                                strategy: body.strategy ?? "LEAST_EXPENSIVE"
                            }
                        }
                    }
                ]
            };
    
            // console.log("Generated Payload:", payload);
    
            const response = await fetch(BASE_URL, {
                method: "POST",
                headers: {
                    "X-Auth-Token": accessToken,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
    
            const data = await response.json() as {
                data?: {
                    id?: number;
                };
                [key: string]: unknown;
            };        
    
            if (!response.ok || !data.data?.id) {
                console.error("BigCommerce error:", data);
                return NextResponse.json({ error: "Failed to create promotion." }, { status: 500 });
            }
    
            const promotionId = data.data.id;
            const couponResponse = await createCouponCode(promotionId, code, accessToken);
    
            if (!couponResponse.data?.id) {
                console.error("Failed to create coupon code:", couponResponse);
                return NextResponse.json({ error: "Failed to create coupon code." }, { status: 500 });
            }
    
            codes.push(code)
            
        }

        return NextResponse.json({ message: "Coupon created", coupon: codes });
    } catch (error) {
        console.error("Server error:", error);
        return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
}
