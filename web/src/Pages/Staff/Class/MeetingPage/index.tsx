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
import { Link, useParams } from 'react-router-dom'
import { z } from 'zod'

interface Meeting {
	meetingId: string
	class: string
	tutorName: string
	meetingDate: string
	meetingType: 'in-person' | 'online'
	meetingNotes?: string
	meetingLink?: string
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
	const [meetings, setMeetings] = useState([])
	const { id } = useParams()
	const { authToken } = useGlobalState()

	const form = useForm<z.infer<typeof meetingAttendanceSchema>>({
		resolver: zodResolver(meetingAttendanceSchema),
		defaultValues: {
			meetings: meetings.map((meeting) => ({
				meetingId: (meeting as MeetingType).meetingId,
				status: (meeting as MeetingType).studentAttended ?? 0,
			})),
		},
	})

	useEffect(() => {
		meetings.forEach((meeting, i) => {
			form.setValue(
				`meetings.${i}.status`,
				(meeting as MeetingType).studentAttended || 0,
			)
		})
	}, [meetings])
	const getMeetings = async () => {
		const response = await getMeetingsOfAClass({
			classId: id ?? '',
			token: authToken,
		})

		setMeetings(response)
	}

	const onSubmit = async (values: z.infer<typeof meetingAttendanceSchema>) => {
		const response = await updateMeetingAttendance(values, authToken)
		alert(response)
	}

	useEffect(() => {
		getMeetings()
	}, [])

	return (
		<div className='p-6 bg-gray-100 min-h-screen'>
			<div className='flex flex-row justify-between'>
				<h1 className='text-3xl font-bold mb-6'>Meeting records</h1>
				<Button>
					<Link to={`/dashboard/classes/${id}/meetings/newMeeting`}>
						New Meeting
					</Link>
				</Button>
			</div>

			{/* Meetings Table */}

			<div className='bg-white p-6 rounded-lg shadow-md'>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<table className='w-full border-collapse'>
							<thead>
								<tr className='bg-gray-200'>
									<th className='p-3 text-left'>Date & Time</th>
									<th className='p-3 text-left'>Type</th>
									<th className='p-3 text-left'>Notes</th>
									<th className='p-3 text-left'>Meeting Link</th>
									<th className='p-3 text-left'>Location</th>
									<th className='p-3 text-left'>Attended</th>
								</tr>
							</thead>
							<tbody>
								{meetings.map((meeting, i) => (
									<tr
										key={i}
										className='border-t'
									>
										<td className='p-3'>
											{(meeting as MeetingType).meetingDate}
										</td>
										<td className='p-3 capitalize'>
											{(meeting as MeetingType).meetingType}
										</td>
										<td className='p-3'>
											{(meeting as MeetingType).meetingNotes || 'N/A'}
										</td>
										<td className='p-3'>
											{(meeting as MeetingType).meetingType === 'online' ? (
												<a
													href={(meeting as MeetingType).meetingLink}
													target='_blank'
													rel='noopener noreferrer'
													className='text-blue-600 underline'
												>
													Join
												</a>
											) : (
												'N/A'
											)}
										</td>
										<td className='p-3'>
											{(meeting as MeetingType).location || 'N/A'}
										</td>
										<td className='p-3'>
											<Input
												type='hidden'
												value={(meeting as MeetingType).meetingId}
												{...form.register(`meetings.${i}.meetingId`)}
											/>
											<FormField
												control={form.control}
												name={`meetings.${i}.status`}
												render={({ field }) => (
													<select
														className='border-1 rounded-md p-2'
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
								))}
							</tbody>
						</table>
						<Button
							type='submit'
							className='w-fit'
						>
							Save
						</Button>
					</form>
				</Form>
				{meetings.length === 0 && (
					<div className='bg-white p-6 rounded-lg shadow-md flex justify-center'>
						<p className='text-gray-500'>No meetings found.</p>
					</div>
				)}
			</div>
		</div>
	)
}

export default MeetingPage
