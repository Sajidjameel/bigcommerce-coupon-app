"use client";

import { useCouponContext } from "@/components/Context/CouponContext";
import Summary from "./summary/page";
import Targeting from "./targeting/page";
import Rules from "./rules/page";
import UsageLimits from "./usage-limits/page";
import Input from "@/components/UI/Input";
import { useEffect, useRef } from "react";

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

    const handleCheckboxChange = (channelId: number) => {
        const id = channelId.toString();
        console.log(id, "channels id handle checkbox change");
        console.log(selectedChannelIds, "selectchannelsid inside handle checkbox change");

        if (channelId === 0) return;

        setSelectedChannelIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((cid) => cid !== id && cid !== "0");
            } else {
                return [...prev.filter((cid) => cid !== "0"), id];
            }
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            console.log(e.target.checked, "selectallll");
            setSelectedChannelIds(channels.map((c) => c.id.toString()).filter((id) => id !== "0"));

            console.log(selectedChannelIds, "selectchannelsid inside handle selectall");
        } else {
            setSelectedChannelIds([]);
        }
    };



    useEffect(() => {
        console.log("Updated selectedChannelIds:", selectedChannelIds);
    }, [selectedChannelIds]);



    return (
        <>
            <div className="bg-white rounded-none border border-gray-200 p-8 text-gray-700">
                <h2 className="text-xl font-semibold mb-6">Edit Promotion</h2>

                <div className="space-y-8">
                    <Summary />
                    <Targeting />
                    <Rules />
                    <UsageLimits />

                    <Input
                        label="How many coupons?"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                    />

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

                                <label className="flex items-center mb-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="cursor-pointer"
                                        checked={
                                            channels.filter((c) => c.id !== 0).length > 0 &&
                                            selectedChannelIds.length === channels.filter((c) => c.id !== 0).length
                                        }
                                        onChange={handleSelectAll}
                                    />
                                    <span className="ml-2">Select All</span>
                                </label>

                                <ul className="mb-4">
                                    {channels.map((channel) => (
                                        <li key={channel.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="cursor-pointer"
                                                checked={selectedChannelIds.includes(channel.id.toString())}
                                                onChange={() => handleCheckboxChange(channel.id)}
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