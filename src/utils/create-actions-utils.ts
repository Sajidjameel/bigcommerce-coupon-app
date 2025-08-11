import { ExtendedRule } from "@/types/couponContext-types"
import { processExclusionRules } from "./exclusion-rule-funtion"
import { processInclusionRule } from "./inclusion-rule-function"

export function GiftCart(rule: ExtendedRule, apiRule: any) {
    // Gift item reward (unchanged)
    let productId: number
    let productName = ""

    if (typeof rule.config.giftProduct === "object" && rule.config.giftProduct.id) {
        productId = rule.config.giftProduct.id
        productName = rule.config.giftProduct.name || `Product ${productId}`
    } else if (typeof rule.config.giftProduct === "string") {
        try {
            const parsed = JSON.parse(rule.config.giftProduct)
            productId = parsed.id || Number(rule.config.giftProduct)
            productName = parsed.name || `Product ${productId}`
        } catch (e) {
            productId = Number(rule.config.giftProduct)
            productName = `Product ${productId}`
            console.error("Failed to parse JSON array:", e)

        }
    } else {
        productId = 0
    }

    if (productId > 0) {
        apiRule.action.gift_item = {
            quantity: rule.config.giftQuantity || 1,
            product_id: productId,
            product_name: productName,
        }
    }
}

export function DiscountProducts(rule: ExtendedRule, apiRule: any) {
    // Product discount reward (unchanged)
    apiRule.action.cart_items = {
        discount: {},
        strategy: rule.config?.appliedTarget?.toUpperCase() || "LEAST_EXPENSIVE",
        add_free_item: false,
        as_total: rule.config?.discountFrom === "total_price" || false,
        include_items_considered_by_condition: rule.config?.includeConditionProducts || false,
        exclude_items_on_sale: !(rule.config?.includeOnSale || false),
        quantity: rule.config?.appliedQuantity || 1,
        items: {},
    }

    if (rule.config?.discountType === "percentage") {
        apiRule.action.cart_items.discount.percentage_amount = String(rule.config.discountValue || 10)
    } else {
        apiRule.action.cart_items.discount.fixed_amount = String(rule.config.discountValue || 10)
    }

    const conditions = []

    if (rule.config?.rewardInclusionRule) {
        const inclusionItems = processInclusionRule(rule.config.rewardInclusionRule)
        if (inclusionItems) {
            if (inclusionItems.and) {
                conditions.push(...inclusionItems.and)
            } else {
                conditions.push(inclusionItems)
            }
        }
    }

    if (rule.config?.rewardExclusionRules?.length) {
        const exclusionItems = processExclusionRules(rule.config.rewardExclusionRules)
        if (exclusionItems) {
            conditions.push({ not: exclusionItems })
        }
    }

    if (rule.config?.customFields) {
        apiRule.condition.cart.items.and = apiRule.condition.cart.items.and || []
        rule.config.customFields.forEach((field) => {
            // Extract exactly as shown in console examples
            const customField = {
                product_custom_field: {
                    name: field.name?.trim() || "",
                    values: Array.isArray(field.values)
                        ? field.values.map((v) => String(v).trim())
                        : [String(field.values).trim()],
                },
            }
            apiRule.condition.cart.items.and.push(customField)
        })
    }

    // Process product options from config
    if (rule.config?.productOptions) {
        apiRule.condition.cart.items.and = apiRule.condition.cart.items.and || []
        rule.config.productOptions.forEach((option) => {
            // Extract exactly as shown in console examples
            const productOption = {
                product_option: {
                    type: option.type || "string_match",
                    name: option.name?.trim() || "",
                    values: Array.isArray(option.values)
                        ? option.values.map((v) => String(v).trim())
                        : [String(option.values).trim()],
                },
            }
            apiRule.condition.cart.items.and.push(productOption)
        })
    }

    if (conditions.length === 0) {
        apiRule.action.cart_items.items.products = [1]
    } else if (conditions.length === 1) {
        Object.assign(apiRule.action.cart_items.items, conditions[0])
    } else {
        apiRule.action.cart_items.items.and = conditions
    }
}

