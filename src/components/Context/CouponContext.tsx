"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Channel {
    id: number;
    name: string;
}

interface CouponFormData {
    name: string;
    discountAmount: string;
    discountType: string;
    maxUses: string;
    channels: string;
    appliesTo: string;
    excludeSaleItems: boolean;
    categories: string;
    canBeUsedWithOtherPromotions: boolean;
    overrideAutomatic: boolean;
    displayName: string;
    customerGroupIds: string;
    excludedCustomerGroupIds: string;
    minOrderCount: string;
    startDate: string;
    endDate: string;
    strategy: string;
    quantity: string;
}

interface CouponContextProps {
    formData: CouponFormData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    generateCoupon: () => Promise<void>;
    loading: boolean;
    error: string | null;
    couponCodes: string[];
    channels: Channel[];
    selectedChannelIds: string[];
    showChannelModal: boolean;
    setShowChannelModal: (v: boolean) => void;
    setSelectedChannelIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const CouponContext = createContext<CouponContextProps | undefined>(undefined);

export const CouponProvider = ({ children }: { children: React.ReactNode }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<CouponFormData>({
        name: "",
        discountAmount: "",
        discountType: "percentage_discount",
        maxUses: "",
        channels: "",
        appliesTo: "",
        excludeSaleItems: true,
        categories: "",
        canBeUsedWithOtherPromotions: true,
        overrideAutomatic: false,
        displayName: "",
        customerGroupIds: "",
        excludedCustomerGroupIds: "",
        minOrderCount: "0",
        startDate: "",
        endDate: "",
        strategy: "LEAST_EXPENSIVE",
        quantity: "1"
    });
    const [couponCodes, setCouponCodes] = useState<string[]>([]);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [showChannelModal, setShowChannelModal] = useState(false);
    const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev) => ({ ...prev, [name]: val }));
    };

    const generateCoupon = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    discountAmount: Number(formData.discountAmount),
                    discountType: formData.discountType,
                    maxUses: formData.maxUses ? Number(formData.maxUses) : null,
                    appliesTo: formData.appliesTo.split(",").map((p) => Number(p.trim())),
                    excludeSaleItems: formData.excludeSaleItems,
                    categories: formData.categories.split(",").map((c) => Number(c.trim())),
                    canBeUsedWithOtherPromotions: formData.canBeUsedWithOtherPromotions,
                    overrideAutomatic: formData.overrideAutomatic,
                    displayName: formData.displayName,
                    customerGroupIds: formData.customerGroupIds.split(",").map((id) => Number(id.trim())),
                    excludedCustomerGroupIds: formData.excludedCustomerGroupIds.split(",").map((id) => Number(id.trim())),
                    minOrderCount: Number(formData.minOrderCount),
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    strategy: formData.strategy,
                    quantity: Number(formData.quantity),
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setCouponCodes(data.coupon);
            } else {
                setError(data.error || "Failed to create coupon");
            }
        } catch (err) {
            setError("An error occurred");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const res = await fetch("/api/channels");
                const data = await res.json();
                setChannels(data?.data || []);
            } catch (error) {
                console.error("Failed to fetch channels:", error);
            }
        };

        if (formData.appliesTo === "selected") {
            fetchChannels();
        }
    }, [formData.appliesTo]);

    return (
        <CouponContext.Provider
            value={{
                formData,
                handleChange,
                generateCoupon,
                loading,
                error,
                couponCodes,
                channels,
                selectedChannelIds,
                setSelectedChannelIds,
                showChannelModal,
                setShowChannelModal,
            }}
        >
            {children}
        </CouponContext.Provider>
    );
};

export const useCouponContext = () => {
    const context = useContext(CouponContext);
    if (!context) {
        throw new Error("useCouponContext must be used within a CouponProvider");
    }
    return context;
};
