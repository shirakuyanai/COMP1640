import { useEffect, useState } from 'react'
import io from 'socket.io-client'

function StaffDashboardPage() {
	const [stats, setStats] = useState({
		totalStudents: 0,
		totalTutors: 0,
		unallocatedStudents: 0,
	})

	useEffect(() => {
		const socket = io('import.meta.env.VITE_HOST') 

		socket.on('dashboardUpdate', (data: typeof stats) => {
			console.log('📡 Real-time dashboard update:', data)
			setStats(data)
		})

		return () => {
			socket.disconnect()
		}
	}, [])

	return (
		<div className='p-6 bg-gray-100 min-h-screen'>
			<h1 className='text-3xl font-bold mb-6'>Staff Dashboard</h1>

			{/* Overview Cards */}
			<div className='grid grid-cols-2 gap-6 mb-6'>
				{/* System Overview */}
				<div className='bg-white p-6 rounded-lg shadow-md'>
					<h2 className='text-xl font-semibold mb-2'>System Overview</h2>
					<p>Total Students: {stats.totalStudents}</p>
					<p>Total Tutors: {stats.totalTutors}</p>
					<p>Unallocated Students: {stats.unallocatedStudents}</p>
				</div>

				{/* Recent Allocations */}
				<div className='bg-white p-6 rounded-lg shadow-md'>
					<h2 className='text-xl font-semibold mb-2'>Recent Allocations</h2>
					<p>10 students allocated to Dr. Jane Smith</p>
					<p>5 students allocated to Prof. John Doe</p>
				</div>
			</div>

			{/* Tutors Overview Table */}
			<div className='bg-white p-6 rounded-lg shadow-md'>
				<h2 className='text-xl font-semibold mb-4'>Tutors Overview</h2>
				<table className='w-full border-collapse'>
					<thead>
						<tr className='bg-gray-200'>
							<th className='p-3 text-left'>Tutor</th>
							<th className='p-3 text-left'>Students Assigned</th>
							<th className='p-3 text-left'>Last Allocation</th>
						</tr>
					</thead>
					<tbody>
						<tr className='border-t'>
							<td className='p-3'>Dr. Jane Smith</td>
							<td className='p-3'>25</td>
							<td className='p-3'>2025-03-20</td>
						</tr>
						<tr className='border-t'>
							<td className='p-3'>Prof. John Doe</td>
							<td className='p-3'>30</td>
							<td className='p-3'>2025-03-19</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default StaffDashboardPage
