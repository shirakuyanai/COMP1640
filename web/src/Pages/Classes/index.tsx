import { getClassesForUser } from '@/actions/getData'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
} from '@/Components/ui/card'
import { Progress } from '@/Components/ui/progress'
import { useGlobalState } from '@/misc/GlobalStateContext'
import React, { useEffect, useState } from 'react'
import { FaCalendar } from 'react-icons/fa6'
import { FaClock } from 'react-icons/fa6'
import { FaTrophy } from 'react-icons/fa6'
import { Link } from 'react-router-dom'

function ClassesPage() {
	const { currentUser, authToken } = useGlobalState()
	const [classes, setClasses] = useState([])
	const getClasses = async () => {
		const data = await getClassesForUser({
			token: authToken,
			userId: currentUser.id,
			role: currentUser.role,
		})
		if (data) setClasses(data)
	}
	useEffect(() => {
		if (currentUser) getClasses()
	}, [currentUser])
	return (
		<div className='p-8 gap-2'>
			<h1 className='text-2xl font-bold'>Welcome back, John!</h1>
			<h4 className='text-gray-500'>
				Here's what's been happening with your courses
			</h4>
			<div className='grid grid-cols-4 gap-15 mt-10'>
				<Card className='justify-center'>
					<CardContent>
						<div className='items-center grid grid-cols-3'>
							<div className='col-span-1 flex justify-center items-center'>
								<FaCalendar
									size={30}
									className='mr-5 text-blue-500'
								/>
							</div>
							<div className='col-span-2'>
								<CardDescription>
									<h4 className='text-sm text-gray-500'>Classes</h4>
								</CardDescription>
								<p className='text-2xl font-bold'>{classes.length}</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card className='justify-center'>
					<CardContent>
						<div className='items-center grid grid-cols-3'>
							<div className='col-span-1 flex justify-center items-center'>
								<FaClock
									size={30}
									className='mr-5 text-purple-500'
								/>
							</div>
							<div>
								<CardDescription>
									<h4 className='text-sm text-gray-500'>Hours spent</h4>
								</CardDescription>
								<p className='text-2xl font-bold'>20</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card className='justify-center'>
					<CardContent>
						<div className='items-center grid grid-cols-3'>
							<div className='col-span-1 flex justify-center items-center'>
								<FaTrophy
									size={30}
									className='mr-5 text-yellow-300'
								/>
							</div>
							<div>
								<CardDescription>
									<h4 className='text-sm text-gray-500'>Assignments done</h4>
								</CardDescription>
								<p className='text-2xl font-bold'>80%</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
			<div>
				<h1 className='text-2xl font-bold my-8'>My Classes</h1>
				<div className='grid grid-cols-4 gap-5'>
					{classes.map((current_class, i) => (
						<ClassCard
							key={i}
							id={(current_class as any).id}
							name={(current_class as any).className}
							tutorName={(current_class as any).tutorUsername}
							progress={65}
							due='Tomorrow, 10:00 AM'
							isDue={false}
						/>
					))}
				</div>
			</div>
		</div>
	)
}

const ClassCard = ({
	id,
	name,
	progress,
	tutorName,
	due,
	isDue,
}: {
	id: string
	name: string
	tutorName: string
	progress: number
	due: string
	isDue: boolean
}) => {
	const redirectUrl = `/dashboard/classes/${id}`
	return (
		<Card className='py-0'>
			<CardHeader className='bg-gradient-to-r from-purple-500 to-blue-700 font-bold p-2 rounded-t-lg' />
			<CardContent>
				<Link to={redirectUrl}>
					<h2 className='text-xl font-bold'>{name}</h2>
					<h5 className='text-md text-gray-500'>{tutorName}</h5>
					<div className='my-5'>
						<div className='flex justify-between'>
							<p className='text-md text-gray-600'>Course Progress</p>
							<p className='text-m'>{progress}%</p>
						</div>
						<Progress value={(progress / 100) * 100} />
						<div className='my-5'>
							<p className='text-md text-gray-500'>Current assignment due</p>
							{(isDue && (
								<p className='text-m font-semibold text-destructive'>{due}</p>
							)) || <p className='text-m font-semibold'>{due}</p>}
						</div>
					</div>
				</Link>
			</CardContent>
		</Card>
	)
}

export default ClassesPage
