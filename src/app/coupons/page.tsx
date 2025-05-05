"use client";

// import { useEffect, useState } from "react";
// import ScheduleComponent from "./schedule/page";
import Input from "@/components/UI/Input";
// import Select from "@/components/UI/Select";
// import { Checkbox } from "@/components/UI/Checkbox";
import { useCouponContext } from "@/components/Context/CouponContext";
import Summary from "./summary/page";
import Targeting from "./targeting/page";
import Rules from "./rules/page";
import UsageLimits from "./usage-limits/page";

// interface Channel {
//     id: number;
//     name: string;
// }

export default function CouponGenerator() {
    const {
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
    } = useCouponContext();
    // const [loading, setLoading] = useState(false);
    // const [error, setError] = useState<string | null>(null);
    // const [formData, setFormData] = useState({
    //     name: "",
    //     discountAmount: "",
    //     discountType: "percentage_discount",
    //     maxUses: "",
    //     channels:"",
    //     appliesTo: "",
    //     excludeSaleItems: true,
    //     categories: "",
    //     canBeUsedWithOtherPromotions: true,
    //     overrideAutomatic: false,
    //     displayName: "",
    //     customerGroupIds: "",
    //     excludedCustomerGroupIds: "",
    //     minOrderCount: "0",
    //     startDate: "",
    //     endDate: "",
    //     strategy: "LEAST_EXPENSIVE",
    //     quantity: "1"
    // });
    // const [couponCodes, setCouponCodes] = useState<string[]>([]);
    // const [channels, setChannels] = useState<Channel[]>([]);
    // const [showChannelModal, setShowChannelModal] = useState(false);
    // const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);

    // const handleChange = (
    //     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    // ) => {
    //     const { name, value, type } = e.target;
    //     const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    //     setFormData((prev) => ({ ...prev, [name]: val }));
    // };

    // const generateCoupon = async () => {
    //     setLoading(true);
    //     setError(null);

    //     try {
    //         const response = await fetch("/api/coupons", {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({
    //                 name: formData.name,
    //                 discountAmount: Number(formData.discountAmount),
    //                 discountType: formData.discountType,
    //                 maxUses: formData.maxUses ? Number(formData.maxUses) : null,
    //                 appliesTo: formData.appliesTo.split(",").map((p) => Number(p.trim())),
    //                 excludeSaleItems: formData.excludeSaleItems,
    //                 categories: formData.categories.split(",").map((c) => Number(c.trim())),
    //                 canBeUsedWithOtherPromotions: formData.canBeUsedWithOtherPromotions,
    //                 overrideAutomatic: formData.overrideAutomatic,
    //                 displayName: formData.displayName,
    //                 customerGroupIds: formData.customerGroupIds.split(",").map((id) => Number(id.trim())),
    //                 excludedCustomerGroupIds: formData.excludedCustomerGroupIds.split(",").map((id) => Number(id.trim())),
    //                 minOrderCount: Number(formData.minOrderCount),
    //                 startDate: formData.startDate,
    //                 endDate: formData.endDate,
    //                 strategy: formData.strategy,
    //                 quantity: Number(formData.quantity)
    //             }),
    //         });

    //         const data = await response.json();
    //         if (response.ok) {
    //             setCouponCodes(data.coupon);
    //         } else {
    //             setError(data.error || "Failed to create coupon");
    //         }
    //     } catch (err) {
    //         setError("An error occurred");
    //         console.error(err);
    //     }

    //     setLoading(false);
    // };

    // useEffect(() => {
    //     const fetchChannels = async () => {
    //         try {
    //             const res = await fetch("/api/channels");
    //             const data = await res.json();
    //             console.log("Channels Data: ", data);
    //             setChannels(data?.data || []);
    //         } catch (error) {
    //             console.error("Failed to fetch channels:", error);
    //         } finally {
    //         }
    //     };

    //     if (formData.appliesTo === "selected") {
    //         fetchChannels();
    //     }
    // }, [formData.appliesTo]);

    return (
        <>
            <div className="bg-white rounded-none border border-gray-200 p-8 text-gray-700">
                <h2 className="text-xl font-semibold mb-6">Edit Promotion</h2>

                <div className="space-y-8">

                    <Summary />

                    <Targeting />

                    <Rules />

                    <UsageLimits />

                    <Input label="How many coupons?" name="quantity" value={formData.quantity} onChange={handleChange} />

                    <button
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                        onClick={generateCoupon}
                        disabled={loading}
                    >
                        {loading ? "Generating..." : "Generate Coupon"}
                    </button>

                    {couponCodes.length > 0 && (
                        <div className="text-center text-green-600 font-medium space-y-1">
                            ✅ Coupons Created:
                            <ul className="mt-1 space-y-1">
                                {couponCodes.map((c, i) => (
                                    <li key={i} className="font-bold">{c}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {error && (
                        <div className="text-center text-red-600">
                            ⚠️ {error}
                        </div>
                    )}

                    {showChannelModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                            <div className="bg-white rounded-lg shadow-lg p-6 w-[400px] max-h-[80vh] overflow-y-auto">
                                <h2 className="text-lg font-semibold mb-4">Select Channels</h2>

                                <label className="flex items-center mb-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedChannelIds.length === channels.length}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedChannelIds(channels.map((c) => c.id.toString()));
                                            } else {
                                                setSelectedChannelIds([]);
                                            }
                                        }}
                                    />
                                    <span className="ml-2">Select All</span>
                                </label>

                                <ul className="mb-4">
                                    {channels.map((channel) => (
                                        <li key={channel.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedChannelIds.includes(channel.id.toString())}
                                                onChange={(e) => {
                                                    const id = channel.id.toString();
                                                    setSelectedChannelIds((prev) =>
                                                        e.target.checked
                                                            ? [...prev, id]
                                                            : prev.filter((cid) => cid !== id)
                                                    );
                                                }}
                                            />
                                            <span className="ml-2">{channel.name}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setShowChannelModal(false)}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded cursor-pointer hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => setShowChannelModal(false)}
                                        className="px-4 py-2 bg-blue-600 text-white cursor-pointer rounded hover:bg-blue-700"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}