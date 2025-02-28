import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/actions/getData'

function Layout() {
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
				<Sidebar />
				<div className='flex-1 ml-64 container'>
					<Outlet />
				</div>
			</div>
		</div>
	)
}

export default Layout
