import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '@/Components/Sidebar'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/actions/getData'

function Layout() {
	const { currentUser, isLoading, authToken, setIsLoading } = useGlobalState()
	const navigate = useNavigate()

	useEffect(() => {
		try {
			if (!isLoading) {
				if (!currentUser || !authToken) {
					navigate('/login')
				} else {
					if (currentUser.role === 'staff') navigate('/staff')
				}
			}
		} catch (err) {
			console.error('Error navigating:', err)
		} finally {
			setIsLoading(false)
		}
	}, [isLoading, currentUser])

	if (isLoading || !authToken) return <div>Loading...</div>

	return (
		<div className='min-h-screen bg-gradient-to-br from-purple-50 to-blue-50'>
			<div className='flex flex-col md:flex-row'>
				<Sidebar />
				<div className='flex-1 md:ml-64 container py-3 px-2 md:py-6 md:px-8'>
					<div className='bg-white rounded-xl shadow-sm border border-gray-100 min-h-[calc(100vh-1.5rem)] md:min-h-[calc(100vh-3rem)]'>
						<Outlet />
					</div>
				</div>
			</div>
		</div>
	)
}

export default Layout
