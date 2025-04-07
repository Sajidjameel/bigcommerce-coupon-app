"use client";

import { useState } from "react";

export default function CouponGenerator() {
    const [couponCode, setCouponCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        discountAmount: "",
        discountType: "percentage_discount", // Default
        maxUses: "1",
        appliesTo: "",
        excludeSaleItems: true,
        excludedCategories: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        const finalValue = type === "checkbox" && "checked" in e.target 
            ? (e.target as HTMLInputElement).checked 
            : value;

        setFormData(prev => ({
            ...prev,
            [name]: finalValue,
        }));
    };

    const generateCoupon = async () => {
        setLoading(true);
        setError(null);
    
        try {
            const response = await fetch("/api/coupons", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    discountAmount: Number(formData.discountAmount),
                    discountType: formData.discountType,
                    maxUses: Number(formData.maxUses),
                    appliesTo: formData.appliesTo 
                        ? formData.appliesTo.split(",").map(id => id.trim()).filter(Boolean) 
                        : [], // Ensure valid product IDs
                    
                    excludeSaleItems: formData.excludeSaleItems,
                    excludedCategories: formData.excludedCategories 
                        ? formData.excludedCategories.split(",").map(id => id.trim()).filter(Boolean) 
                        : undefined, // Fix: Do not send empty array
                }),
            });
    
            const data = await response.json();
            if (response.ok) {
                setCouponCode(data.coupon);
            } else {
                setError(data.error || "Failed to create coupon");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
            console.error("Coupon generation error:", err);
        }
    
        setLoading(false);
    };
    

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
    <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
            Generate a BigCommerce Coupon
        </h1>

        <div className="flex flex-col gap-4">
            <input 
                type="number" 
                name="discountAmount" 
                placeholder="Discount Amount" 
                value={formData.discountAmount} 
                onChange={handleChange} 
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />

            <select 
                name="discountType" 
                value={formData.discountType} 
                onChange={handleChange} 
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            >
                <option value="percentage_discount">Percentage Discount</option>
                <option value="fixed_amount">Fixed Amount</option>
            </select>

            <input 
                type="number" 
                name="maxUses" 
                placeholder="Max Uses" 
                value={formData.maxUses} 
                onChange={handleChange} 
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
            
            <input 
                type="text" 
                name="appliesTo" 
                placeholder="Product IDs (comma separated)" 
                value={formData.appliesTo} 
                onChange={handleChange} 
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
            
            <input 
                type="text" 
                name="excludedCategories" 
                placeholder="Excluded Categories (comma separated)" 
                value={formData.excludedCategories} 
                onChange={handleChange} 
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />

            <label className="flex items-center gap-2 text-gray-700">
                <input 
                    type="checkbox" 
                    name="excludeSaleItems" 
                    checked={formData.excludeSaleItems} 
                    onChange={handleChange} 
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded"
                />
                Exclude Sale Items
            </label>
        </div>

        <button
            onClick={generateCoupon}
            disabled={loading}
            className="mt-4 w-full bg-blue-500 text-white px-5 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? "Generating..." : "Generate Coupon"}
        </button>

        {couponCode && (
            <div className="mt-4 p-4 bg-green-100 text-green-800 border-l-4 border-green-600 rounded-lg">
                <p className="font-bold">Coupon Code:</p>
                <p className="text-lg">{couponCode}</p>
            </div>
        )}

        {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-800 border-l-4 border-red-600 rounded-lg">
                <p className="font-bold">Error:</p>
                <p>{error}</p>
            </div>
        )}
    </div>
</div>

    );
}
