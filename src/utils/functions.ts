import { ExtendedRule } from "@/types/couponContext-types"
import { DiscountProducts, DiscountSubtoatal, FixedPrice, FreeShipping, GiftCart } from "./create-actions-utils"


export function CreateActionOnRule(rule: ExtendedRule, apiRule: any) {
    if (rule.reward === "gift_cart" && rule.config?.giftProduct) {
      GiftCart(rule, apiRule)
    } else if (rule.reward === "discount_products") {
        DiscountProducts(rule, apiRule)
    }
    else if (rule.reward === "free_shipping") {
     FreeShipping(rule,apiRule)   
    }
    else if (rule.reward === "discount_subtotal") {
        DiscountSubtoatal(rule,apiRule)
       
    } else if (rule.reward === "fixed_price") {
        FixedPrice(rule,apiRule)
       
}
}