import { getMeetingsOfAClass } from '@/actions/getData'
import { updateMeetingAttendance } from '@/actions/postData'
import { Button } from '@/Components/ui/button'
import { Form, FormField } from '@/Components/ui/form'
import { Input } from '@/Components/ui/input'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { meetingAttendanceSchema } from '@/schemas/meeting'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams, useNavigate, Navigate } from 'react-router-dom'
import { z } from 'zod'
import { FaCalendarAlt, FaVideo, FaMapMarkerAlt, FaClock, FaExternalLinkAlt, FaPlus, FaCheck, FaTimes } from 'react-icons/fa'
import { Card, CardHeader, CardContent, CardTitle } from '@/Components/ui/card'
import { format, isValid, parseISO } from 'date-fns'
import { toast } from '@/Components/ui/use-toast'

// Custom Badge component since we don't have the actual Badge component
interface BadgeProps {
	children: React.ReactNode;
	className?: string;
	variant?: 'default' | 'outline';
}

const Badge = ({ children, className = '', variant = 'default' }: BadgeProps) => {
	const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold';
	const variantStyles = variant === 'outline' 
		? 'border' 
		: 'bg-primary text-primary-foreground';

	return (
		<span className={`${baseStyles} ${variantStyles} ${className}`}>
			{children}
		</span>
	);
};

// Custom Tooltip components since we don't have the actual Tooltip components
interface TooltipProps {
	children: React.ReactNode;
}

interface TooltipTriggerProps extends TooltipProps {
	asChild?: boolean;
}

const TooltipProvider = ({ children }: TooltipProps) => children;
const Tooltip = ({ children }: TooltipProps) => children;
const TooltipTrigger = ({ children, asChild, ...props }: TooltipTriggerProps) => {
	// If asChild is true, we clone the element with props
	// Otherwise, we wrap it in a div
	if (asChild && React.isValidElement(children)) {
		return React.cloneElement(children, props);
	}
	return <div {...props}>{children}</div>;
};
const TooltipContent = ({ children }: TooltipProps) => <div className="absolute z-50 p-2 bg-white border rounded shadow-lg max-w-xs">{children}</div>;

interface Meeting {
	meetingId: string
	class: string
	tutorName: string
	meetingDate: string
	meetingType: 'in-person' | 'online'
	meetingNotes?: string
	meetingLink?: string
	location?: string
	studentAttended?: number
}

const sampleMeetings: Meeting[] = [
	{
		meetingId: '1',
		class: 'COMP1640',
		tutorName: 'Nguyen Thi A',
		meetingDate: '2025-03-20 10:00 AM',
		meetingType: 'online',
		meetingNotes: 'Discuss progress on project.',
		meetingLink: 'https://meet.google.com/hwj-mmya-xon',
	},
	{
		meetingId: '2',
		class: 'COMP1640',
		tutorName: 'Hehe',
		meetingDate: '2025-03-21 02:00 PM',
		meetingType: 'in-person',
		meetingNotes: 'Review last assignment.',
		meetingLink: 'https://meet.google.com/hwj-mmya-xon', // Updated Google Meet link
	},
]

