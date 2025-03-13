import React, { lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './Pages/layout'
import LoginPage from './Pages/LoginPage'
import HomePage from './Pages/HomePage'
import OverViewPage from './Pages/Overview'
import ClassesPage from './Pages/Classes'
import NotFound from '@/Components/NotFound'
import StaffLayout from './Pages/Staff/layout'
import ReallocateStudentPage from './Pages/Staff/Class/ReallocateStudentPage'
import AddClass from './Pages/Staff/Class/AddClass'
import StaffDashboardPage from './Pages/Staff/StaffDashboardPage'
import { GlobalStateProvider } from './misc/GlobalStateContext'
import MessagePage from './Pages/Classes/ClassPage/Message'
import ClassPage from './Pages/Classes/ClassPage'

function App() {
	return (
		<GlobalStateProvider>
			<Router>
				<Routes>
					<Route
						path='*'
						element={<NotFound />}
					/>
					<Route
						index
						path='/login'
						element={<LoginPage />}
					/>
					<Route element={<Layout />}>
						<Route
							index
							path='/'
							element={<HomePage />}
						/>
						<Route
							path='/dashboard/overview'
							element={<OverViewPage />}
						/>

						<Route
							index
							path='/dashboard/classes'
							element={<ClassesPage />}
						/>
						<Route
							index
							path='/dashboard/classes/:id'
							element={<ClassPage />}
						/>
						<Route
							index
							path='/dashboard/classes/:id/message'
							element={<MessagePage />}
						/>
					</Route>
					<Route element={<StaffLayout />}>
						<Route
							path='/staff'
							element={<StaffDashboardPage />}
						/>
						<Route
							path='/staff/classes/new'
							element={<AddClass />}
						/>
						<Route
							path='/staff/reallocate'
							element={<ReallocateStudentPage />}
						/>
					</Route>
				</Routes>
			</Router>
		</GlobalStateProvider>
	)
}

export default App
