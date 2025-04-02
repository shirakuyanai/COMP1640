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
import { FaCalendar, FaClock, FaGraduationCap, FaUsers } from 'react-icons/fa6'
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
		<div className='p-8 space-y-8'>
			<div>
				<h1 className='text-2xl font-bold'>
					Welcome back, {currentUser?.username}!
				</h1>
				<h4 className='text-gray-500'>
					{isStudent 
						? "Here's what's happening with your learning journey"
						: "Here's an overview of your teaching schedule"
					}
				</h4>
			</div>

			{/* Statistics Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
				<StatCard
					icon={<FaCalendar className="text-blue-500" />}
					title="Active Classes"
					value={activeClasses}
					description="Total active classes"
				/>
				<StatCard
					icon={<FaClock className="text-purple-500" />}
					title="In Progress"
					value={inProgressClasses}
					description="Currently ongoing"
				/>
				<StatCard
					icon={<FaUsers className="text-green-500" />}
					title="Upcoming"
					value={upcomingClasses}
					description="Starting soon"
				/>
				<StatCard
					icon={<FaGraduationCap className="text-yellow-500" />}
					title="Completed"
					value={completedClasses}
					description="Successfully finished"
				/>
			</div>

			{/* Classes Grid */}
			<div>
				<h2 className='text-2xl font-bold mb-6'>
					{isStudent ? 'My Classes' : 'Classes I Teach'}
				</h2>
				{loading ? (
					<div className="text-center py-8">Loading classes...</div>
				) : classes.length === 0 ? (
					<Card className="p-8 text-center">
						<CardTitle className="text-gray-500 mb-2">No Classes Found</CardTitle>
						<CardDescription>
							{isStudent 
								? "You haven't been assigned to any classes yet."
								: "You haven't been assigned to teach any classes yet."
							}
						</CardDescription>
					</Card>
				) : (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
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

const StatCard = ({ icon, title, value, description }: { 
	icon: React.ReactNode
	title: string
	value: number
	description: string 
}) => {
	return (
		<Card>
			<CardContent className="pt-6">
				<div className='flex items-center gap-4'>
					<div className='p-3 bg-gray-100 rounded-full'>
						{icon}
					</div>
					<div>
						<CardDescription>{title}</CardDescription>
						<p className='text-2xl font-bold'>{value}</p>
						<p className='text-sm text-gray-500'>{description}</p>
					</div>
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

	const statusColors = {
		'upcoming': 'from-blue-500 to-blue-700',
		'in-progress': 'from-green-500 to-green-700',
		'completed': 'from-gray-500 to-gray-700'
	}

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
		<Card className='overflow-hidden'>
			<CardHeader className={`bg-gradient-to-r ${statusColors[status]} p-2`} />
			<CardContent className="p-6">
				<Link to={`/dashboard/classes/${id}`}>
					<h2 className='text-xl font-bold mb-1'>{className}</h2>
					<p className='text-sm text-gray-500 mb-4 line-clamp-2'>{description}</p>
					
					<div className='space-y-4'>
						<div>
							<div className='flex justify-between text-sm mb-1'>
								<span className='text-gray-600'>Progress</span>
								<span>{progress}%</span>
							</div>
							<Progress value={progress} />
						</div>

						<div className='space-y-2'>
							<p className='text-sm'>
								<span className='text-gray-500'>
									{isStudent ? 'Tutor: ' : 'Student: '}
								</span>
								<span className='font-medium'>
									{isStudent ? tutorUsername : studentUsername || 'Unassigned'}
								</span>
							</p>
							<p className='text-sm'>
								<span className='text-gray-500'>Schedule: </span>
								<span className='font-medium'>{formatSchedule(schedule)}</span>
							</p>
							<p className='text-sm'>
								<span className='text-gray-500'>
									{status === 'upcoming' ? 'Starts: ' : status === 'completed' ? 'Ended: ' : 'Ends: '}
								</span>
								<span className='font-medium'>
									{format(status === 'upcoming' ? start : end, 'MMM d, yyyy')}
								</span>
							</p>
						</div>
					</div>
				</Link>
			</CardContent>
		</Card>
	)
}

export default ClassesPage
