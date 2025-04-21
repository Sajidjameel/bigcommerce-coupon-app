import { RuleType } from "@/types/rule-types"


export const RULE_TYPES: RuleType[] = [
  {
    id: "custom",
    name: "Custom rules",
    description: "",
  },
  {
    id: "bogo",
    name: "Buy one, get one free",
    description: "Customer who add a product will receive a gift in their cart.",
  },
  {
    id: "quantity_percent",
    name: "Buy X products, get % off the next",
    description: "Discount products as customers add more of them to their cart(e.g. 3rd one 50% off).",
  },
  {
    id: "order_subtotal",
    name: "Discount order subtotal",
    description: "Reduce order total, handy for targeting new customers.",
  },
  {
    id: "spend_shipping",
    name: "Spend $100, get free shipping",
    description: "Increase average order size with free shipping when a threshold is met.",
  },
  {
    id: "bundle",
    name: "Buy any X products for $Y amount",
    description: "Bundle a group of products for a fixed price (e.g. 3 items for $100).",
  },
]
