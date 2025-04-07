import { Button } from '@/Components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs'
import React, { useEffect, useState } from 'react'
import MessagePage from './Message'
import ContentPage from './Content'
import BlogPage from './Blog/BlogPage'
import { useParams, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { FaCalendar, FaFileLines } from 'react-icons/fa6'
import { CiChat1 } from 'react-icons/ci'
import { IoBookOutline } from 'react-icons/io5'
import { FiDownload } from 'react-icons/fi'
import MeetingPage from '@/Pages/Staff/Class/MeetingPage'
import { getClassById, getPostsByClassId } from '@/actions/getData'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { supabase } from '@/lib/supabase'

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
				<div className='bg-gradient-to-r from-blue-600 to-purple-500 px-30 py-10 flex flex-col gap-5'>
					<div className='flex flex-row justify-between'>
						<h1 className='text-3xl text-white font-bold'>
							{found_class.className ?? 'N/A'}
						</h1>
					</div>
					<div className='flex flex-row gap-2 items-center'>
						<FaFileLines className='text-gray-200' />
						<div className='flex flex-col'>
							<h4 className='text-sm text-gray-200 font-light'>Class</h4>
							<h4 className='text-sm text-gray-200 font-semibold'>{found_class.className}</h4>
						</div>
					</div>
				</div>
				<div className='px-25 py-10'>
					<Tabs defaultValue={param}>
						<TabsList className='bg-gray-100'>
							<TabsTrigger value='overview'>Overview</TabsTrigger>
							<TabsTrigger value='content'>Content</TabsTrigger>
							<TabsTrigger value='blog'>Blog</TabsTrigger>
							
							<TabsTrigger value='message'>Message</TabsTrigger>
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
					</Tabs>
				</div>
			</div>
		)
}

const MeetingsTab = () => {
	return (
		<div>
			<MeetingPage />
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
		<div className='grid grid-row-2 gap-5'>
			<div className='grid grid-cols-3 gap-7'>
				<div className='col-span-2'>
					<Card>
						<CardHeader>
							<CardTitle>
								<h1 className='text-xl font-semibold'>Recent Activities</h1>
							</CardTitle>
						</CardHeader>
						<CardContent className='px-0 pt-3'>
							{loading ? (
								<div className='flex justify-center py-4'>Loading recent activities...</div>
							) : recentPosts.length === 0 ? (
								<div className='flex justify-center py-4 text-gray-500'>No recent activities</div>
							) : (
								<div className='flex flex-col gap-4'>
									{recentPosts.map((post, index) => (
										<div key={post.post.postId} className='flex flex-row align-center items-center justify-between'>
											<div className='flex flex-row gap-3 align-center items-center'>
												<div className='bg-gray-100 p-2 w-fit rounded-sm'>
													<CiChat1 className='text-black font-black' />
												</div>
												<div className='flex flex-col'>
													<p className='text-md font-semibold'>
														New post: {post.post.title}
													</p>
													<p className='text-sm text-gray-500'>
														{post.author.firstname} {post.author.lastname} posted a new discussion
													</p>
												</div>
											</div>
											<p className='text-sm text-gray-400'>{getTimeSince(post.post.postDate)}</p>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
				<Card className='h-fit py-8'>
					<CardHeader>
						<CardTitle>
							<h1 className='text-xl font-semibold'>Resources</h1>
						</CardTitle>
					</CardHeader>
					<CardContent className='flex flex-col gap-7'>
						{loading ? (
							<div className='flex justify-center'>Loading resources...</div>
						) : resources.length === 0 ? (
							<div className='flex justify-center text-gray-500'>No resources available</div>
						) : (
							resources.map((resource) => (
								<div key={resource.id} className='flex flex-row adjust-center items-center justify-between'>
									<p className='text-sm'>{resource.name}</p>
									<a href={resource.url} target="_blank" rel="noopener noreferrer">
										<FiDownload />
									</a>
								</div>
							))
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

export default ClassPage
