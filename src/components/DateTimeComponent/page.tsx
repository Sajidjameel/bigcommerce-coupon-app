"use client"

import { useState, useEffect, useRef } from "react"

// ========== Date Picker Component ==========
interface DatePickerProps {
  label?: string
  selectedDate: Date
  onChange: (date: Date) => void
  className?: string
}

export function DatePicker({ label, selectedDate, onChange, className = "" }: DatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(selectedDate))
  const calendarRef = useRef<HTMLDivElement>(null)

  // Format date as "Day, Month DD, YYYY"
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Get days in month
  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay()
  }

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // Select a date
  const selectDate = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onChange(newDate)
    setShowCalendar(false)
  }

  // Check if a date is the selected date
  const isSelectedDate = (day: number): boolean => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    )
  }

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Generate calendar grid
  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8 flex items-center justify-center text-gray-300"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <div
          key={`day-${day}`}
          onClick={() => selectDate(day)}
          className={`h-8 w-8 flex items-center justify-center rounded-full cursor-pointer text-sm
            ${isSelectedDate(day) ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}
        >
          {day}
        </div>,
      )
    }

    return days
  }

  return (
    <div className={`relative flex flex-wrap items-center gap-2 ${className}`}>
      {label && <div className="bg-yellow-100 text-yellow-800 px-2 py-1 text-sm">{label}</div>}
      <div className="relative" ref={calendarRef}>
        <input
          type="text"
          className="border border-gray-300 rounded px-3 py-2 text-sm w-48 cursor-pointer"
          value={formatDate(selectedDate)}
          onClick={() => setShowCalendar(!showCalendar)}
          readOnly
        />
        {showCalendar && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 w-64">
            <div className="flex justify-between items-center p-2 border-b">
              <button type="button" onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="font-medium">
                {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>
              <button type="button" onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="p-2">
              <div className="grid grid-cols-7 gap-1 mb-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div key={day} className="h-8 w-8 flex items-center justify-center text-gray-500 text-xs">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ========== Time Selector Component ==========
interface TimeSelectProps {
  selectedTime: string
  onChange: (time: string) => void
  className?: string
}

export function TimeSelect({ selectedTime, onChange, className = "" }: TimeSelectProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const timeOptions = [
    "12:00 AM",
    "1:00 AM",
    "2:00 AM",
    "3:00 AM",
    "4:00 AM",
    "5:00 AM",
    "6:00 AM",
    "7:00 AM",
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
    "7:00 PM",
    "8:00 PM",
    "9:00 PM",
    "10:00 PM",
    "11:00 PM",
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSelectTime = (time: string) => {
    onChange(time)
    setShowDropdown(false)
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center justify-between cursor-pointer border border-gray-300 rounded px-3 py-2 text-sm bg-white w-32"
      >
        <span>{selectedTime}</span>
        <svg className="fill-current h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 w-32 max-h-60 overflow-y-auto">
          <div className="py-1">
            {timeOptions.map((time) => (
              <button
                key={time}
                type="button"
                className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelectTime(time)}
              >
                <span className="flex-grow">{time}</span>
                {selectedTime === time && (
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Example usage:
export function DateTimeExample() {
  const [date, setDate] = useState(new Date(2025, 3, 10)) // April 10, 2025
  const [time, setTime] = useState("5:00 AM")

  return (
    <div className="flex items-center gap-2">
      <DatePicker label="Starting" selectedDate={date} onChange={setDate} />
      <TimeSelect selectedTime={time} onChange={setTime} />
    </div>
  )
}
