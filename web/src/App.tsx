import React, { lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './Pages/layout'
import LoginPage from './Pages/LoginPage'
import HomePage from './Pages/HomePage'
import OverViewPage from './Pages/Overview'
import ClassesPage from './Pages/Classes'
import NotFound from '@/Components/NotFound'
import StaffLayout from './Pages/Staff/layout'
import ReallocatePage from './Pages/Staff/Reallocate'
import AddClass from './Pages/Staff/Class/AddClass'
import StaffDashboardPage from './Pages/Staff/StaffDashboardPage'
import { GlobalStateProvider, useGlobalState } from './misc/GlobalStateContext'
import MessagePage from './Pages/Classes/ClassPage/Message'
import ClassPage from './Pages/Classes/ClassPage'
import { Toaster } from '@/Components/ui/toaster'
import MeetingPage from './Pages/Staff/Class/MeetingPage'
import NewMeeting from './Pages/Staff/Class/MeetingPage/NewMeeting'
import Schedule from './Pages/Schedule'

// Root redirect component
function RootRedirect() {
	const { currentUser, authToken } = useGlobalState()
	
	if (!authToken) {
		return <Navigate to="/login" replace />
	}
	
	if (currentUser?.role === 'staff') {
		return <Navigate to="/staff" replace />
	}
	
	return <Navigate to={`/dashboard/${currentUser?.id}`} replace />
}

// Dashboard redirect component
function DashboardRedirect() {
	const { currentUser } = useGlobalState()
	return <Navigate to={`/dashboard/${currentUser?.id}`} replace />
}

function App() {
	return (
		<GlobalStateProvider>
			<Router>
				<Routes>
					{/* Root redirect */}
					<Route path="/" element={<RootRedirect />} />

					{/* Public routes */}
					<Route path='/login' element={<LoginPage />} />

					{/* Student/User routes */}
					<Route element={<Layout />}>
						{/* Dashboard routes */}
						<Route path='/dashboard'>
							<Route index element={<DashboardRedirect />} />
							<Route path=':userId' element={<OverViewPage />} />
							<Route path='overview' element={<DashboardRedirect />} />
							<Route path='schedule' element={<Schedule />} />
							
							{/* Classes routes */}
							<Route path='classes'>
								<Route index element={<ClassesPage />} />
								<Route path=':id'>
									<Route index element={<ClassPage />} />
									<Route path='meetings'>
										<Route index element={<MeetingPage />} />
										<Route path='new' element={<NewMeeting />} />
									</Route>
								</Route>
							</Route>
						</Route>
					</Route>

					{/* Staff routes */}
					<Route element={<StaffLayout />}>
						<Route path='/staff'>
							<Route index element={<StaffDashboardPage />} />
							<Route path='classes'>
								<Route path='new' element={<AddClass />} />
							</Route>
							<Route path='reallocate' element={<ReallocatePage />} />
						</Route>
					</Route>

					{/* Catch-all route for 404 */}
					<Route path='*' element={<NotFound />} />
				</Routes>
				<Toaster />
			</Router>
		</GlobalStateProvider>
	)
}

export default App
