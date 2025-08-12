"use client"
export const formatDateWithTimezone = (dateString: string, timeString: string) => {
        if (!dateString) return null

        // Create date object from the ISO string
        const dateObj = new Date(dateString)

        // Extract date components (local time)
        const year = dateObj.getFullYear()
        const month = dateObj.getMonth()
        const day = dateObj.getDate()

        // Default to midnight if no time provided
        let hours = 0
        let minutes = 0

        if (timeString) {
          // Parse time string (format: "h:mm AM/PM")
          const [timePart, period] = timeString.split(" ")
          const [hoursStr, minutesStr] = timePart.split(":")

          hours = Number.parseInt(hoursStr, 10)
          minutes = Number.parseInt(minutesStr || "0", 10)

          // Convert 12-hour format to 24-hour
          if (period === "PM" && hours < 12) {
            hours += 12
          } else if (period === "AM" && hours === 12) {
            hours = 0
          }
        }

        // Create new date in local timezone
        const localDate = new Date(year, month, day, hours, minutes, 0)

        // Format the date components
        const pad = (num: number) => num.toString().padStart(2, "0")

        const formattedDate = [localDate.getFullYear(), pad(localDate.getMonth() + 1), pad(localDate.getDate())].join(
          "-",
        )

        const formattedTime = [
          pad(localDate.getHours()),
          pad(localDate.getMinutes()),
          pad(localDate.getSeconds()),
        ].join(":")

        // Get timezone offset in minutes and convert to ±HH:MM
        const offset = localDate.getTimezoneOffset()
        const offsetHours = Math.floor(Math.abs(offset) / 60)
        const offsetMinutes = Math.abs(offset) % 60
        const offsetSign = offset > 0 ? "-" : "+" // Note the sign inversion

        return `${formattedDate}T${formattedTime}${offsetSign}${pad(offsetHours)}:${pad(offsetMinutes)}`
      }

    export   const formatTimeForSchedule = (timeString: string) => {
        if (!timeString) return "00:00:00"

        const [timePart, period] = timeString.split(" ")
        const [hoursStr, minutesStr] = timePart.split(":")

        let hours = Number.parseInt(hoursStr, 10)
        const minutes = Number.parseInt(minutesStr || "0", 10)

        // Convert 12-hour format to 24-hour
        if (period === "PM" && hours < 12) hours += 12
        if (period === "AM" && hours === 12) hours = 0

        return [hours.toString().padStart(2, "0"), minutes.toString().padStart(2, "0"), "00"].join(":")
      }