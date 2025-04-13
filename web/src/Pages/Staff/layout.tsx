import { Outlet, useNavigate } from 'react-router-dom'
import StaffSidebar from '@/Components/StaffSidebar'
import { useEffect, useState } from 'react'
import { useGlobalState } from '@/misc/GlobalStateContext'

function StaffLayout() {
	const { currentUser, isLoading, setIsLoading, authToken } = useGlobalState()
	const navigate = useNavigate()

	useEffect(() => {
		try {
			if (!isLoading) {
				if (!currentUser || !authToken) {
					navigate('/login')
				} else if (currentUser.role === 'system admin') {
					navigate('/admin')
				} else if (currentUser.role !== 'staff') {
					navigate('/')
				}
			}
		} catch (err) {
			console.error('Error navigating:', err)
		} finally {
			setIsLoading(false)
		}
	}, [isLoading, currentUser, authToken])

	if (isLoading || !authToken) return <div>Loading...</div>

	return (
		<div className='min-h-screen bg-gray-50'>
			<div className='flex flex-col md:flex-row'>
				<StaffSidebar />
				<div className='flex-1 md:ml-64 container py-3 px-2 md:py-4 md:px-6 transition-all'>
					<Outlet />
				</div>
			</div>
		</div>
	)
}

export default StaffLayout
