import React from 'react'

function StaffDashboardPage() {
	return (
		<div className='p-6 bg-gray-100 min-h-screen'>
			<h1 className='text-3xl font-bold mb-6'>Staff Dashboard</h1>

			{/* Overview Cards */}
			<div className='grid grid-cols-2 gap-6 mb-6'>
				{/* System Overview */}
				<div className='bg-white p-6 rounded-lg shadow-md'>
					<h2 className='text-xl font-semibold mb-2'>System Overview</h2>
					<p>Total Students: 500</p>
					<p>Total Tutors: 50</p>
					<p>Unallocated Students: 5</p>
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
							<th className='p-3 text-left'>Name</th>
							<th className='p-3 text-left'>Department</th>
							<th className='p-3 text-left'>Number of Tutees</th>
						</tr>
					</thead>
					<tbody>
						<tr className='border-t'>
							<td className='p-3'>Dr. Jane Smith</td>
							<td className='p-3'>Computer Science</td>
							<td className='p-3'>15</td>
						</tr>
						<tr className='border-t'>
							<td className='p-3'>Prof. John Doe</td>
							<td className='p-3'>Physics</td>
							<td className='p-3'>12</td>
						</tr>
						<tr className='border-t'>
							<td className='p-3'>Dr. Emily Brown</td>
							<td className='p-3'>Mathematics</td>
							<td className='p-3'>18</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default StaffDashboardPage
