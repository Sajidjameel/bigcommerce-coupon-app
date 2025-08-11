import { DiscountType, RewardType, Status } from "@/types/enum";

export const formInitialValue = {
     // Basic info
        name: "",
        displayName: "",
        codes: "", // Can be a string or an array of objects
        // Schedule
        startDate: new Date().toISOString(),
        startTime: "5:00 AM",
        endDate: "",
        endTime: "",
        limitAvailability: false,
        weekCount: 1,
        selectedWeekdays: [],
        availabilityStartTime: "12:00 AM",
        availabilityEndTime: "11:59 PM",
    
        // Status
        status: Status.ENABLED,
    
        // Usage limits
        maxUses: "",
        maxUsesPerCustomer: "",
        minOrderCount: "0",
    
        // Customer targeting
        customerGroupIds: "",
        excludedCustomerGroupIds: "",
    
        // Discount configuration
        discountType: DiscountType.PERCENTAGE_DISCOUNT,
        discountAmount: "10",
        excludeSaleItems: true,
        strategy: "LEAST_EXPENSIVE",
    
        // Product targeting
        categories: "",
    
        // Other settings
        canBeUsedWithOtherPromotions: true,
        overrideAutomatic: false,
        quantity: "1",
        currencyCode: "",
        appliesTo: "any",
    
        // Rules
        rules: [],
        rewardType: RewardType.STACKED, // Default to stacked rewards
        shipping_address: null, // Initialize as null to avoid empty items error
    
        // Targeting
        targetingRules: [],
        selectedCountries: [],
    
        // Channels
        channels: [],
        selectedChannelIds: ["0"], // Default to channel 1
}