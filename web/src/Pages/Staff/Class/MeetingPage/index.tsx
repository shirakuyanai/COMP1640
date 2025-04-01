import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface Meeting {
	meetingId: string
	class: string
	tutorName: string
	meetingDate: string
	meetingType: 'in-person' | 'online'
	meetingNotes?: string
	meetingLink?: string
}

function MeetingPage() {
	const [meetings, setMeetings] = useState<Meeting[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchMeetings = async () => {
			try {
				const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/meetings`)
				const data = await res.json()
				setMeetings(data)
			} catch (err) {
				console.error('Failed to fetch meetings:', err)
				setError('Failed to load meetings.')
			} finally {
				setLoading(false)
			}
		}

		fetchMeetings()
	}, [])

	return (
		<div className='p-6 bg-gray-100 min-h-screen'>
			<h1 className='text-3xl font-bold mb-6'>Meetings</h1>

			<div className='bg-white p-6 rounded-lg shadow-md'>
				<h2 className='text-xl font-semibold mb-4'>
					Upcoming & Past Meetings
				</h2>

				{loading ? (
					<p>Loading meetings...</p>
				) : error ? (
					<p className='text-red-500'>{error}</p>
				) : meetings.length === 0 ? (
					<p>No meetings found.</p>
				) : (
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
									<td className='p-3'>{meeting.class || '-'}</td>
									<td className='p-3'>{meeting.tutorName || '-'}</td>
									<td className='p-3'>{meeting.meetingDate}</td>
									<td className='p-3 capitalize'>{meeting.meetingType}</td>
									<td className='p-3'>{meeting.meetingNotes || 'N/A'}</td>
									<td className='p-3'>
										{meeting.meetingType === 'online' ? (
											<Link
												to={`/videochat/${meeting.meetingId}`}
												className='text-blue-600 underline'
											>
												Join
											</Link>
										) : (
											'N/A'
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	)
}

export default MeetingPage
