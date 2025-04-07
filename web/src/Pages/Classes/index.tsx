import { getClassesForUser } from '@/actions/getData'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/Components/ui/card'
import { Progress } from '@/Components/ui/progress'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { format } from 'date-fns'
import React, { useEffect, useState } from 'react'
import { FaCalendar, FaClock, FaGraduationCap, FaUsers, FaCircle } from 'react-icons/fa6'
import { Link } from 'react-router-dom'

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

// Define status colors in a central location for consistency
const STATUS_COLORS = {
	'upcoming': {
		gradient: 'from-blue-600 to-blue-800',
		bg: 'bg-blue-600',
		lightBg: 'bg-blue-100',
		border: 'border-blue-200',
		text: 'Upcoming - Classes that haven\'t started yet'
	},
	'in-progress': {
		gradient: 'from-green-600 to-green-800',
		bg: 'bg-green-600',
		lightBg: 'bg-green-100',
		border: 'border-green-200',
		text: 'In Progress - Currently active classes'
	},
	'completed': {
		gradient: 'from-slate-600 to-slate-800',
		bg: 'bg-slate-600',
		lightBg: 'bg-slate-100',
		border: 'border-slate-200',
		text: 'Completed - Classes that have ended'
	}
}

function ClassesPage() {
	const { currentUser, authToken } = useGlobalState()
	const [classes, setClasses] = useState<ClassType[]>([])
	const [loading, setLoading] = useState(true)

	const getClasses = async () => {
		try {
			setLoading(true)
			const data = await getClassesForUser({
				token: authToken,
				userId: currentUser.id,
				role: currentUser.role,
			})
			if (data) setClasses(data)
		} catch (error) {
			console.error('Error fetching classes:', error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (currentUser) getClasses()
	}, [currentUser])

	const isStudent = currentUser?.role === 'student'

	// Calculate statistics
	const activeClasses = classes.length
	const upcomingClasses = classes.filter(c => new Date(c.startDate) > new Date()).length
	const completedClasses = classes.filter(c => new Date(c.endDate) < new Date()).length
	const inProgressClasses = activeClasses - upcomingClasses - completedClasses

	return (
		<div className='p-4 md:p-8 space-y-6 md:space-y-8 bg-slate-50 min-h-screen'>
			<div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-slate-100">
				<h1 className='text-2xl md:text-3xl font-bold text-slate-800 mb-1'>
					Welcome back, {currentUser?.username}!
				</h1>
				<h4 className='text-sm md:text-base text-slate-500'>
					{isStudent 
						? "Here's what's happening with your learning journey"
						: "Here's an overview of your teaching schedule"
					}
				</h4>
			</div>

			{/* Statistics Cards */}
			<div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6'>
				<StatCard
					icon={<FaCalendar className="text-indigo-600 h-5 w-5 md:h-6 md:w-6" />}
					title="Active Classes"
					value={activeClasses}
					description="Total active classes"
					color="bg-indigo-100"
				/>
				<StatCard
					icon={<FaClock className="text-green-600 h-5 w-5 md:h-6 md:w-6" />}
					title="In Progress"
					value={inProgressClasses}
					description="Currently ongoing"
					color="bg-green-100"
				/>
				<StatCard
					icon={<FaUsers className="text-blue-600 h-5 w-5 md:h-6 md:w-6" />}
					title="Upcoming"
					value={upcomingClasses}
					description="Starting soon"
					color="bg-blue-100"
				/>
				<StatCard
					icon={<FaGraduationCap className="text-amber-600 h-5 w-5 md:h-6 md:w-6" />}
					title="Completed"
					value={completedClasses}
					description="Successfully finished"
					color="bg-amber-100"
				/>
			</div>

			{/* Status Legend */}
			<Card className="border-none shadow-md">
				<CardHeader className="border-b border-slate-100 bg-white rounded-t-xl p-4 md:p-6">
					<CardTitle className="text-slate-800 text-base md:text-lg">Class Status Legend</CardTitle>
				</CardHeader>
				<CardContent className="bg-white rounded-b-xl p-4 md:p-6 overflow-x-auto">
					<div className="flex flex-col sm:flex-row gap-3 md:gap-6 min-w-max sm:min-w-0">
						{Object.entries(STATUS_COLORS).map(([status, config]) => (
							<div key={status} className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg ${config.lightBg} ${config.border} border`}>
								<div className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${config.bg}`}></div>
								<span className="text-xs md:text-sm text-slate-700">{config.text}</span>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Classes Grid */}
			<div>
				<h2 className='text-xl md:text-2xl font-bold mb-4 md:mb-6 text-slate-800 pl-1'>
					{isStudent ? 'My Classes' : 'Classes I Teach'}
				</h2>
				{loading ? (
					<div className="h-48 flex items-center justify-center">
						<div className="w-10 h-10 md:w-12 md:h-12 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
					</div>
				) : classes.length === 0 ? (
					<Card className="border-none shadow-md bg-white p-6 md:p-12 text-center">
						<div className="flex flex-col items-center justify-center">
							<div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
								<FaCalendar className="h-6 w-6 md:h-8 md:w-8 text-slate-400" />
							</div>
							<CardTitle className="text-slate-700 mb-2 text-base md:text-lg">No Classes Found</CardTitle>
							<CardDescription className="max-w-md mx-auto text-xs md:text-sm">
								{isStudent 
									? "You haven't been assigned to any classes yet. Please check back later or contact your administrator."
									: "You haven't been assigned to teach any classes yet. Please check back later or contact your administrator."
								}
							</CardDescription>
						</div>
					</Card>
				) : (
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'>
						{classes.map((classItem) => (
							<ClassCard
								key={classItem.id}
								classData={classItem}
								isStudent={isStudent}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

const StatCard = ({ icon, title, value, description, color }: { 
	icon: React.ReactNode
	title: string
	value: number
	description: string
	color: string
}) => {
	return (
		<Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-200">
			<CardContent className="flex items-center p-3 md:p-6">
				<div className={`${color} p-3 md:p-4 rounded-xl shadow-sm`}>
					{icon}
				</div>
				<div className="ml-3 md:ml-4">
					<p className="text-xs md:text-sm font-medium text-slate-500">{title}</p>
					<p className="text-xl md:text-2xl font-bold text-slate-800">{value}</p>
					<p className="text-xs md:text-sm text-slate-500 hidden xs:block">{description}</p>
				</div>
			</CardContent>
		</Card>
	)
}

const ClassCard = ({ 
	classData,
	isStudent 
}: {
	classData: ClassType
	isStudent: boolean
}) => {
	const {
		id,
		className,
		description,
		startDate,
		endDate,
		schedule,
		studentUsername,
		tutorUsername
	} = classData

	const now = new Date()
	const start = new Date(startDate)
	const end = new Date(endDate)
	
	const status = now < start 
		? 'upcoming'
		: now > end 
			? 'completed' 
			: 'in-progress'

	// Use centralized color definitions
	const statusGradient = STATUS_COLORS[status].gradient
	const statusBg = STATUS_COLORS[status].lightBg
	const statusBorder = STATUS_COLORS[status].border

	const progress = status === 'completed' 
		? 100
		: status === 'upcoming'
			? 0
			: Math.round(((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100)

	// Format schedule for display
	const formatSchedule = (schedule: any) => {
		if (!schedule) return 'No schedule set';
		try {
			const scheduleObj = typeof schedule === 'string' ? JSON.parse(schedule) : schedule;
			const days = Array.isArray(scheduleObj.days) ? scheduleObj.days.join(', ') : scheduleObj.days;
			const times = scheduleObj.times;
			return `${days} at ${times}`;
		} catch (error) {
			return String(schedule);
		}
	}

	return (
		<Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
			<CardHeader className={`bg-gradient-to-r ${statusGradient} p-2 md:p-3 group-hover:opacity-90 transition-opacity`} />
			<CardContent className="p-4 md:p-6 pt-4 md:pt-5">
				<Link to={`/dashboard/classes/${id}`} className="block h-full">
					<h2 className='text-lg md:text-xl font-bold mb-2 text-slate-800 group-hover:text-blue-700 transition-colors'>{className}</h2>
					<p className='text-xs md:text-sm text-slate-500 mb-3 md:mb-4 line-clamp-2'>{description}</p>
					
					<div className='space-y-3 md:space-y-4'>
						<div>
							<div className='flex justify-between text-xs md:text-sm mb-1 md:mb-2'>
								<span className='text-slate-600 font-medium'>Progress</span>
								<span className='text-blue-600 font-semibold'>{progress}%</span>
							</div>
							<Progress value={progress} className="h-2 md:h-2.5 bg-slate-200" />
						</div>

						<div className='space-y-2 md:space-y-3'>
							<p className='text-xs md:text-sm flex justify-between'>
								<span className='text-slate-500'>
									{isStudent ? 'Tutor: ' : 'Student: '}
								</span>
								<span className='font-medium text-slate-700'>
									{isStudent ? tutorUsername : studentUsername || 'Unassigned'}
								</span>
							</p>

							<p className='text-xs md:text-sm flex justify-between'>
								<span className='text-slate-500'>Starts:</span>
								<span className='font-medium text-slate-700'>
									{format(start, 'MMM d, yyyy')}
								</span>
							</p>

							<p className='text-xs md:text-sm flex justify-between'>
								<span className='text-slate-500'>Ends:</span>
								<span className='font-medium text-slate-700'>
									{format(end, 'MMM d, yyyy')}
								</span>
							</p>
							
							{/* Status indicator */}
							<div className={`flex items-center gap-1.5 md:gap-2 mt-2 md:mt-3 p-1.5 md:p-2 rounded-lg ${statusBg} ${statusBorder} border`}>
								<div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${STATUS_COLORS[status].bg}`}></div>
								<span className="text-xs md:text-sm capitalize font-medium text-slate-700">{status.replace('-', ' ')}</span>
							</div>
						</div>
					</div>
				</Link>
			</CardContent>
		</Card>
	)
}

export default ClassesPage
