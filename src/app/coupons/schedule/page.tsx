"use client"

import { DatePicker, TimeSelect } from "@/components/DateTimeComponent/page"
import { useState } from "react"

export default function ScheduleComponent() {
    const [showEndDate, setShowEndDate] = useState(false)
    const [showLimitAvailability, setShowLimitAvailability] = useState(false)
    const [weekCount, setWeekCount] = useState(1)
    const [startDate, setStartDate] = useState<Date>(new Date(2025, 3, 10)) // April 10, 2025
    const [startTime, setStartTime] = useState("5:00 AM")
    const [endDate, setEndDate] = useState<Date>(new Date())
    const [endTime, setEndTime] = useState("hh:mm")

    const handleAddEndDate = () => {
        setShowEndDate(true)
    }

    const handleRemoveEndDate = () => {
        setShowEndDate(false)
    }

    const handleToggleLimitAvailability = () => {
        setShowLimitAvailability(!showLimitAvailability)
    }

    const handleRemoveLimitAvailability = () => {
        setShowLimitAvailability(false)
    }

    const incrementWeekCount = () => {
        setWeekCount((prev) => prev + 1)
    }

    const decrementWeekCount = () => {
        if (weekCount > 1) {
            setWeekCount((prev) => prev - 1)
        }
    }

    return (
        <div className="space-y-4">
            <h3 className="font-medium text-base mb-4">Schedule</h3>

            {/* Starting Date/Time */}

            <div className="flex flex-wrap items-center gap-2">
                <DatePicker label="Starting" selectedDate={startDate} onChange={setStartDate} />
                <TimeSelect selectedTime={startTime} onChange={setStartTime} />
            </div>

            {/* Limit Availability Section */}
            {showLimitAvailability && (
                <div className="flex flex-wrap items-center gap-2 pl-6 mt-4">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Available every</span>

                    <div className="flex items-center border border-gray-300 rounded">
                        <button type="button" onClick={decrementWeekCount} className="px-2 py-1 text-gray-500 hover:text-gray-700 cursor-pointer">
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                        </button>
                        <input type="text" className="w-8 text-center border-0 focus:ring-0" value={weekCount} readOnly />
                        <button type="button" onClick={incrementWeekCount} className="px-2 py-1 text-gray-500 hover:text-gray-700 cursor-pointer">
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>

                    <span className="text-sm">weeks, on</span>

                    <div className="relative">
                        <select
                            className="appearance-none border cursor-pointer border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white w-40"
                            defaultValue=""
                        >
                            <option value="" disabled>
                                Select weekdays
                            </option>
                            <option value="monday">Monday</option>
                            <option value="tuesday">Tuesday</option>
                            <option value="wednesday">Wednesday</option>
                            <option value="thursday">Thursday</option>
                            <option value="friday">Friday</option>
                            <option value="saturday">Saturday</option>
                            <option value="sunday">Sunday</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </div>
            )}

            {showLimitAvailability && (
                <div className="flex flex-wrap items-center gap-2 pl-6">
                    <span className="text-sm">between</span>

                    <div className="relative">
                        <select
                            className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white"
                            defaultValue="12:00 AM"
                        >
                            <option value="12:00 AM">12:00 AM</option>
                            <option value="1:00 AM">1:00 AM</option>
                            <option value="2:00 AM">2:00 AM</option>
                            <option value="3:00 AM">3:00 AM</option>
                            <option value="4:00 AM">4:00 AM</option>
                            <option value="5:00 AM">5:00 AM</option>
                            <option value="6:00 AM">6:00 AM</option>
                            <option value="7:00 AM">7:00 AM</option>
                            <option value="8:00 AM">8:00 AM</option>
                            <option value="9:00 AM">9:00 AM</option>
                            <option value="10:00 AM">10:00 AM</option>
                            <option value="11:00 AM">11:00 AM</option>
                            <option value="12:00 PM">12:00 PM</option>
                            <option value="1:00 PM">1:00 PM</option>
                            <option value="2:00 PM">2:00 PM</option>
                            <option value="3:00 PM">3:00 PM</option>
                            <option value="4:00 PM">4:00 PM</option>
                            <option value="5:00 PM">5:00 PM</option>
                            <option value="6:00 PM">6:00 PM</option>
                            <option value="7:00 PM">7:00 PM</option>
                            <option value="8:00 PM">8:00 PM</option>
                            <option value="9:00 PM">9:00 PM</option>
                            <option value="10:00 PM">10:00 PM</option>
                            <option value="11:00 PM">11:00 PM</option>
                            {/* Add more time options */}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>

                    <span className="text-sm">and</span>

                    <div className="relative">
                        <select
                            className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white"
                            defaultValue="11:59 PM"
                        >
                            <option value="12:00 AM">11:59 PM</option>
                            <option value="1:00 AM">1:00 AM</option>
                            <option value="2:00 AM">2:00 AM</option>
                            <option value="3:00 AM">3:00 AM</option>
                            <option value="4:00 AM">4:00 AM</option>
                            <option value="5:00 AM">5:00 AM</option>
                            <option value="6:00 AM">6:00 AM</option>
                            <option value="7:00 AM">7:00 AM</option>
                            <option value="8:00 AM">8:00 AM</option>
                            <option value="9:00 AM">9:00 AM</option>
                            <option value="10:00 AM">10:00 AM</option>
                            <option value="11:00 AM">11:00 AM</option>
                            <option value="12:00 PM">12:00 PM</option>
                            <option value="1:00 PM">1:00 PM</option>
                            <option value="2:00 PM">2:00 PM</option>
                            <option value="3:00 PM">3:00 PM</option>
                            <option value="4:00 PM">4:00 PM</option>
                            <option value="5:00 PM">5:00 PM</option>
                            <option value="6:00 PM">6:00 PM</option>
                            <option value="7:00 PM">7:00 PM</option>
                            <option value="8:00 PM">8:00 PM</option>
                            <option value="9:00 PM">9:00 PM</option>
                            <option value="10:00 PM">10:00 PM</option>
                            <option value="11:00 PM">11:00 PM</option>
                            {/* Add more time options */}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>

                    <button type="button" onClick={handleRemoveLimitAvailability} className="text-blue-600 hover:text-blue-800 cursor-pointer">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
            )}

            {/* Ending Date/Time (conditional) */}
            {showEndDate && (
                <div className="flex flex-wrap items-center gap-2">
                    <DatePicker label="Ending" selectedDate={endDate} onChange={setEndDate} />
                    <TimeSelect selectedTime={endTime} onChange={setEndTime} />
                    <button type="button" onClick={handleRemoveEndDate} className="text-blue-600 hover:text-blue-800 cursor-pointer">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
            )}

            {/* Action Links */}
            <div className="flex flex-wrap items-center gap-6 mt-2">
                {!showEndDate && (
                    <button
                        type="button"
                        onClick={handleAddEndDate}
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                    >
                        <span className="text-lg mr-1">+</span>
                        Add end date and time
                    </button>
                )}

                {!showLimitAvailability && (
                    <button
                        type="button"
                        onClick={handleToggleLimitAvailability}
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                    >
                        <svg
                            className="w-5 h-5 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        Limit availability to particular weeks/days
                    </button>
                )}
            </div>
        </div>
    )
}
