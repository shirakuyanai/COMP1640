import { Button } from '@/Components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs'
import React, { useEffect, useState } from 'react'
import MessagePage from './Message'
import ContentPage from './Content'
import BlogPage from './Blog/BlogPage'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { FaPlus, FaVideo, FaMapMarkerAlt, FaClock, FaExternalLinkAlt, FaCalendar } from 'react-icons/fa'
import { FaFileLines } from 'react-icons/fa6'
import { CiChat1 } from 'react-icons/ci'
import { IoBookOutline } from 'react-icons/io5'
import { FiDownload } from 'react-icons/fi'
import MeetingPage from '@/Pages/Staff/Class/MeetingPage'
import { getClassById, getPostsByClassId, getMeetingsOfAClass } from '@/actions/getData'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { supabase } from '@/lib/supabase'
import { convertToLocalTimezone } from '@/lib/utils'

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
							<h4 className='text-xs md:text-sm text-gray-200 font-light'>Class</h4>
							<h4 className='text-xs md:text-sm text-gray-200 font-semibold'>{found_class.className}</h4>
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
	classId?: string;
}

const MeetingTab: React.FC<MeetingTabProps> = ({ classId }) => {
	return (
		<div>
			<MeetingPage />
		</div>
	);
};

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
					? posts.sort((a, b) => new Date(b.post.postDate).getTime() - new Date(a.post.postDate).getTime()).slice(0, 3)
					: []
				
				setRecentPosts(sortedPosts)
				
				// Fetch resources (files) from supabase
				const { data: files } = await supabase
					.storage
					.from('content-files')
					.list(classId, {
						sortBy: { column: 'created_at', order: 'desc' },
						limit: 3
					})
				
				if (files) {
					// Get URLs for each file
					const resourcesWithUrls = await Promise.all(
						files.map(async (file) => {
							const { data: urlData } = await supabase
								.storage
								.from('content-files')
								.getPublicUrl(`${classId}/${file.name}`)
								
							// Parse file name parts
							const nameParts = file.name.split('__')
							const displayName = nameParts.length > 2 ? nameParts[2] : file.name
							
							return {
								name: displayName,
								url: urlData.publicUrl,
								id: file.id
							}
						})
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
			minute: '2-digit' 
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
						<IoBookOutline className="h-6 w-6 md:h-7 md:w-7 text-white" />
					</div>
					<div>
						<h1 className='text-xl md:text-2xl font-bold text-gray-800'>Class Overview</h1>
						<p className='text-sm md:text-base text-gray-500'>Recent activities and resources</p>
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
									<CardTitle className="text-lg md:text-xl text-gray-800">
										Recent Activities
									</CardTitle>
								</div>
							</CardHeader>
							<CardContent className='px-4 pt-2'>
								{loading ? (
									<div className='flex flex-col items-center justify-center py-8 text-center'>
										<div className='w-8 h-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-3'></div>
										<p className='text-gray-500 text-sm'>Loading recent activities...</p>
									</div>
								) : recentPosts.length === 0 ? (
									<div className='bg-gray-50 rounded-lg p-6 text-center'>
										<div className='bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3'>
											<CiChat1 className='h-6 w-6 text-gray-400' />
										</div>
										<p className='text-gray-500 mb-1'>No recent activities</p>
										<p className='text-xs text-gray-400'>New posts and discussions will appear here</p>
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
														<p className='text-xs text-gray-500'>
															{post.author.firstname} {post.author.lastname} posted a new discussion
														</p>
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
								<CardTitle className="text-lg md:text-xl text-gray-800">
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
									<p className='text-xs text-gray-400'>Uploaded files will appear here</p>
								</div>
							) : (
								<div className='flex flex-col gap-3'>
									{resources.map((resource) => (
										<div key={resource.id} className='flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 hover:shadow-sm transition-all'>
											<p className='text-xs md:text-sm truncate max-w-[150px] text-gray-800 font-medium'>{resource.name}</p>
											<a 
												href={resource.url} 
												target="_blank" 
												rel="noopener noreferrer" 
												className="bg-white p-2 rounded-full border border-purple-200 hover:bg-purple-100 transition-colors"
											>
												<FiDownload className="h-3.5 w-3.5 md:h-4 md:w-4 text-purple-600" />
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
