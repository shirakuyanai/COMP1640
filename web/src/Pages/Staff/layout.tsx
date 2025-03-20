import { Outlet, useNavigate } from 'react-router-dom'
import StaffSidebar from '@/Components/StaffSidebar'
import { useEffect, useState } from 'react'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { getCurrentUser } from '@/actions/getData'

function StaffLayout() {
	const { currentUser, authToken, setCurrentUser } = useGlobalState()
	const navigate = useNavigate()
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const checkAuth = async () => {
			if (!authToken) {
				setIsLoading(false)
				navigate('/login')
				return
			}

			try {
				const user = await getCurrentUser(authToken)
				if (!user) {
					setIsLoading(false)
					navigate('/login')
					return
				}

				setCurrentUser(user)

				if (user.role !== 'staff') {
					setIsLoading(false)
					navigate('/')
					return
				}

				setIsLoading(false)
			} catch (error) {
				console.error('Auth check failed:', error)
				setIsLoading(false)
				navigate('/login')
			}
		}

		checkAuth()
	}, [authToken, navigate, setCurrentUser])

	if (isLoading) {
		return <div>Loading...</div>
	}

	if (!currentUser || currentUser.role !== 'staff') {
		return null
	}

	return (
		<div className='bg-accent/5 min-h-screen'>
			<div className='flex flex-row'>
				<StaffSidebar />
				<div className='flex-1 ml-64 container p-15 bg-gray-50'>
					<Outlet />
				</div>
			</div>
		</div>
	)
}

export default StaffLayout
