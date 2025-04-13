import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { useNavigate } from 'react-router-dom'
import StaffSidebar from './StaffSidebar'
import { FaGear, FaBell, FaSearch } from 'react-icons/fa6'
import { Toaster } from './ui/toaster'

function Layout({ children }: { children: React.ReactNode }) {
	const { currentUser } = useGlobalState()
	const navigate = useNavigate()

	useEffect(() => {
		if (!currentUser) navigate('/login')
	}, [currentUser, navigate])

	return (
		<div className="flex h-screen bg-slate-50">
			{currentUser?.role === 'staff' ? <StaffSidebar /> : <Sidebar />}
			
			<div className="flex-1 ml-64">
				<header className="bg-white border-b border-slate-200 py-4 px-8 shadow-sm sticky top-0 z-10">
					<div className="flex justify-between items-center">
						<div className="relative w-96">
							<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
								<FaSearch className="w-4 h-4 text-slate-400" />
							</div>
							<input 
								type="text" 
								className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5" 
								placeholder="Search..." 
							/>
						</div>
						<div className="flex items-center space-x-4">
							<button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
								<FaBell className="w-5 h-5" />
								<span className="absolute top-0 right-0 block w-2.5 h-2.5 bg-red-500 rounded-full"></span>
							</button>
							<button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
								<FaGear className="w-5 h-5" />
							</button>
						</div>
					</div>
				</header>
				
				<main className="container mx-auto">
					{children}
				</main>
			</div>
			<Toaster />
		</div>
	)
}

export default Layout 