function MeetingPage() {
	const [meetings, setMeetings] = useState<Meeting[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const { id } = useParams()
	const { authToken, currentUser } = useGlobalState()
	const navigate = useNavigate()

	// Authorization check - only tutors can access this page
	if (currentUser && currentUser.role !== 'tutor') {
		toast({
			title: "Access Denied",
			description: "Only tutors can manage meetings.",
			variant: "destructive",
		})
		return <Navigate to="/dashboard" replace />
	}

	// If user is not authenticated yet
	if (!currentUser) {
		return (
			<div className="flex items-center justify-center min-h-[50vh]">
				<div className="w-8 h-8 border-4 border-t-indigo-500 border-indigo-200 rounded-full animate-spin"></div>
			</div>
		)
	}

	const form = useForm<z.infer<typeof meetingAttendanceSchema>>({
		resolver: zodResolver(meetingAttendanceSchema),
		defaultValues: {
			meetings: meetings.map((meeting) => ({
				meetingId: meeting.meetingId,
				status: meeting.studentAttended ?? 0,
			})),
		},
	})

	useEffect(() => {
		meetings.forEach((meeting, i) => {
			form.setValue(
				`meetings.${i}.status`,
				meeting.studentAttended || 0,
			)
		})
	}, [meetings])

	const getMeetings = async () => {
		setIsLoading(true)
		try {
			const response = await getMeetingsOfAClass({
				classId: id ?? '',
				token: authToken,
			})
			
			// Sort meetings by date (most recent first)
			const sortedMeetings = response.sort((a: Meeting, b: Meeting) => 
				new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime()
			)
			
			setMeetings(sortedMeetings)
		} catch (error) {
			console.error('Error fetching meetings:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const onSubmit = async (values: z.infer<typeof meetingAttendanceSchema>) => {
		try {
			const response = await updateMeetingAttendance(values, authToken)
			toast({
				title: "Success!",
				description: "Meeting attendance was updated successfully.",
				variant: "default",
			})
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to update meeting attendance. Please try again.",
				variant: "destructive",
			})
		}
	}

	useEffect(() => {
		getMeetings()
	}, [])

	// Function to format date for display
	const formatMeetingDate = (dateString: string) => {
		try {
			const date = parseISO(dateString)
			if (isValid(date)) {
				return format(date, 'MMM d, yyyy - h:mm a')
			}
			return dateString
		} catch (error) {
			return dateString
		}
	}

	// Determine if meeting is upcoming, ongoing, or past
	const getMeetingStatus = (dateString: string) => {
		try {
			const meetingDate = new Date(dateString)
			const now = new Date()
			
			// Set end time to be 1 hour after start time
			const endDate = new Date(meetingDate)
			endDate.setHours(endDate.getHours() + 1)
			
			if (now < meetingDate) {
				return 'upcoming'
			} else if (now >= meetingDate && now <= endDate) {
				return 'ongoing'
			} else {
				return 'past'
			}
		} catch (error) {
			return 'unknown'
		}
	}

	// Get status badge color
	const getStatusBadgeColor = (status: number) => {
		switch (status) {
			case 1:
				return 'bg-green-100 text-green-600'
			case 2:
				return 'bg-red-100 text-red-600'
			default:
				return 'bg-gray-100 text-gray-600'
		}
	}

	// Get status text
	const getStatusText = (status: number) => {
		switch (status) {
			case 1:
				return 'Attended'
			case 2:
				return 'Absent'
			default:
				return 'Not yet'
		}
	}

	return (
		<div className='space-y-6'>
			{/* Header with title and button */}
			<div className='flex justify-between items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200'>
				<div className='flex items-center gap-3'>
					<div className='bg-indigo-100 p-3 rounded-lg'>
						<FaCalendarAlt className="h-5 w-5 text-indigo-500" />
					</div>
					<div>
						<h1 className='text-xl font-bold text-gray-800'>Meeting Records</h1>
						<p className='text-gray-500'>Schedule and manage class meetings</p>
					</div>
				</div>
				<Button 
					className='bg-indigo-600 hover:bg-indigo-700 transition-all'
				>
					<Link to={`/dashboard/classes/${id}/meetings/new`} className="flex items-center gap-2">
						<FaPlus className="h-3 w-3" /> New Meeting
					</Link>
				</Button>
			</div>

			{/* All Meetings Section */}
			<div className='bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200'>
				<div className='flex items-center gap-2 p-4 border-b border-gray-200'>
					<FaCalendarAlt className='h-5 w-5 text-indigo-500' />
					<h2 className='text-lg font-semibold text-gray-800'>All Meetings</h2>
				</div>
			
				{isLoading ? (
					<div className='flex flex-col items-center justify-center py-16'>
						<div className='w-12 h-12 border-4 border-t-indigo-500 border-indigo-200 rounded-full animate-spin mb-4'></div>
						<p className='text-gray-500'>Loading meetings...</p>
					</div>
				) : meetings.length === 0 ? (
					<div className='p-10 flex flex-col items-center text-center'>
						<div className='bg-gray-100 rounded-full p-5 mb-4'>
							<FaCalendarAlt className='h-8 w-8 text-gray-400' />
						</div>
						<h3 className='text-xl font-semibold text-gray-700 mb-2'>No Meetings Found</h3>
						<p className='text-gray-500 mb-6 max-w-md'>There are no meetings scheduled for this class yet. Create a new meeting to get started.</p>
						<Button 
							className='bg-indigo-600 hover:bg-indigo-700'
						>
							<Link to={`/dashboard/classes/${id}/meetings/new`} className="flex items-center gap-2">
								<FaPlus className="h-3 w-3" /> Schedule First Meeting
							</Link>
						</Button>
					</div>
				) : (
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)}>
							<div className='overflow-x-auto'>
								<table className='w-full border-collapse'>
									<thead>
										<tr className='border-b border-gray-200 text-sm uppercase text-gray-500'>
											<th className='px-6 py-3 text-left'>DATE & TIME</th>
											<th className='px-6 py-3 text-left'>TYPE</th>
											<th className='px-6 py-3 text-left'>STATUS</th>
											<th className='px-6 py-3 text-left'>NOTES</th>
											<th className='px-6 py-3 text-left'>LINK/LOCATION</th>
											<th className='px-6 py-3 text-left'>ATTENDANCE</th>
										</tr>
									</thead>
									<tbody className='divide-y divide-gray-100'>
										{meetings.map((meeting, i) => {
											const meetingStatus = getMeetingStatus(meeting.meetingDate);
											
											return (
												<tr
													key={meeting.meetingId}
													className='hover:bg-gray-50 transition-colors'
												>
													<td className='px-6 py-4'>
														<div className='flex flex-col'>
															<span className='text-sm font-medium text-gray-800'>{formatMeetingDate(meeting.meetingDate)}</span>
															<div className='mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800'>
																{meetingStatus === 'upcoming' ? 'Upcoming' : meetingStatus === 'ongoing' ? 'Ongoing' : ''}
															</div>
														</div>
													</td>
													<td className='px-6 py-4'>
														<div className='flex items-center'>
															<div className={`p-2 rounded-md ${meeting.meetingType === 'online' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'} mr-2`}>
																{meeting.meetingType === 'online' ? <FaVideo className="h-4 w-4" /> : <FaMapMarkerAlt className="h-4 w-4" />}
															</div>
															<span className='text-sm capitalize'>
																{meeting.meetingType}
															</span>
														</div>
													</td>
													<td className='px-6 py-4'>
														<div className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${meeting.studentAttended === 1 ? 'bg-green-100 text-green-800' : meeting.studentAttended === 2 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
															{getStatusText(meeting.studentAttended || 0)}
														</div>
													</td>
													<td className='px-6 py-4'>
														<div className='max-w-xs text-sm text-gray-700 overflow-hidden text-ellipsis'>
															{meeting.meetingNotes ? (
																<div className='cursor-help line-clamp-2'>
																	{meeting.meetingNotes}
																</div>
															) : (
																<span className='text-gray-400 italic'>No notes</span>
															)}
														</div>
													</td>
													<td className='px-6 py-4'>
														{meeting.meetingType === 'online' && meeting.meetingLink ? (
															<a
																href={meeting.meetingLink}
																target='_blank'
																rel='noopener noreferrer'
																className='flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors'
															>
																Join Meeting <FaExternalLinkAlt className="h-3 w-3 ml-1" />
															</a>
														) : meeting.location ? (
															<div className='flex items-center gap-1 text-gray-700'>
																<FaMapMarkerAlt className="h-3 w-3 text-gray-500 mr-1" /> {meeting.location}
															</div>
														) : (
															<span className='text-gray-400 italic'>Not specified</span>
														)}
													</td>
													<td className='px-6 py-4'>
														<Input
															type='hidden'
															value={meeting.meetingId}
															{...form.register(`meetings.${i}.meetingId`)}
														/>
														<FormField
															control={form.control}
															name={`meetings.${i}.status`}
															render={({ field }) => (
																<select
																	className='border border-gray-200 rounded-md p-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500'
																	value={field.value ?? 0}
																	onChange={(e) => {
																		field.onChange(Number(e.target.value))
																	}}
																>
																	<option value={0}>Not yet</option>
																	<option value={1}>Attended</option>
																	<option value={2}>Absent</option>
																</select>
															)}
														/>
													</td>
												</tr>
											)
										})}
									</tbody>
								</table>
							</div>
							<div className='px-6 py-4 border-t border-gray-200'>
								<Button
									type='submit'
									className='bg-indigo-600 hover:bg-indigo-700'
								>
									Update Attendance
								</Button>
							</div>
						</form>
					</Form>
				)}
			</div>
		</div>
	)
}

export default MeetingPage
