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
			// Try multiple date parsing approaches
			let date;
			
			// First try direct Date constructor (for ISO strings)
			date = new Date(dateString);
			
			// Check if that worked
			if (isValid(date)) {
				return format(date, 'MMM d, yyyy')
			}
			
			// Try parsing with the expected format
			date = parse(dateString, 'MMMM d, yyyy \'at\' hh:mm:ss aa', new Date())
			
			// If that worked, return formatted date
			if (isValid(date)) {
				return format(date, 'MMM d, yyyy')
			}
			
			// If we got here, neither approach worked
			console.error('Could not parse date string:', dateString)
			return 'Not set'
		} catch (error) {
			console.error('Error formatting date:', error, 'for string:', dateString)
			return 'Not set'
		}
	}

	// Helper function to safely format date and time
	const formatDateTime = (dateString: string | null) => {
		if (!dateString) return 'Not set'
		try {
			// Try multiple date parsing approaches
			let date;
			
			// First try direct Date constructor (for ISO strings)
			date = new Date(dateString);
			
			// Check if that worked
			if (isValid(date)) {
				return format(date, 'MMM d, yyyy h:mm aa')
			}
			
			// Try parsing with the expected format
			date = parse(dateString, 'MMMM d, yyyy \'at\' hh:mm:ss aa', new Date())
			
			// If that worked, return formatted date
			if (isValid(date)) {
				return format(date, 'MMM d, yyyy h:mm aa')
			}
			
			// If we got here, neither approach worked
			console.error('Could not parse date string:', dateString)
			return 'Not set'
		} catch (error) {
			console.error('Error formatting date:', error, 'for string:', dateString)
			return 'Not set'
		}
	}

	// Helper function to calculate class progress
	const calculateProgress = (startDate: string | null, endDate: string | null) => {
		if (!startDate || !endDate) return 0
		try {
			// Try multiple parsing approaches
			let start, end;
			
			// First try direct Date constructor
			start = new Date(startDate);
			end = new Date(endDate);
			
			// If that didn't work, try the specific format
			if (!isValid(start) || !isValid(end)) {
				start = parse(startDate, 'MMMM d, yyyy \'at\' hh:mm:ss aa', new Date());
				end = parse(endDate, 'MMMM d, yyyy \'at\' hh:mm:ss aa', new Date());
			}
			
			// If still not valid dates, return 0
			if (!isValid(start) || !isValid(end)) {
				console.error('Invalid dates for progress calculation:', { startDate, endDate });
				return 0;
			}

			const now = new Date()

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

	const StatCard = ({ icon, title, value, description, color }: any) => (
		<Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-200">
			<CardContent className="flex items-center p-4 md:p-6">
				<div className={`${color} p-3 md:p-4 rounded-xl shadow-sm`}>
					{icon}
				</div>
				<div className="ml-3 md:ml-4">
					<p className="text-xs md:text-sm font-medium text-slate-500">{title}</p>
					<h4 className="text-lg md:text-2xl font-bold text-slate-800">{value}</h4>
					<p className="text-xs md:text-sm text-slate-500">{description}</p>
				</div>
			</CardContent>
		</Card>
	)

	if (loading) {
		return (
			<div className="h-screen flex items-center justify-center bg-slate-50">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin mx-auto"></div>
					<p className="mt-4 text-slate-600 font-medium">Loading dashboard data...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="p-3 md:p-8 space-y-4 md:space-y-8 bg-slate-50 min-h-screen">
			{/* Header - Show different message for staff viewing student dashboard */}
			<div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-slate-100">
				{currentUser?.role === 'staff' && viewingUserId !== currentUser.id ? (
					<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-0">
						<div>
							<h1 className="text-xl md:text-3xl font-bold text-slate-800">Student Dashboard View</h1>
							<p className="text-sm md:text-base text-slate-500 mt-1">Viewing student's dashboard and activities</p>
						</div>
						<Button
							onClick={() => window.history.back()}
							variant="outline"
							className="flex items-center gap-2 w-full md:w-auto"
						>
							<ArrowLeft className="w-4 h-4" />
							Back to Staff View
						</Button>
					</div>
				) : (
					<>
						<h1 className="text-xl md:text-3xl font-bold text-slate-800 mb-1">Welcome, {currentUser?.username}!</h1>
						<p className="text-sm md:text-base text-slate-500">Here's a summary of your interactions with your personal tutor</p>
					</>
				)}
			</div>

			{/* Statistics */}
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
				<StatCard
					icon={<FaChalkboardTeacher className="text-indigo-600 h-5 w-5 md:h-6 md:w-6" />}
					title="Total Classes"
					value={stats.totalClasses}
					description="Enrolled classes"
					color="bg-indigo-100"
				/>
				<StatCard
					icon={<FaCalendarDays className="text-blue-600 h-5 w-5 md:h-6 md:w-6" />}
					title="Total Meetings"
					value={stats.totalMeetings}
					description="Scheduled meetings"
					color="bg-blue-100"
				/>
				<StatCard
					icon={<FaCalendarCheck className="text-green-600 h-5 w-5 md:h-6 md:w-6" />}
					title="Attended"
					value={stats.attendedMeetings}
					description="Meetings attended"
					color="bg-green-100"
				/>
				<StatCard
					icon={<FaGraduationCap className="text-amber-600 h-5 w-5 md:h-6 md:w-6" />}
					title="Upcoming"
					value={stats.upcomingMeetings}
					description="Future meetings"
					color="bg-amber-100"
				/>
				<StatCard
					icon={<FaComments className="text-purple-600 h-5 w-5 md:h-6 md:w-6" />}
					title="Completed"
					value={stats.completedMeetings}
					description="Past meetings"
					color="bg-purple-100"
				/>
			</div>

			{/* Classes Overview */}
			<Card className="border-none shadow-md">
				<CardHeader className="border-b border-slate-100 bg-white rounded-t-xl">
					<CardTitle className="text-slate-800 text-lg md:text-xl">My Classes & Tutors</CardTitle>
				</CardHeader>
				<CardContent className="bg-white rounded-b-xl p-3 md:p-6">
					<div className="space-y-3 md:space-y-4">
						{classes.length === 0 ? (
							<div className="text-center py-4 md:py-8 text-slate-500">
								No classes assigned yet
							</div>
						) : (
							classes.map((classItem) => (
								<div key={classItem.id} className="p-4 md:p-6 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50 transition-colors">
									<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
										<div>
											<h3 className="font-semibold text-base md:text-lg text-slate-800">{classItem.className}</h3>
											<p className="text-xs md:text-sm text-slate-500 mt-1">Tutor: {classItem.tutorUsername}</p>
										</div>
										<div className="text-xs md:text-sm text-slate-500 bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg shadow-sm border border-slate-100">
											<p>{formatDate(classItem.startDate)} - {formatDate(classItem.endDate)}</p>
										</div>
									</div>
									
									{/* Progress bar for class completion */}
									<div className="mt-4 md:mt-6">
										<div className="flex justify-between text-xs md:text-sm mb-2">
											<span className="text-slate-600 font-medium">Progress</span>
											<span className="text-blue-600 font-semibold">{calculateProgress(classItem.startDate, classItem.endDate)}%</span>
										</div>
										<Progress 
											value={calculateProgress(classItem.startDate, classItem.endDate)}
											className="h-2 md:h-2.5 bg-slate-200"
										/>
									</div>
								</div>
							))
						)}
					</div>
				</CardContent>
			</Card>

			{/* Recent Meetings */}
			<Card className="border-none shadow-md">
				<CardHeader className="border-b border-slate-100 bg-white rounded-t-xl">
					<CardTitle className="text-slate-800 text-lg md:text-xl">Recent Meetings</CardTitle>
				</CardHeader>
				<CardContent className="bg-white rounded-b-xl p-3 md:p-6">
					<div className="space-y-3 md:space-y-4">
						{meetings.length === 0 ? (
							<p className="text-slate-500 text-center py-4 md:py-8">No meetings found</p>
						) : (
							meetings.slice(0, 5).map((meeting) => (
								<div key={meeting.meetingId} className="p-4 md:p-6 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-100 transition-colors">
									<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
										<div>
											<h3 className="font-semibold text-base md:text-lg text-slate-800">{meeting.className}</h3>
											<p className="text-xs md:text-sm text-slate-500 mt-1">
												Type: <span className="capitalize">{meeting.meetingType}</span>
											</p>
											{meeting.meetingNotes && (
												<p className="text-xs md:text-sm text-slate-600 mt-2 md:mt-3 bg-white p-2 md:p-3 rounded-lg border border-slate-100">
													{meeting.meetingNotes}
												</p>
											)}
										</div>
										<div className="text-right">
											<p className="text-xs md:text-sm bg-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg shadow-sm border border-slate-100">
												{meeting.meetingDate ? formatDateTime(meeting.meetingDate) : 'Date not set'}
											</p>
											<p className={`text-xs md:text-sm font-medium mt-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg ${
												meeting.studentAttended === 1 
													? 'text-green-600 bg-green-50 border border-green-100' 
													: meeting.studentAttended === 2 
														? 'text-red-600 bg-red-50 border border-red-100' 
														: 'text-amber-600 bg-amber-50 border border-amber-100'
											}`}>
												{meeting.studentAttended === 1 ? 'Attended' : 
												meeting.studentAttended === 2 ? 'Absent' : 'Not Yet'}
											</p>
										</div>
									</div>
								</div>
							))
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default StudentDashboard 