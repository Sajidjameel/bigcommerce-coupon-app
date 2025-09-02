import { convertRules } from "@/utils/generate-coupon-function"
import { formatDateWithTimezone, formatTimeForSchedule } from "./format-date"
import { CouponFormData } from "@/types/couponContext-types"

// NEW: Recursive function to process all conditions
export const processCondition = (condition: any): any => {
    if (!condition) return condition
    if (condition.customer) {
        const customer = condition.customer
        if (customer.in_group && Array.isArray(customer.in_group)) {
            customer.in_group = customer.in_group.map((g: any) => (typeof g === "object" ? g.id : g))
        }
        if (customer.in_segment && Array.isArray(customer.in_segment)) {
            customer.in_segment = customer.in_segment.map((s: any) => (typeof s === "object" ? s.id : s))
        }
    }

    // Process categories, products, brands (your existing logic)
    if (condition.categories && Array.isArray(condition.categories)) {
        condition.categories = condition.categories.map((c: any) => (typeof c === "object" ? c.id : c))
    }
    if (condition.products && Array.isArray(condition.products)) {
        if (typeof condition.products[0] === "object") {
            condition.products = condition.products.map((p: any) => p.id)
        }
    }
    if (condition.brands && Array.isArray(condition.brands)) {
        if (typeof condition.brands[0] === "object") {
            condition.brands = condition.brands.map((b: any) => b.id)
        }
    }

    // Process product_custom_field
    if (condition.product_custom_field) {
        try {
            // Handle both direct object and stringified JSON cases
            const customField =
                typeof condition.product_custom_field === "string"
                    ? JSON.parse(condition.product_custom_field)
                    : condition.product_custom_field

            condition.product_custom_field = {
                name: String(customField.name || customField.fieldName || "").trim(),
                values: Array.isArray(customField.values || customField.fieldValues)
                    ? (customField.values || customField.fieldValues).map((v: any) => String(v).trim())
                    : [String(customField.values || customField.fieldValues).trim()],
            }
        } catch (e) {
            console.error("Error processing custom field:", e)
            delete condition.product_custom_field
        }
    }
    console.log("Product Custom Field Rule Input:", condition.product_custom_field)

    // Process product_option
    if (condition.product_option) {
        try {
            // Handle both direct object and stringified JSON cases
            const productOption =
                typeof condition.product_option === "string"
                    ? JSON.parse(condition.product_option)
                    : condition.product_option

            condition.product_option = {
                type: productOption.type || "string_match",
                name: String(productOption.name || productOption.optionName || "").trim(),
                values: Array.isArray(productOption.values || productOption.optionValues)
                    ? (productOption.values || productOption.optionValues).map((v: any) => String(v).trim())
                    : [String(productOption.values || productOption.optionValues).trim()],
            }
        } catch (e) {
            console.error("Error processing product option:", e)
            delete condition.product_option
        }
    }

    console.log("Product Option Rule Input:", condition.product_option)
    // Process nested conditions
    if (condition.not) {
        condition.not = processCondition(condition.not)
    }
    if (condition.and && Array.isArray(condition.and)) {
        condition.and = condition.and.map(processCondition)
    }
    if (condition.or && Array.isArray(condition.or)) {
        condition.or = condition.or.map(processCondition)
    }

    return condition
}

export function preparePayload(formData: CouponFormData, selectedChannelIds: string[]) {
    return {
        name: formData.name || "New Coupon",
        channels: selectedChannelIds[0] === "0" ? [] : selectedChannelIds.map((id) => ({ id: Number(id) })),

        codes: {
            code: formData.codes || "",
            max_uses_per_customer: formData.maxUsesPerCustomer || null,
        },
        created_from: "react_ui",
        customer: {
            group_ids: formData.customerGroupIds
                ? formData.customerGroupIds.split(",").map((id) => Number(id.trim()))
                : [],
            minimum_order_count: Number(formData.minOrderCount) || 0,
            excluded_group_ids: formData.excludedCustomerGroupIds
                ? formData.excludedCustomerGroupIds.split(",").map((id) => Number(id.trim()))
                : [],
            segments: null,
        },
        rules: convertRules(formData.rules),
        currency_code: formData.currencyCode || "GBP",
        redemption_type: "COUPON",
        shipping_address: formData.shipping_address,
        current_uses: 0,
        max_uses: formData.maxUses ? Number(formData.maxUses) : null,
        start_date: formatDateWithTimezone(formData.startDate, formData.startTime),
        end_date: formData.endDate ? formatDateWithTimezone(formData.endDate, formData.endTime) : null,
        schedule: formData.limitAvailability
            ? {
                week_frequency: formData.weekCount,
                week_days: formData.selectedWeekdays.map(
                    day => day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()
                ),
                daily_start_time: formatTimeForSchedule(formData.availabilityStartTime),
                daily_end_time: formatTimeForSchedule(formData.availabilityEndTime),
            }
            : null,
        status: formData.status,
        can_be_used_with_other_promotions: formData.canBeUsedWithOtherPromotions,
        coupon_overrides_automatic_when_offering_higher_discounts: formData.overrideAutomatic,
        display_name: formData.displayName,
    }
}