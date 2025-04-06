import { Button } from '@/Components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs'
import React, { useEffect } from 'react'
import MessagePage from './Message'
import ContentPage from './Content'
import { useParams, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Progress } from '@/Components/ui/progress'
import { FaCalendar, FaFileLines } from 'react-icons/fa6'
import { CiChat1 } from 'react-icons/ci'
import { IoBookOutline } from 'react-icons/io5'
import { FiDownload } from 'react-icons/fi'
import MeetingPage from '@/Pages/Staff/Class/MeetingPage'
import { getClassById } from '@/actions/getData'
import { useGlobalState } from '@/misc/GlobalStateContext'

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
				<div className='bg-gradient-to-r from-blue-600 to-purple-500 px-5 md:px-30 py-10 flex flex-col gap-5'>
					<div className='flex flex-row justify-between'>
						<h1 className='text-3xl text-white font-bold'>
							{found_class.className ?? 'N/A'}
						</h1>
						<Button variant='outline'>Join Meet</Button>
					</div>
					<div className='flex flex-row gap-2 items-center'>
						<FaFileLines className='text-gray-200' />
						<div className='flex flex-col'>
							<h4 className='text-sm text-gray-200 font-light'>Assignments</h4>
							<h4 className='text-sm text-gray-200 font-semibold'>12 total</h4>
						</div>
					</div>
				</div>
				<div className='px-5 md:px-25 py-10'>
					<Tabs defaultValue={param}>
						<TabsList className='bg-gray-100'>
							<TabsTrigger value='overview'>Overview</TabsTrigger>
							<TabsTrigger value='content'>Content</TabsTrigger>
							<TabsTrigger value='assignment'>Assignment</TabsTrigger>
							<TabsTrigger value='message'>Message</TabsTrigger>
							<TabsTrigger value='meetings'>Meetings</TabsTrigger>
						</TabsList>
						<TabsContent value='overview'>
							<OverviewTab />
						</TabsContent>
						<TabsContent value='content'>
							<ContentPage />
						</TabsContent>
						<TabsContent value='assignment'>
							<div>Assignment</div>
						</TabsContent>
						<TabsContent value='message'>
							<MessagePage found_class={found_class} />
						</TabsContent>
						<TabsContent value='meetings'>
							<MeetingsTab />
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

