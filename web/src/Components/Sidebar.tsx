import React from 'react'
import { FaHouse } from 'react-icons/fa6'
import { FaBookOpenReader } from 'react-icons/fa6'
import { FaCalendar } from 'react-icons/fa6'
import { FaGear } from 'react-icons/fa6'
import { FaRightFromBracket } from 'react-icons/fa6'
import { Link, useNavigate } from 'react-router-dom'
import MenuButton from '@/Components/MenuButton'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { LogoutAPI } from '@/actions/postData'

function Sidebar() {
	const { currentUser, setAuthToken, setCurrentUser } = useGlobalState()
	const navigate = useNavigate()

	const handleLogout = async () => {
		const response = await LogoutAPI({ setAuthToken, setCurrentUser })
		if (!response.error) {
			navigate('/login')
		}
	}

	return (
		<div className='flex w-64 flex-col border border-l-0 border-t-0 h-screen fixed top-0 left-0 border-gray-300 gap-4 m-0 p-0'>
			<div className='flex flex-col gap-2 p-5'>
				<h1 className='text-2xl mb-5 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-700 font-bold'>
					eTutoring
				</h1>
				<MenuButton href='/dashboard/overview'>
					<FaHouse className='text-gray-600 h-5 w-5' />{' '}
					<p className='text-sm'>Overview</p>
				</MenuButton>
				<MenuButton href='/dashboard/classes'>
					<FaBookOpenReader className='text-gray-600 h-5 w-5' />{' '}
					<p className='text-sm'>My Classes</p>
				</MenuButton>
				<MenuButton href='/dashboard/schedule'>
					<FaCalendar className='text-gray-600 h-5 w-5' />{' '}
					<p className='text-sm'>Schedule</p>
				</MenuButton>
			</div>
			<div className='fixed bottom-0 border border-l-0 border-r-0 border-b-0 border-gray-300 w-64 p-5'>
				<div className='flex flex-col gap-4'>
					<div className='flex flex-row gap-4 align-middle items-center justify-between'>
						<div className='flex flex-row gap-4 align-middle items-center'>
							<div className='border border-gray-200 rounded-full w-10 h-10 bg-gray-200'></div>
							<div className='flex flex-col'>
								<h4 className='text-sm font-semibold'>{currentUser?.username}</h4>
								<h4 className='text-sm'>{currentUser?.role.toUpperCase()}</h4>
							</div>
						</div>
						<div className='flex gap-2'>
							<Link to='#'>
								<FaGear className='h-5 w-5 text-gray-600 hover:text-gray-800' />
							</Link>
							<button onClick={handleLogout}>
								<FaRightFromBracket className='h-5 w-5 text-red-500 hover:text-red-700' />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Sidebar
