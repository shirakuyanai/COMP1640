import { Button } from '@/Components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs'
import React, { useEffect, useState } from 'react'
import MessagePage from './Message'
import ContentPage from './Content'
import { useParams, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Progress } from '@/Components/ui/progress'
import {
	FaPlus,
	FaVideo,
	FaMapMarkerAlt,
	FaClock,
	FaExternalLinkAlt,
	FaCalendar,
} from 'react-icons/fa'
import { FaFileLines } from 'react-icons/fa6'
import { CiChat1 } from 'react-icons/ci'
import { IoBookOutline } from 'react-icons/io5'
import { FiDownload } from 'react-icons/fi'
import MeetingPage from '@/Pages/Staff/Class/MeetingPage'
import {
	getClassById,
	getPostsByClassId,
	getMeetingsOfAClass,
} from '@/actions/getData'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { supabase } from '@/lib/supabase'
import { convertToLocalTimezone } from '@/lib/utils'
import { parse, format } from 'date-fns'
import BlogPage from './Blog'

function ClassPage() {
	const [searchParams] = useSearchParams()
	const { authToken, currentUser } = useGlobalState()
	const param = searchParams.get('tab') ?? 'overview'
	const { id } = useParams()
	const [found_class, setFoundClass] = React.useState<any>(null)
	const getData = async () => {
		const fetched_class = await getClassById({
			token: authToken,
			classId: id ?? '',
			userId: currentUser.id,
			role: currentUser.role,
		})

		setFoundClass(fetched_class)
	}

	useEffect(() => {
		if (currentUser) getData()
	}, [currentUser])

	if (id && found_class)
		return (
			<div>
				<div className='bg-gradient-to-r from-blue-600 to-purple-500 px-4 md:px-30 py-6 md:py-10 flex flex-col gap-3 md:gap-5'>
					<div className='flex flex-row justify-between'>
						<h1 className='text-xl md:text-3xl text-white font-bold'>
							{found_class.className ?? 'N/A'}
						</h1>
					</div>
					<div className='flex flex-row gap-2 items-center'>
						<FaFileLines className='text-gray-200' />
						<div className='flex flex-col'>
							<h4 className='text-xs md:text-sm text-gray-200 font-light'>
								Class
							</h4>
							<h4 className='text-xs md:text-sm text-gray-200 font-semibold'>
								{found_class.className}
							</h4>
						</div>
					</div>
				</div>
				<div className='px-2 md:px-25 py-5 md:py-10'>
					<Tabs defaultValue={param}>
						<TabsList className='bg-gray-100 w-full overflow-x-auto flex-nowrap'>
							<TabsTrigger value='overview'>Overview</TabsTrigger>
							<TabsTrigger value='content'>Content</TabsTrigger>
							<TabsTrigger value='blog'>Blog</TabsTrigger>
							<TabsTrigger value='message'>Message</TabsTrigger>
							<TabsTrigger value='meeting'>Meeting</TabsTrigger>
						</TabsList>
						<TabsContent value='overview'>
							<OverviewTab classId={id} />
						</TabsContent>
						<TabsContent value='content'>
							<ContentPage />
						</TabsContent>
						<TabsContent value='blog'>
							<BlogPage />
						</TabsContent>
						<TabsContent value='assignment'>
							<div>Assignment</div>
						</TabsContent>
						<TabsContent value='message'>
							<MessagePage found_class={found_class} />
						</TabsContent>
						<TabsContent value='meeting'>
							<MeetingTab classId={id} />
						</TabsContent>
					</Tabs>
				</div>
			</div>
		)
}

interface MeetingTabProps {
	classId?: string
}

