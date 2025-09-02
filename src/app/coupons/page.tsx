"use client";

import { useCouponContext } from "@/components/Context/CouponContext";
import Summary from "./summary/page";
import Targeting from "./targeting/page";
import Rules from "./rules/page";
import UsageLimits from "./usage-limits/page";
import Input from "@/components/UI/Input";
import { useEffect, useRef } from "react";
import React from "react"
import ExcelJS from "exceljs"
import { Download } from "lucide-react"


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
        progress,
        estimatedTime
    } = useCouponContext();

    const handleCheckboxChange = (channelId: number) => {
        const id = channelId.toString();
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
            setSelectedChannelIds(channels.map((c) => c.id.toString()).filter((id) => id !== "0"));
        } else {
            setSelectedChannelIds([]);
        }
    };



    useEffect(() => {
        console.log("Updated selectedChannelIds:", selectedChannelIds);
    }, [selectedChannelIds]);


    const handleDownload = async () => {
        // 1. Create workbook and worksheet
        const workbook = new ExcelJS.Workbook()
        const sheet = workbook.addWorksheet("Coupons")

        // 2. Add header row
        sheet.addRow(["Coupon Code"])

        // 3. Add data rows
        couponCodes.forEach((code) => {
            sheet.addRow([code])
        })

        // 4. Format header row (optional)
        sheet.getRow(1).font = { bold: true }

        // 5. Generate buffer
        const buffer = await workbook.xlsx.writeBuffer()

        // 6. Trigger download
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
        const url = window.URL.createObjectURL(blob)

        const a = document.createElement("a")
        a.href = url
        a.download = "coupons.xlsx"
        a.click()
        window.URL.revokeObjectURL(url)
    }


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
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition cursor-pointer"
                        onClick={generateCoupon}
                        disabled={loading}

                    >Generate Coupons
                        {loading && (
                            <div className="fixed inset-0 flex items-center justify-center bg-opacity-40 z-50">
                                <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center">
                                    <p className="text-lg font-semibold mb-3">Generating Coupons...</p>

                                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-2 transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>

                                    <p className="mt-2 text-sm text-gray-600">{progress}% completed</p>

                                    {estimatedTime !== null && (
                                        <p className="mt-2 text-sm text-gray-500">
                                            Estimated time: {estimatedTime} minute{estimatedTime > 1 ? 's' : ''}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                    </button>

                    {!loading && couponCodes.length > 0 && !error && (
                        <div className="text-center text-green-700 font-semibold my-2">
                            Successfully created {couponCodes.length} coupon{couponCodes.length > 1 ? "s" : ""}
                        </div>
                    )}

                    {couponCodes.length > 0 && (
                        <div className="text-center font-bold space-y-1 flex items-center justify-center">
                            Download Coupons:
                            <button
                                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 justify-center ml-3  cursor-pointer"
                                onClick={handleDownload}
                                title="Download Coupons"
                            >
                               Coupons Code <Download size={20} /> 
                            </button>
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
