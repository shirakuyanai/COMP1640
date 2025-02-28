import { Outlet, useNavigate } from 'react-router-dom'
import StaffSidebar from '@/components/StaffSidebar'
import { useEffect, useState } from 'react'
import { useGlobalState } from '@/misc/GlobalStateContext'

function StaffLayout() {
	const { currentUser } = useGlobalState()
	const navigate = useNavigate()

	useEffect(() => {
		if (currentUser) {
			if (currentUser.role === 'staff') {
				navigate('/staff')
			} else {
				navigate('/')
			}
		} else {
			navigate('/login')
		}
	}, [currentUser])

	return (
		<div className='bg-accent/5 min-h-screen'>
			<div className='flex flex-row'>
				<StaffSidebar />
				<div className='flex-1 ml-64 container p-15'>
					<Outlet />
				</div>
			</div>
		</div>
	)
}

export default StaffLayout
