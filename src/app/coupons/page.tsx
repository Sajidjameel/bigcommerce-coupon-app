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
            <div className="bg-white rounded-none border border-gray-200 p-8">
                <h2 className="text-xl font-semibold mb-6">Edit Promotion</h2>

                <div className="space-y-8">

                    <Summary />

                    <Targeting />

                    <Rules />

                    <UsageLimits />

                    {/* <div className="space-y-4"></div>
                    <h3 className="font-medium text-base">Summary</h3>
                    <Input label="Promotion Name" name="name" value={formData.name} onChange={handleChange} />
                    <Input
                        label="Display name (optional)"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleChange}
                    />

                    <div className="mt-6">
                        <h3 className="font-medium text-base mb-4">Channels</h3>

                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <div className="bg-yellow-100 text-yellow-800 px-2 py-1 text-sm">
                                This promotion applies to
                            </div>

                            <div className="relative">
                                <Select
                                    label=""
                                    name="appliesTo"
                                    value={formData.appliesTo}
                                    onChange={handleChange}
                                    options={[
                                        { label: "any channel", value: "any" },
                                        { label: "selected channels", value: "selected" },
                                    ]}
                                />
                            </div>

                            {formData.appliesTo === "selected" && (
                                <div className="flex-1 flex items-center relative">
                                    <button
                                        onClick={() => setShowChannelModal(true)}
                                        className="text-gray-400 text-sm text-left hover:text-gray-600 w-full border border-gray-300 hover:border-gray-500 rounded cursor-pointer pl-10 pr-3 py-2 flex items-center gap-2"
                                    >
                                        {selectedChannelIds.length > 0 ? (
                                            <>
                                                {channels
                                                    .filter((c) => selectedChannelIds.includes(c.id.toString()))
                                                    .slice(0, 1)
                                                    .map((c) => (
                                                        <span
                                                            key={c.id}
                                                            className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs"
                                                        >
                                                            {c.name}
                                                        </span>
                                                    ))}
                                                {selectedChannelIds.length > 1 && (
                                                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                                                        +{selectedChannelIds.length - 1}
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            "Click to open channel selector"
                                        )}
                                    </button>

                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <svg
                                            className="w-4 h-4 text-gray-500"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <ScheduleComponent />

                    <Input label="Discount Amount" name="discountAmount" value={formData.discountAmount} onChange={handleChange} />
                    <Select label="Discount Type" name="discountType" value={formData.discountType} onChange={handleChange}
                        options={[
                            { label: "Percentage", value: "percentage_discount" },
                            { label: "Fixed Amount", value: "fixed_amount" },
                        ]}
                    />
                    <Input label="Max Uses" name="maxUses" value={formData.maxUses} onChange={handleChange} />
                    <Input label="Applies To Product IDs (comma-separated)" name="appliesTo" value={formData.appliesTo} onChange={handleChange} />
                    <Input label="Category IDs (comma-separated)" name="categories" value={formData.categories} onChange={handleChange} />
                    <Input label="Customer Group IDs" name="customerGroupIds" value={formData.customerGroupIds} onChange={handleChange} />
                    <Input label="Excluded Group IDs" name="excludedCustomerGroupIds" value={formData.excludedCustomerGroupIds} onChange={handleChange} />
                    <Input label="Min Order Count" name="minOrderCount" value={formData.minOrderCount} onChange={handleChange} />
                    <Input label="Start Date" name="startDate" type="datetime-local" value={formData.startDate} onChange={handleChange} />
                    <Input label="End Date" name="endDate" type="datetime-local" value={formData.endDate} onChange={handleChange} />
                    <Select label="Discount Strategy" name="strategy" value={formData.strategy} onChange={handleChange}
                        options={[
                            { label: "Least Expensive", value: "LEAST_EXPENSIVE" },
                            { label: "Most Expensive", value: "MOST_EXPENSIVE" },
                            { label: "All", value: "ALL" },
                        ]}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <Checkbox name="excludeSaleItems" label="Exclude Sale Items" checked={formData.excludeSaleItems} onChange={handleChange} />
                    <Checkbox name="canBeUsedWithOtherPromotions" label="Stack with Other Promotions" checked={formData.canBeUsedWithOtherPromotions} onChange={handleChange} />
                    <Checkbox name="overrideAutomatic" label="Override Automatic Discounts" checked={formData.overrideAutomatic} onChange={handleChange} />
                </div> */}

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