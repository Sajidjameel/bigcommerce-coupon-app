'use client'

import { useCouponContext } from "@/components/Context/CouponContext";
import ScheduleComponent from "../schedule/page"
import Input from "@/components/UI/Input";
import Select from "@/components/UI/Select";

const Summary = () => {

    const {
            formData,
            handleChange,
            // generateCoupon,
            // loading,
            // error,
            // couponCodes,
            channels,
            selectedChannelIds,
            // setSelectedChannelIds,
            // showChannelModal,
            setShowChannelModal,
        } = useCouponContext();
    
    return (
        <>
            <div className="space-y-8 shadow p-6">
                <div className="space-y-4"></div>
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
            </div>

        </>
    )
}

export default Summary;