const OverviewTab = () => {
	return (
		<div className='grid grid-row-2 gap-5'>
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-7'>
				<div className='col-span-2'>
					<Card>
						<CardHeader>
							<CardTitle>
								<h1 className='text-xl font-semibold'>Course Progress</h1>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='flex flex-col gap-2'>
								<div className='flex flex-row justify-between'>
									<p className='text-sm text-gray-500'>Overall Progress</p>
									<p className='text-sm font-semibold'>65%</p>
								</div>
								<Progress
									value={(65 / 100) * 100}
									className='mb-4'
								/>
								<div className='grid grid-cols-3 gap-2'>
									<Card className='bg-green-100 shadow-none border-none p-4 gap-0'>
										<p className='text-green-700 text-sm font-medium'>
											Completed
										</p>
										<h3 className='text-green-700 text-xl font-bold'>8/12</h3>
									</Card>
									<Card className='bg-blue-100 shadow-none border-none p-4 gap-0'>
										<p className='text-blue-700 text-sm font-medium'>
											In Progress
										</p>
										<h3 className='text-blue-700 text-xl font-bold'>3</h3>
									</Card>
									<Card className='bg-gray-100 shadow-none border-none p-4 gap-0'>
										<p className='text-gray-700 text-sm font-medium'>
											Not Started
										</p>
										<h3 className='text-gray-700 text-xl font-bold'>3</h3>
									</Card>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
				<div className='col-span-2 lg:col-span-1'>
					<Card>
						<CardHeader>
							<CardTitle>
								<h1 className='text-xl font-semibold'>Upcoming</h1>
							</CardTitle>
						</CardHeader>
						<CardContent className='gap-4 flex flex-col'>
							<div className='flex flex-row gap-4 justfity-center align-start items-start'>
								<div className='bg-purple-100 p-2 flex w-fit'>
									<FaCalendar className='text-purple-500' />
								</div>
								<div className='flex flex-col gap-1'>
									<h4 className='text-sm font-semibold'>
										Project Presentation
									</h4>
									<h5 className='text-xs text-gray-500'>Tomorrow, 10:00 AM</h5>
									<h5 className='text-xs p-1 bg-gray-100 w-fit rounded-md font-semibold'>
										Presentation
									</h5>
								</div>
							</div>
							<div className='flex flex-row gap-4 justfity-center align-start items-start'>
								<div className='bg-purple-100 p-2 flex w-fit'>
									<FaCalendar className='text-purple-500' />
								</div>
								<div className='flex flex-col gap-1'>
									<h4 className='text-sm font-semibold'>Quiz 3</h4>
									<h5 className='text-xs text-gray-500'>Tomorrow, 10:00 AM</h5>
									<h5 className='text-xs p-1 bg-gray-100 w-fit rounded-md font-semibold'>
										Assessment
									</h5>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-7'>
				<Card className='col-span-2'>
					<CardHeader>
						<CardTitle>
							<h1 className='text-xl font-semibold'>Recent Activities</h1>
						</CardTitle>
						<CardContent className='px-0 pt-3'>
							<div className='flex flex-col gap-4'>
								<div className='flex flex-row align-center items-center justify-between'>
									<div className='flex flex-row gap-3 align-center items-center'>
										<div className='bg-gray-100 p-2 w-fit rounded-sm'>
											<FaFileLines className='text-gray-600' />
										</div>
										<div className='flex flex-col'>
											<p className='text-md font-semibold'>
												Assignment submitted
											</p>
											<p className='text-sm text-gray-500'>
												You submitted 'Project Milestone 2'
											</p>
										</div>
									</div>
									<p className='text-sm text-gray-400'>2 hours ago</p>
								</div>
								<div className='flex flex-row align-center items-center justify-between'>
									<div className='flex flex-row gap-3 align-center items-center'>
										<div className='bg-gray-100 p-2 w-fit rounded-sm'>
											<CiChat1 className='text-black font-black' />
										</div>
										<div className='flex flex-col'>
											<p className='text-md font-semibold'>New discussion</p>
											<p className='text-sm text-gray-500'>
												Mr.Smith posted a new discussion topic
											</p>
										</div>
									</div>
									<p className='text-sm text-gray-400'>1 day ago</p>
								</div>
								<div className='flex flex-row align-center items-center justify-between'>
									<div className='flex flex-row gap-3 align-center items-center'>
										<div className='bg-gray-100 p-2 w-fit rounded-sm'>
											<IoBookOutline className='text-black font-black' />
										</div>
										<div className='flex flex-col'>
											<p className='text-md font-semibold'>Content updated</p>
											<p className='text-sm text-gray-500'>
												New learning materials have been added
											</p>
										</div>
									</div>
									<p className='text-sm text-gray-400'>2 days ago</p>
								</div>
							</div>
						</CardContent>
					</CardHeader>
				</Card>
				<Card className='col-span-2 lg:col-span-1'>
					<CardHeader>
						<CardTitle>
							<h1 className='text-xl font-semibold'>Resources</h1>
						</CardTitle>
					</CardHeader>
					<CardContent className='flex flex-col gap-7'>
						<div className='flex flex-row adjust-center items-center justify-between'>
							<p className='text-sm'>course_syllabus.pdf</p>
							<FiDownload />
						</div>
						<div className='flex flex-row adjust-center items-center justify-between'>
							<p className='text-sm'>reading_list.pdf</p>
							<FiDownload />
						</div>
						<div className='flex flex-row adjust-center items-center justify-between'>
							<p className='text-sm'>project_guideline.pdf</p>
							<FiDownload />
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

export default ClassPage
