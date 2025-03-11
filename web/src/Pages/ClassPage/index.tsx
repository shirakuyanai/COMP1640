import { Card, CardContent, CardDescription } from '@/Components/ui/card'
import React from 'react'
import { FaCalendar } from 'react-icons/fa6'
import { FaClock } from 'react-icons/fa6'
import { FaTrophy } from 'react-icons/fa6'

function ClassPage() {
	return (
		<div className='p-8 gap-2'>
			<h1 className='text-2xl font-bold'>Welcome back, John!</h1>
			<h4 className='text-gray-500'>
				Here's what's been happening with your courses
			</h4>
			<div className='grid grid-cols-4 gap-15 mt-10'>
				<Card>
					<CardContent>
						<div className='justify-center align-middle items-center grid grid-cols-3'>
							<FaCalendar
								size={30}
								className='mr-5 text-blue-500 items-end bg-red-300'
							/>
							<div className='col-span-2'>
								<CardDescription>
									<h4 className='text-sm text-gray-500'>Classes today</h4>
								</CardDescription>
								<p className='text-2xl font-bold'>3</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent>
						<div className='flex justify-center align-middle items-center'>
							<FaClock
								size={30}
								className='mr-5 text-purple-500'
							/>
							<div>
								<CardDescription>
									<h4 className='text-sm text-gray-500'>Hours spent</h4>
								</CardDescription>
								<p className='text-2xl font-bold'>20</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent>
						<div className='flex justify-center align-middle items-center'>
							<FaTrophy
								size={30}
								className='mr-5 text-yellow-300'
							/>
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
		</div>
	)
}

export default ClassPage
