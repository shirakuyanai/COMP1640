import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '@/Components/Sidebar'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/actions/getData'

function Layout() {
	const { currentUser, authToken } = useGlobalState()
	const navigate = useNavigate()
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const checkAuth = async () => {
			if (!authToken) {
				navigate('/login')
				return
			}

			try {
				const user = await getCurrentUser(authToken)
				if (!user) {
					navigate('/login')
				} else if (user.role === 'staff') {
					navigate('/staff')
				}
			} catch (error) {
				navigate('/login')
			} finally {
				setIsLoading(false)
			}
		}

		checkAuth()
	}, [authToken, navigate])

	if (isLoading) {
		return <div>Loading...</div>
	}

	if (!currentUser) {
		return null
	}

	return (
		<div className='bg-accent/5 min-h-screen'>
			<div className='flex flex-row'>
				<Sidebar />
				<div className='flex-1 ml-64 container bg-gray-50'>
					<Outlet />
				</div>
			</div>
		</div>
	)
}

export default Layout
