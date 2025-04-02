import React from 'react'
import { format, parse, isWithinInterval } from 'date-fns'

interface ScheduleProps {
    classes: {
        id: string
        className: string
        startDate: string
        endDate: string
        schedule: {
            days: string[]
            times: string[]
        }
        tutorUsername?: string
        studentUsername?: string
    }[]
    userType: 'student' | 'tutor'
}

interface TimeSlot {
    hour: number
    minute: number
    display: string
}

const Schedule: React.FC<ScheduleProps> = ({ classes, userType }) => {
    // Constants
    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const START_HOUR = 7 // 7 AM
    const END_HOUR = 23 // 11 PM
    const INTERVAL = 30 // 30 minutes

    // Generate time slots
    const generateTimeSlots = (): TimeSlot[] => {
        const slots: TimeSlot[] = []
        for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
            for (let minute = 0; minute < 60; minute += INTERVAL) {
                slots.push({
                    hour,
                    minute,
                    display: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
                })
            }
        }
        return slots
    }

    const timeSlots = generateTimeSlots()

    // Helper function to normalize time string
    const normalizeTime = (time: string): TimeSlot | null => {
        try {
            const [hourStr, minuteStr = '0'] = time.trim().split(':')
            const hour = parseInt(hourStr, 10)
            const minute = parseInt(minuteStr, 10)
            
            if (isNaN(hour) || isNaN(minute)) return null
            
            return {
                hour,
                minute,
                display: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
            }
        } catch {
            return null
        }
    }

    // Find class for a specific time slot and day
    const findClassForSlot = (day: string, timeSlot: TimeSlot) => {
        return classes.find(cls => {
            // Validate schedule data
            if (!cls.schedule?.days || !cls.schedule?.times) return false

            // Check if the day matches
            const dayMatches = cls.schedule.days.some(d => 
                d.toLowerCase() === day.toLowerCase()
            )
            if (!dayMatches) return false

            // Check if any class time matches the slot
            return cls.schedule.times.some(time => {
                const classTime = normalizeTime(time)
                if (!classTime) return false

                return classTime.hour === timeSlot.hour && 
                       classTime.minute === timeSlot.minute
            })
        })
    }

    // Render class card
    const renderClassCard = (classData: ScheduleProps['classes'][0]) => (
        <div className="absolute inset-0 m-1">
            <div className="bg-indigo-50 hover:bg-indigo-100 transition-colors duration-150 border border-indigo-200 rounded-lg p-2 h-full flex flex-col justify-center group cursor-pointer">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <p className="font-medium text-sm text-indigo-900 truncate">
                        {classData.className}
                    </p>
                </div>
                <div className="mt-1 flex items-center space-x-2 opacity-80">
                    <svg className="w-3 h-3 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-xs text-indigo-700 truncate">
                        {userType === 'student' ? classData.tutorUsername : classData.studentUsername}
                    </p>
                </div>
            </div>
        </div>
    )

    return (
        <div className="p-4 bg-gray-50 rounded-lg">
            <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0">
                    <thead>
                        <tr>
                            <th className="sticky left-0 z-10 bg-white px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
                                Time
                            </th>
                            {DAYS.map(day => (
                                <th key={day} className="bg-white px-4 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[180px]">
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {timeSlots.map((slot, index) => (
                            <tr key={slot.display} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="sticky left-0 z-10 px-4 py-3 border-r border-gray-200 text-sm text-gray-600 font-medium w-24 whitespace-nowrap">
                                    {slot.display}
                                </td>
                                {DAYS.map(day => {
                                    const classInSlot = findClassForSlot(day, slot)
                                    return (
                                        <td key={`${day}-${slot.display}`} className="relative p-0 h-16 border-r border-b border-gray-200">
                                            {classInSlot && renderClassCard(classInSlot)}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Schedule 