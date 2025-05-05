import type { Rule } from "@/types/rule-types"

export const validateConditionProducts = (rule: Rule): string => {
  if (rule.condition !== "buys_products") return ""

  const inclusionRule = rule.config.inclusionRule
  if (!inclusionRule) return "Please select a condition"

  switch (inclusionRule.type) {
    case "brand":
      return inclusionRule.value ? "" : "Choose at least 1 brand"
    case "category":
      return inclusionRule.value ? "" : "Choose at least 1 category"
    case "individual":
      return inclusionRule.value ? "" : "Choose at least 1 product"
    case "all":
      return "" // No validation needed for "all products"
    default:
      return "Please select a condition"
  }
}

export const validateConditionExclusionProducts = (rule: Rule): string => {
  if (rule.condition !== "buys_products") return ""

  // If no exclusion rules exist or they're empty, return no error
  if (!rule.config.exclusionRules || rule.config.exclusionRules.length === 0) return ""

  // Check each exclusion rule
  for (const exclusionRule of rule.config.exclusionRules) {
    if (!exclusionRule) continue

    // Skip validation for "all" type
    if (exclusionRule.type === "all") continue

    // Check if value is empty for non-"all" types
    if (!exclusionRule.value) {
      switch (exclusionRule.type) {
        case "brand":
          return "Choose at least 1 brand "
        case "category":
          return "Choose at least 1 category"
        case "individual":
          return "Choose at least 1 product "
        default:
          return "Please select product"
      }
    }
  }

  return ""
}

export const validateRewardProducts = (rule: Rule): string => {
  if (rule.reward === "gift_cart") {
    return rule.config.giftProduct ? "" : "Please select a gift product"
  }

  if (rule.reward === "free_shipping") {
    if (rule.config.shippingZoneType === "all") {
      return "" // No error if "all zones" is selected
    }
    return rule.config.selectedZones && rule.config.selectedZones.length > 0 ? "" : "Choose at least 1 shipping zone"
  }

  if (rule.reward === "discount_products" || rule.reward === "fixed_price") {
    const rewardInclusionRule = rule.config.rewardInclusionRule
    if (!rewardInclusionRule) return "Please select a reward"

    // Special message for fixed price with specific quantity
    if (rule.reward === "fixed_price" && rule.config.quantity && rule.config.quantity > 0) {
      switch (rewardInclusionRule.type) {
        case "brand":
          return rewardInclusionRule.value ? "" : "Choose at least 1 brand"
        case "category":
          return rewardInclusionRule.value ? "" : "Choose at least 1 category"
        case "individual":
          return rewardInclusionRule.value ? "" : "Choose at least 1 product"
        case "all":
          return "" // No validation needed for "all products"
        default:
          return "Please choose a value in including product "
      }
    }

    switch (rewardInclusionRule.type) {
      case "brand":
        return rewardInclusionRule.value ? "" : "Choose at least 1 brand"
      case "category":
        return rewardInclusionRule.value ? "" : "Choose at least 1 category"
      case "individual":
        return rewardInclusionRule.value ? "" : "Choose at least 1 product"
      case "all":
        return "" // No validation needed for "all products"
      default:
        return "Please select a reward"
    }
  }

  return ""
}

export const validateRewardExclusionProducts = (rule: Rule): string => {
  if (rule.reward !== "discount_products" && rule.reward !== "fixed_price") return ""

  // If no exclusion rules exist or they're empty, return no error
  if (!rule.config.rewardExclusionRules || rule.config.rewardExclusionRules.length === 0) return ""

  // Check each exclusion rule
  for (const exclusionRule of rule.config.rewardExclusionRules) {
    if (!exclusionRule) continue

    // Skip validation for "all" type
    if (exclusionRule.type === "all") continue

    // Check if value is empty for non-"all" types
    if (!exclusionRule.value) {
      switch (exclusionRule.type) {
        case "brand":
          return "Choose at least 1 brand "
        case "category":
          return "Choose at least 1 category "
        case "individual":
          return "Choose at least 1 product "
        default:
          return "Please choose a value "
      }
    }
  }

  return ""
}

export const validateShippingZones = (rule: Rule): string => {
  if (
    rule.reward === "free_shipping" &&
    rule.config.shippingZoneType !== "all" &&
    (!rule.config.selectedZones || rule.config.selectedZones.length === 0)
  ) {
    return "Choose at least 1 shipping zone"
  }
  return ""
}

export const validateRule = (rule: Rule) => {
  return {
    conditionSelection: !rule.condition ? "Please select a condition" : "",
    conditionProducts: validateConditionProducts(rule),
    conditionExclusionProducts: validateConditionExclusionProducts(rule),
    rewardSelection: !rule.reward ? "Please select a reward" : "",
    rewardProducts: validateRewardProducts(rule),
    rewardExclusionProducts: validateRewardExclusionProducts(rule),
  }
}
