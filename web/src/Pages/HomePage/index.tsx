import { getSocket, initializeSocket } from '@/lib/socket'
import { useGlobalState } from '@/misc/GlobalStateContext'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function HomePage() {
	const { currentUser } = useGlobalState()
	const [socket, setSocket] = useState(null)

	const navigate = useNavigate()
	useEffect(() => {
		if (currentUser) {
			initializeSocket(currentUser.username)
			setSocket(getSocket())
		}
	}, [currentUser])
	return (
		<div>
			<h1 className='text-3xl'>HomePage</h1>
		</div>
	)
}

export default HomePage
