import React, { useState } from 'react'

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
	const [meetings, setMeetings] = useState(sampleMeetings)

	return (
		<div className='p-6 bg-gray-100 min-h-screen'>
			<h1 className='text-3xl font-bold mb-6'>Meetings</h1>

			{/* Meetings Table */}
			<div className='bg-white p-6 rounded-lg shadow-md'>
				<h2 className='text-xl font-semibold mb-4'>Upcoming & Past Meetings</h2>
				<table className='w-full border-collapse'>
					<thead>
						<tr className='bg-gray-200'>
							<th className='p-3 text-left'>Class</th>
							<th className='p-3 text-left'>Tutor</th>
							<th className='p-3 text-left'>Date & Time</th>
							<th className='p-3 text-left'>Type</th>
							<th className='p-3 text-left'>Notes</th>
							<th className='p-3 text-left'>Meeting Link</th>
						</tr>
					</thead>
					<tbody>
						{meetings.map((meeting) => (
							<tr key={meeting.meetingId} className='border-t'>
								<td className='p-3'>{meeting.class}</td>
								<td className='p-3'>{meeting.tutorName}</td>
								<td className='p-3'>{meeting.meetingDate}</td>
								<td className='p-3 capitalize'>{meeting.meetingType}</td>
								<td className='p-3'>{meeting.meetingNotes || 'N/A'}</td>
								<td className='p-3'>
									{meeting.meetingType === 'online' ? (
										<a
											href='https://meet.google.com/hwj-mmya-xon'
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
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default MeetingPage
