import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '@/Components/Sidebar'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/actions/getData'

function Layout() {
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
				
				if (user.role === 'staff') {
					setIsLoading(false)
					navigate('/staff')
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

	if (!currentUser || currentUser.role === 'staff') {
		return null
	}

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