export function FreeShipping( rule:ExtendedRule ,apiRule:any){
    // Free shipping reward
        apiRule.action.shipping = {
            free_shipping: true,
        }

        // Handle zone selection based on config
        if (rule.config?.shippingZoneType === "selected" && rule.config?.selectedZones && rule.config.selectedZones.length > 0) {
            // Extract zone IDs from the selectedZones array
            const selectedZones = rule.config.selectedZones || []
            const zoneIds = selectedZones.map(zone => zone.zoneid)

            // Add zone IDs to the shipping action
            apiRule.action.shipping.zone_ids = zoneIds

            // Also add zone names for reference
            apiRule.action.shipping.zone_names = selectedZones.map(zone => zone.name)
        }
}

export function DiscountSubtoatal(rule:ExtendedRule , apiRule:any){
     // Cart subtotal discount reward (unchanged)
        apiRule.action.cart = {
            discount: {},
        }

        if (rule.config?.discountType === "percentage") {
            apiRule.action.cart.discount.percentage_amount = String(rule.config.discountValue || 10)
        } else {
            apiRule.action.cart.discount.fixed_amount = String(rule.config.discountValue || 10)
        }
}

export function FixedPrice(rule :ExtendedRule,apiRule:any){
     // Fixed price reward (unchanged)
        apiRule.action.fixed_price_set = {
            fixed_price: String(rule.config?.price || 0),
            quantity: rule.config?.quantity || 1,
            strategy: (rule.config?.applyTo || "Least expensive").toUpperCase().replace(" ", "_"),
            exclude_items_on_sale: !(rule.config?.includeOnSale || false),
            include_items_considered_by_condition: rule.config?.includeConditionProducts || false,
            items: {},
        }

        apiRule.apply_once = rule.config?.perCart !== "unlimited"

        const conditions = []

        if (rule.config?.rewardInclusionRule) {
            const inclusionItems = processInclusionRule(rule.config.rewardInclusionRule)
            if (inclusionItems) {
                if (inclusionItems.all) {
                    conditions.push({ products: [1] })
                } else if (inclusionItems.and) {
                    conditions.push(...inclusionItems.and)
                } else {
                    conditions.push(inclusionItems)
                }
            }
        }

        if (rule.config?.rewardExclusionRules?.length) {
            const exclusionItems = processExclusionRules(rule.config.rewardExclusionRules)
            if (exclusionItems) {
                if (exclusionItems.and) {
                    conditions.push({ not: { and: exclusionItems.and } })
                } else {
                    conditions.push({ not: exclusionItems })
                }
            }
        }

        // Process custom fields from config
        if (rule.config?.customFields) {
            apiRule.condition.cart.items.and = apiRule.condition.cart.items.and || []
            rule.config.customFields.forEach((field) => {
                // Extract exactly as shown in console examples
                const customField = {
                    product_custom_field: {
                        name: field.name?.trim() || "",
                        values: Array.isArray(field.values)
                            ? field.values.map((v) => String(v).trim())
                            : [String(field.values).trim()],
                    },
                }
                apiRule.condition.cart.items.and.push(customField)
            })
        }

        // Process product options from config
        if (rule.config?.productOptions) {
            apiRule.condition.cart.items.and = apiRule.condition.cart.items.and || []
            rule.config.productOptions.forEach((option) => {
                // Extract exactly as shown in console examples
                const productOption = {
                    product_option: {
                        type: option.type || "string_match",
                        name: option.name?.trim() || "",
                        values: Array.isArray(option.values)
                            ? option.values.map((v) => String(v).trim())
                            : [String(option.values).trim()],
                    },
                }
                apiRule.condition.cart.items.and.push(productOption)
            })
        }

        if (conditions.length === 0) {
            apiRule.action.fixed_price_set.items.products = [1]
        } else if (conditions.length === 1) {
            apiRule.action.fixed_price_set.items = conditions[0]
        } else {
            apiRule.action.fixed_price_set.items.and = conditions
        }
    }

