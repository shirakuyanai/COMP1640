import React, { useEffect, useState } from 'react'
import { useGlobalState } from '../../misc/GlobalStateContext'
import Schedule from '../../components/Schedule'
import toast from 'react-hot-toast'

interface Class {
    id: string
    className: string
    startDate: string
    endDate: string
    schedule: {
        days: string[]
        times: string[]
    }
    studentUsername: string
}

const TutorSchedule: React.FC = () => {
    const { currentUser, authToken } = useGlobalState()
    const [classes, setClasses] = useState<Class[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                console.log('Current user:', currentUser)
                console.log('Auth token:', authToken)
                console.log('API Key:', import.meta.env.VITE_APIKEY)
                const response = await fetch(`${import.meta.env.VITE_HOST}/api/class/tutor/${currentUser?.id}`, {
                    headers: {
                        'authentication': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                        'api': import.meta.env.VITE_APIKEY
                    }
                })

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }))
                    console.error('Error response:', errorData)
                    throw new Error(errorData.error || `Server error: ${response.status}`)
                }

                const data = await response.json()
                console.log('Received classes:', data)

                // Transform the data to match the Schedule component's expected format
                const formattedClasses = data.map((cls: any) => ({
                    ...cls,
                    student: {
                        id: cls.studentId,
                        name: cls.studentUsername
                    }
                }))

                setClasses(formattedClasses)
            } catch (error) {
                console.error('Error fetching classes:', error)
                toast.error(error instanceof Error ? error.message : 'Failed to load schedule')
            } finally {
                setLoading(false)
            }
        }

        if (currentUser?.id) {
            fetchClasses()
        } else {
            setLoading(false)
        }
    }, [currentUser?.id, authToken])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!currentUser?.id) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600">Please log in to view your schedule.</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">My Teaching Schedule</h1>
            <div className="bg-white rounded-lg shadow-md">
                <Schedule classes={classes} userType="tutor" />
            </div>
        </div>
    )
}

export default TutorSchedule 