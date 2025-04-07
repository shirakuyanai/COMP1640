import React, { useState, useEffect } from 'react'
import { FaHouse, FaChartLine } from 'react-icons/fa6'
import { FaBookOpenReader } from 'react-icons/fa6'
import { FaGear } from 'react-icons/fa6'
import { FaRightFromBracket } from 'react-icons/fa6'
import { FaBars, FaXmark } from 'react-icons/fa6'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { LogoutAPI } from '@/actions/postData'
import { cn } from '@/lib/utils'

function StaffSidebar() {
	const { currentUser, setAuthToken, setCurrentUser } = useGlobalState()
	const navigate = useNavigate()
	const location = useLocation()
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	
	// Close sidebar when route changes on mobile
	useEffect(() => {
		setMobileMenuOpen(false)
	}, [location.pathname])

	const handleLogout = async () => {
		const response = await LogoutAPI({ setAuthToken, setCurrentUser })
		if (!response.error) {
			navigate('/login')
		}
	}

	const MenuItem = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => {
		const isActive = location.pathname.startsWith(href)
		
		return (
			<Link 
				to={href}
				className={cn(
					"flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
					isActive 
						? "bg-gradient-to-r from-indigo-50 to-blue-50 text-blue-700 font-medium border-l-4 border-blue-500" 
						: "text-slate-600 hover:bg-slate-100"
				)}
			>
				<div className={cn(
					"flex items-center justify-center",
					isActive ? "text-blue-700" : "text-slate-500"
				)}>
					{icon}
				</div>
				<span className="text-sm">{label}</span>
			</Link>
		)
	}

	// Mobile menu toggle button
	const MobileMenuButton = () => (
		<button 
			onClick={() => setMobileMenuOpen(prev => !prev)}
			className="fixed top-4 right-4 z-50 md:hidden bg-white p-2 rounded-lg shadow-md"
		>
			{mobileMenuOpen ? 
				<FaXmark className="h-6 w-6 text-slate-700" /> : 
				<FaBars className="h-6 w-6 text-slate-700" />
			}
		</button>
	);

	return (
		<>
			<MobileMenuButton />
			<div className={cn(
				"flex w-64 flex-col bg-white border-r border-slate-200 shadow-sm h-screen fixed top-0 left-0 gap-4 m-0 p-0 z-40 transition-transform duration-300 ease-in-out",
				mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
			)}>
				<div className='flex flex-col gap-3 p-5'>
					<h1 className='text-2xl mb-5 pt-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 font-bold'>
						<Link to='/staff'>eTutoring - Staff</Link>
					</h1>
					
					<div className="space-y-1">
						<MenuItem 
							href='/staff' 
							icon={<FaChartLine className='h-5 w-5' />} 
							label="Dashboard" 
						/>
						<MenuItem 
							href='/staff/classes/new' 
							icon={<FaHouse className='h-5 w-5' />} 
							label="Add a new class" 
						/>
						<MenuItem 
							href='/staff/reallocate' 
							icon={<FaBookOpenReader className='h-5 w-5' />} 
							label="Reallocate student(s)" 
						/>
					</div>
				</div>
				
				<div className='fixed bottom-0 border-t border-slate-200 w-64 p-5 bg-white'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-3'>
							<div className='bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-medium'>
								{currentUser?.username?.substring(0, 1)?.toUpperCase() || 'S'}
							</div>
							<div className='flex flex-col'>
								<h4 className='text-sm font-semibold text-slate-800'>
									{currentUser?.username}
								</h4>
								<h4 className='text-xs text-slate-500'>{currentUser?.role.toUpperCase()}</h4>
							</div>
						</div>
						<div className='flex gap-3'>
							<button className="rounded-full p-2 hover:bg-slate-100 transition-colors">
								<FaGear className='h-5 w-5 text-slate-500 hover:text-slate-700' />
							</button>
							<button 
								onClick={handleLogout}
								className="rounded-full p-2 hover:bg-red-50 transition-colors"
							>
								<FaRightFromBracket className='h-5 w-5 text-red-500 hover:text-red-700' />
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default StaffSidebar
