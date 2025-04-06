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
		<div className='bg-accent/5 min-h-screen'>
			<div className='flex flex-col'>
				<div className='flex w-full md:w-64 border border-l-0 border-t-0 h-fit md:h-screen fixed sm:top-0 sm:left-0 md:right-0 border-gray-300 gap-4 m-0 p-0 bg-white'>
					<Sidebar />
				</div>

				<div className='flex-1 md:ml-64 mt-20 md:mt-0 bg-gray-50'>
					<Outlet />
				</div>
			</div>
		</div>
	)
}

export default Layout
