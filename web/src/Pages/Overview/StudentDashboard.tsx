import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Progress } from '@/Components/ui/progress'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { getClassesForUser, getMeetingsOfAClass } from '@/actions/getData'
import { FaCalendarCheck, FaChalkboardTeacher, FaGraduationCap } from 'react-icons/fa'
import { FaCalendarDays, FaComments } from 'react-icons/fa6'
import { format, isValid, parse } from 'date-fns'
import { Button } from '@/Components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface MeetingType {
	meetingId: string
	meetingDate: string
	meetingType: string
	meetingLink: string
	location: string
	meetingNotes: string
	studentAttended: number
	className?: string
}

interface ClassType {
	id: string
	className: string
	description: string
	startDate: string
	endDate: string
	schedule: string
	meetingLink: string
	studentUsername: string
	tutorUsername: string
}

interface StudentDashboardProps {
	viewingUserId?: string;
}

interface DashboardStats {
	totalClasses: number
	totalMeetings: number
	attendedMeetings: number
	upcomingMeetings: number
	completedMeetings: number
}

function StudentDashboard({ viewingUserId }: StudentDashboardProps) {
	const { currentUser, authToken } = useGlobalState()
	const [classes, setClasses] = useState<ClassType[]>([])
	const [meetings, setMeetings] = useState<MeetingType[]>([])
	const [loading, setLoading] = useState(true)
	const [stats, setStats] = useState<DashboardStats>({
		totalClasses: 0,
		totalMeetings: 0,
		attendedMeetings: 0,
		upcomingMeetings: 0,
		completedMeetings: 0
	})

	// Use the viewingUserId if provided (for staff viewing student dashboard), otherwise use currentUser.id
	const targetUserId = viewingUserId || currentUser?.id

	// Helper function to safely format dates
	const formatDate = (dateString: string | null) => {
		if (!dateString) return 'Not set'
		try {
			// Parse date in format "April 11, 2025 at 03:57:00 PM"
			const date = parse(dateString, 'MMMM d, yyyy \'at\' hh:mm:ss aa', new Date())
			if (!isValid(date)) {
				return 'Invalid Date'
			}
			return format(date, 'MMM d, yyyy')
		} catch (error) {
			console.error('Error formatting date:', error)
			return 'Not set'
		}
	}

	// Helper function to safely format date and time
	const formatDateTime = (dateString: string | null) => {
		if (!dateString) return 'Not set'
		try {
			// Parse date in format "April 11, 2025 at 03:57:00 PM"
			const date = parse(dateString, 'MMMM d, yyyy \'at\' hh:mm:ss aa', new Date())
			if (!isValid(date)) {
				return 'Invalid Date'
			}
			return format(date, 'MMM d, yyyy h:mm aa')
		} catch (error) {
			console.error('Error formatting date:', error)
			return 'Not set'
		}
	}

	// Helper function to calculate class progress
	const calculateProgress = (startDate: string | null, endDate: string | null) => {
		if (!startDate || !endDate) return 0
		try {
			const start = parse(startDate, 'MMMM d, yyyy \'at\' hh:mm:ss aa', new Date())
			const end = parse(endDate, 'MMMM d, yyyy \'at\' hh:mm:ss aa', new Date())
			const now = new Date()

			if (!isValid(start) || !isValid(end)) {
				return 0
			}

			if (now < start) return 0
			if (now > end) return 100

			const total = end.getTime() - start.getTime()
			const current = now.getTime() - start.getTime()
			const progress = Math.round((current / total) * 100)

			// Clamp progress between 0 and 100
			return Math.min(Math.max(progress, 0), 100)
		} catch (error) {
			console.error('Error calculating progress:', error)
			return 0
		}
	}

	useEffect(() => {
		const fetchData = async () => {
			if (!targetUserId || !authToken) return

			try {
				setLoading(true)
				// Fetch classes for the target user
				const classesData = await getClassesForUser({
					token: authToken,
					userId: targetUserId,
					role: 'student', // Force student role when viewing student dashboard
				})

				// Initialize empty arrays if no data
				const classes = Array.isArray(classesData) ? classesData : []
				setClasses(classes)

				// Fetch meetings for each class
				const allMeetings: MeetingType[] = []
				for (const classItem of classes) {
					try {
						const meetingsData = await getMeetingsOfAClass({
							classId: classItem.id,
							token: authToken,
						})
						
						if (Array.isArray(meetingsData)) {
							meetingsData.forEach((meeting: MeetingType) => {
								allMeetings.push({
									...meeting,
									className: classItem.className
								})
							})
						}
					} catch (error) {
						console.error(`Error fetching meetings for class ${classItem.id}:`, error)
					}
				}

				setMeetings(allMeetings)

				// Calculate statistics
				const now = new Date()
				setStats({
					totalClasses: classes.length,
					totalMeetings: allMeetings.length,
					attendedMeetings: allMeetings.filter((m: MeetingType) => m.studentAttended === 1).length,
					upcomingMeetings: allMeetings.filter((m: MeetingType) => {
						if (!m.meetingDate) return false
						try {
							const meetingDate = parse(m.meetingDate, 'MMMM d, yyyy \'at\' hh:mm:ss aa', new Date())
							return isValid(meetingDate) && meetingDate > now
						} catch {
							return false
						}
					}).length,
					completedMeetings: allMeetings.filter((m: MeetingType) => {
						if (!m.meetingDate) return false
						try {
							const meetingDate = parse(m.meetingDate, 'MMMM d, yyyy \'at\' hh:mm:ss aa', new Date())
							return isValid(meetingDate) && meetingDate < now
						} catch {
							return false
						}
					}).length
				})
			} catch (error) {
				console.error('Error fetching data:', error)
				// Set empty state on error
				setClasses([])
				setMeetings([])
				setStats({
					totalClasses: 0,
					totalMeetings: 0,
					attendedMeetings: 0,
					upcomingMeetings: 0,
					completedMeetings: 0
				})
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [targetUserId, authToken])

	const StatCard = ({ icon, title, value, description }: any) => (
		<Card>
			<CardContent className="flex items-center p-6">
				<div className="bg-purple-100 p-3 rounded-lg">
					{icon}
				</div>
				<div className="ml-4">
					<p className="text-sm font-medium text-gray-500">{title}</p>
					<h4 className="text-2xl font-bold">{value}</h4>
					<p className="text-sm text-gray-500">{description}</p>
				</div>
			</CardContent>
		</Card>
	)

	if (loading) {
		return <div className="p-8">Loading dashboard data...</div>
	}

	return (
		<div className="p-8 space-y-8">
			{/* Header - Show different message for staff viewing student dashboard */}
			<div>
				{currentUser?.role === 'staff' && viewingUserId !== currentUser.id ? (
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-3xl font-bold">Student Dashboard View</h1>
							<p className="text-gray-500">Viewing student's dashboard and activities</p>
						</div>
						<Button
							onClick={() => window.history.back()}
							variant="outline"
							className="flex items-center gap-2"
						>
							<ArrowLeft className="w-4 h-4" />
							Back to Staff View
						</Button>
					</div>
				) : (
					<>
						<h1 className="text-3xl font-bold">Welcome, {currentUser?.username}!</h1>
						<p className="text-gray-500">Here's a summary of your interactions with your personal tutor</p>
					</>
				)}
			</div>

			{/* Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
				<StatCard
					icon={<FaChalkboardTeacher className="text-purple-600 h-6 w-6" />}
					title="Total Classes"
					value={stats.totalClasses}
					description="Enrolled classes"
				/>
				<StatCard
					icon={<FaCalendarDays className="text-blue-600 h-6 w-6" />}
					title="Total Meetings"
					value={stats.totalMeetings}
					description="Scheduled meetings"
				/>
				<StatCard
					icon={<FaCalendarCheck className="text-green-600 h-6 w-6" />}
					title="Attended"
					value={stats.attendedMeetings}
					description="Meetings attended"
				/>
				<StatCard
					icon={<FaGraduationCap className="text-yellow-600 h-6 w-6" />}
					title="Upcoming"
					value={stats.upcomingMeetings}
					description="Future meetings"
				/>
				<StatCard
					icon={<FaComments className="text-indigo-600 h-6 w-6" />}
					title="Completed"
					value={stats.completedMeetings}
					description="Past meetings"
				/>
			</div>

			{/* Classes Overview */}
			<Card>
				<CardHeader>
					<CardTitle>My Classes & Tutors</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{classes.map((classItem) => (
							<div key={classItem.id} className="p-4 bg-gray-50 rounded-lg">
								<div className="flex justify-between items-start">
									<div>
										<h3 className="font-semibold text-lg">{classItem.className}</h3>
										<p className="text-sm text-gray-500">Tutor: {classItem.tutorUsername}</p>
									</div>
									<div className="text-right text-sm text-gray-500">
										<p>{formatDate(classItem.startDate)} - {formatDate(classItem.endDate)}</p>
									</div>
								</div>
								
								{/* Progress bar for class completion */}
								<div className="mt-4">
									<div className="flex justify-between text-sm mb-1">
										<span className="text-gray-600">Progress</span>
										<span>{calculateProgress(classItem.startDate, classItem.endDate)}%</span>
									</div>
									<Progress 
										value={calculateProgress(classItem.startDate, classItem.endDate)}
									/>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Recent Meetings */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Meetings</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{meetings.slice(0, 5).map((meeting) => (
							<div key={meeting.meetingId} className="p-4 bg-gray-50 rounded-lg">
								<div className="flex justify-between items-start">
									<div>
										<h3 className="font-semibold">{meeting.className}</h3>
										<p className="text-sm text-gray-500">
											Type: <span className="capitalize">{meeting.meetingType}</span>
										</p>
										{meeting.meetingNotes && (
											<p className="text-sm text-gray-500 mt-2">Notes: {meeting.meetingNotes}</p>
										)}
									</div>
									<div className="text-right">
										<p className="text-sm">
											{meeting.meetingDate ? formatDateTime(meeting.meetingDate) : 'Date not set'}
										</p>
										<p className={`text-sm font-medium ${
											meeting.studentAttended === 1 ? 'text-green-600' : 
											meeting.studentAttended === 2 ? 'text-red-600' : 'text-orange-500'
										}`}>
											{meeting.studentAttended === 1 ? 'Attended' : 
											 meeting.studentAttended === 2 ? 'Absent' : 'Not Yet'}
										</p>
									</div>
								</div>
							</div>
						))}
						{meetings.length === 0 && (
							<p className="text-gray-500 text-center py-4">No meetings found</p>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default StudentDashboard 