const MeetingTab: React.FC<MeetingTabProps> = ({ classId }) => {
	const { currentUser, authToken } = useGlobalState()
	const [meetings, setMeetings] = useState<any[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const fetchMeetings = async () => {
			if (!classId || !authToken) return

			try {
				setIsLoading(true)
				const meetingsData = await getMeetingsOfAClass({
					classId,
					token: authToken,
				})

				setMeetings(meetingsData)
			} catch (error) {
				console.error('Error fetching meetings:', error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchMeetings()
	}, [classId, authToken])

	// Format meeting date for display
	const formatMeetingDate = (dateString: string) => {
		try {
			const date = parse(dateString, "MMMM d, yyyy 'at' hh:mm:ss a", new Date())
			return format(date, "MMMM d, yyyy 'at' h:mm a")
		} catch (error) {
			return dateString
		}
	}

	// Get meeting status text based on attendance
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

	// Get status badge color
	const getStatusBadgeColor = (status: number) => {
		switch (status) {
			case 1:
				return 'bg-green-100 text-green-800'
			case 2:
				return 'bg-red-100 text-red-800'
			default:
				return 'bg-gray-100 text-gray-800'
		}
	}

	// For tutors, show the full MeetingPage component with all features
	if (currentUser?.role === 'tutor') {
		return (
			<div>
				<MeetingPage />
			</div>
		)
	}

	// For students, show a simplified read-only view without the "New Meeting" button
	return (
		<div className='space-y-6'>
			{/* Header with title */}
			<div className='flex justify-between items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200'>
				<div className='flex items-center gap-3'>
					<div className='bg-indigo-100 p-3 rounded-lg'>
						<FaCalendar className='h-5 w-5 text-indigo-500' />
					</div>
					<div>
						<h1 className='text-xl font-bold text-gray-800'>
							Meeting Schedule
						</h1>
						<p className='text-gray-500'>View your scheduled class meetings</p>
					</div>
				</div>
			</div>

			{/* All Meetings Section */}
			<div className='bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200'>
				<div className='flex items-center gap-2 p-4 border-b border-gray-200'>
					<FaCalendar className='h-5 w-5 text-indigo-500' />
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
							<FaCalendar className='h-8 w-8 text-gray-400' />
						</div>
						<h3 className='text-xl font-semibold text-gray-700 mb-2'>
							No Meetings Found
						</h3>
						<p className='text-gray-500 mb-6 max-w-md'>
							There are no meetings scheduled for this class yet.
						</p>
					</div>
				) : (
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead className='bg-gray-50 text-gray-700 text-sm'>
								<tr>
									<th className='px-6 py-3 text-left font-medium'>
										Date & Time
									</th>
									<th className='px-6 py-3 text-left font-medium'>Type</th>
									<th className='px-6 py-3 text-left font-medium'>Status</th>
									<th className='px-6 py-3 text-left font-medium'>Notes</th>
									<th className='px-6 py-3 text-left font-medium'>
										Location/Link
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-100'>
								{meetings.map((meeting, i) => (
									<tr
										key={meeting.meetingId}
										className='hover:bg-gray-50 transition-colors'
									>
										<td className='px-6 py-4'>
											<div className='flex flex-col'>
												<span className='text-sm font-medium text-gray-800'>
													{formatMeetingDate(meeting.meetingDate)}
												</span>
											</div>
										</td>
										<td className='px-6 py-4'>
											<div className='flex items-center'>
												<div
													className={`p-2 rounded-md ${
														meeting.meetingType === 'online'
															? 'bg-blue-50 text-blue-600'
															: 'bg-green-50 text-green-600'
													} mr-2`}
												>
													{meeting.meetingType === 'online' ? (
														<FaVideo className='h-4 w-4' />
													) : (
														<FaMapMarkerAlt className='h-4 w-4' />
													)}
												</div>
												<span className='text-sm capitalize'>
													{meeting.meetingType}
												</span>
											</div>
										</td>
										<td className='px-6 py-4'>
											<div
												className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeColor(
													meeting.studentAttended,
												)}`}
											>
												{getStatusText(meeting.studentAttended)}
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
											{meeting.meetingType === 'online' &&
											meeting.meetingLink ? (
												<a
													href={meeting.meetingLink}
													target='_blank'
													rel='noopener noreferrer'
													className='flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors'
												>
													Join Meeting{' '}
													<FaExternalLinkAlt className='h-3 w-3 ml-1' />
												</a>
											) : meeting.location ? (
												<div className='flex items-center gap-1 text-gray-700'>
													<FaMapMarkerAlt className='h-3 w-3 text-gray-500 mr-1' />{' '}
													{meeting.location}
												</div>
											) : (
												<span className='text-gray-400 italic'>
													Not specified
												</span>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	)
}

interface OverviewTabProps {
	classId: string
}

const OverviewTab: React.FC<OverviewTabProps> = ({ classId }) => {
	const { authToken } = useGlobalState()
	const [recentPosts, setRecentPosts] = useState<any[]>([])
	const [resources, setResources] = useState<any[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true)
			try {
				// Fetch recent posts
				const posts = await getPostsByClassId({
					token: authToken,
					classId,
				})

				// Sort by date and take the 3 most recent
				const sortedPosts = Array.isArray(posts)
					? posts
							.sort(
								(a, b) =>
									new Date(b.post.postDate).getTime() -
									new Date(a.post.postDate).getTime(),
							)
							.slice(0, 3)
					: []

				setRecentPosts(sortedPosts)

				// Fetch resources (files) from supabase
				const { data: files } = await supabase.storage
					.from('content-files')
					.list(classId, {
						sortBy: { column: 'created_at', order: 'desc' },
						limit: 3,
					})

				if (files) {
					// Get URLs for each file
					const resourcesWithUrls = await Promise.all(
						files.map(async (file) => {
							const { data: urlData } = await supabase.storage
								.from('content-files')
								.getPublicUrl(`${classId}/${file.name}`)

							// Parse file name parts
							const nameParts = file.name.split('__')
							const displayName =
								nameParts.length > 2 ? nameParts[2] : file.name

							return {
								name: displayName,
								url: urlData.publicUrl,
								id: file.id,
							}
						}),
					)

					setResources(resourcesWithUrls)
				}
			} catch (error) {
				console.error('Error fetching overview data:', error)
			} finally {
				setLoading(false)
			}
		}

		if (classId && authToken) {
			fetchData()
		}
	}, [classId, authToken])

	const formatDate = (dateString: string) => {
		const date = new Date(dateString)
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	const getTimeSince = (dateString: string) => {
		const date = new Date(dateString)
		const now = new Date()
		const diffMs = now.getTime() - date.getTime()
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

		if (diffDays > 0) {
			return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
		} else {
			return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
		}
	}

	return (
		<div className='space-y-6'>
			{/* Class overview section */}
			<div className='bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-6 mb-6'>
				<div className='flex items-center gap-3 mb-4'>
					<div className='bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-md'>
						<IoBookOutline className='h-6 w-6 md:h-7 md:w-7 text-white' />
					</div>
					<div>
						<h1 className='text-xl md:text-2xl font-bold text-gray-800'>
							Class Overview
						</h1>
						<p className='text-sm md:text-base text-gray-500'>
							Recent activities and resources
						</p>
					</div>
				</div>

				<div className='h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6'></div>

				<div className='grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7'>
					<div className='md:col-span-2'>
						<Card className='border border-gray-100 shadow-sm overflow-hidden'>
							<div className='h-1 bg-gradient-to-r from-blue-500 to-indigo-500'></div>
							<CardHeader className='pb-2'>
								<div className='flex items-center gap-2'>
									<div className='bg-blue-50 p-1.5 rounded-md'>
										<CiChat1 className='h-5 w-5 text-blue-600' />
									</div>
									<CardTitle className='text-lg md:text-xl text-gray-800'>
										Recent Activities
									</CardTitle>
								</div>
							</CardHeader>
							<CardContent className='px-4 pt-2'>
								{loading ? (
									<div className='flex flex-col items-center justify-center py-8 text-center'>
										<div className='w-8 h-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-3'></div>
										<p className='text-gray-500 text-sm'>
											Loading recent activities...
										</p>
									</div>
								) : recentPosts.length === 0 ? (
									<div className='bg-gray-50 rounded-lg p-6 text-center'>
										<div className='bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3'>
											<CiChat1 className='h-6 w-6 text-gray-400' />
										</div>
										<p className='text-gray-500 mb-1'>No recent activities</p>
										<p className='text-xs text-gray-400'>
											New posts and discussions will appear here
										</p>
									</div>
								) : (
									<div className='flex flex-col gap-4'>
										{recentPosts.map((post, index) => (
											<div
												key={post.post.postId}
												className='flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-4 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-sm transition-all'
											>
												<div className='flex gap-3 items-center'>
													<div className='bg-white p-2 rounded-full border border-blue-200 shadow-sm'>
														<CiChat1 className='h-5 w-5 text-blue-600' />
													</div>
													<div className='flex flex-col'>
														<p className='text-sm md:text-base font-medium text-gray-800'>
															{post.post.title}
														</p>
														<div className='flex items-center gap-1'>
															<div className='flex items-center'>
																<div className='bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full w-4 h-4 flex items-center justify-center text-white text-[10px] font-medium'>
																	{post.author?.firstname ? post.author.firstname.charAt(0).toUpperCase() : 
																		post.author?.username ? post.author.username.charAt(0).toUpperCase() : 'U'}
																</div>
																<span className='text-xs font-medium text-blue-700 ml-1'>
																	{post.author?.firstname && post.author?.lastname 
																		? `${post.author.firstname} ${post.author.lastname}`
																		: post.author?.username || 'Unknown user'}
																</span>
															</div>
															<span className='text-xs text-gray-500'>posted a new discussion</span>
														</div>
													</div>
												</div>
												<div className='bg-white px-3 py-1 rounded-full text-xs text-blue-600 border border-blue-200 ml-10 md:ml-0'>
													{getTimeSince(post.post.postDate)}
												</div>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					<Card className='border border-gray-100 shadow-sm overflow-hidden h-fit'>
						<div className='h-1 bg-gradient-to-r from-purple-500 to-pink-500'></div>
						<CardHeader className='pb-2'>
							<div className='flex items-center gap-2'>
								<div className='bg-purple-50 p-1.5 rounded-md'>
									<FaFileLines className='h-4 w-4 text-purple-600' />
								</div>
								<CardTitle className='text-lg md:text-xl text-gray-800'>
									Resources
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent className='px-4 pt-2'>
							{loading ? (
								<div className='flex flex-col items-center justify-center py-8 text-center'>
									<div className='w-8 h-8 border-4 border-t-purple-500 border-purple-200 rounded-full animate-spin mb-3'></div>
									<p className='text-gray-500 text-sm'>Loading resources...</p>
								</div>
							) : resources.length === 0 ? (
								<div className='bg-gray-50 rounded-lg p-6 text-center'>
									<div className='bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3'>
										<FaFileLines className='h-5 w-5 text-gray-400' />
									</div>
									<p className='text-gray-500 mb-1'>No resources available</p>
									<p className='text-xs text-gray-400'>
										Uploaded files will appear here
									</p>
								</div>
							) : (
								<div className='flex flex-col gap-3'>
									{resources.map((resource) => (
										<div
											key={resource.id}
											className='flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 hover:shadow-sm transition-all'
										>
											<p className='text-xs md:text-sm truncate max-w-[150px] text-gray-800 font-medium'>
												{resource.name}
											</p>
											<a
												href={resource.url}
												target='_blank'
												rel='noopener noreferrer'
												className='bg-white p-2 rounded-full border border-purple-200 hover:bg-purple-100 transition-colors'
											>
												<FiDownload className='h-3.5 w-3.5 md:h-4 md:w-4 text-purple-600' />
											</a>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}

export default ClassPage
