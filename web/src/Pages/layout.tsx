import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from '@/Components/Sidebar'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/actions/getData'

function Layout() {
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
				
				// Only redirect staff if they're not viewing a student dashboard
				if (user.role === 'staff' && !location.pathname.startsWith('/dashboard/')) {
					setIsLoading(false)
					navigate('/staff')
					return
				}
				
				// Redirect root path to dashboard only if user has an id
				if (location.pathname === '/' && user.id) {
					navigate(`/dashboard/${user.id}`)
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
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
			</div>
		)
	}

	// Allow staff to view student dashboards without sidebar
	if (currentUser?.role === 'staff') {
		return <Outlet />
	}

	if (!currentUser) {
		return null
	}

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
