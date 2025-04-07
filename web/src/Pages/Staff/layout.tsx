import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import StaffSidebar from '@/Components/StaffSidebar'
import { useEffect, useState } from 'react'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { getCurrentUser } from '@/actions/getData'
import { Loader2 } from 'lucide-react'

function StaffLayout() {
	const { currentUser, authToken, setCurrentUser } = useGlobalState()
	const navigate = useNavigate()
	const location = useLocation()
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

				if (user.role !== 'staff' && !location.pathname.startsWith('/dashboard/')) {
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
	}, [authToken, navigate, setCurrentUser, location])

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-50">
				<div className="flex flex-col items-center">
					<Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-2" />
					<p className="text-gray-600">Loading...</p>
				</div>
			</div>
		)
	}

	if (!currentUser || (currentUser.role !== 'staff' && !location.pathname.startsWith('/dashboard/'))) {
		return null
	}

	if (location.pathname.startsWith('/dashboard/')) {
		return <Outlet />
	}

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
