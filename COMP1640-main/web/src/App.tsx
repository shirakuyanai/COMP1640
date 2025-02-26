import React, { lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './Pages/layout'
import LoginPage from './Pages/LoginPage'
import HomePage from './Pages/HomePage'
import OverViewPage from './Pages/Overview'
import ClassPage from './Pages/ClassPage'
import NotFound from './Components/NotFound'
import StaffLayout from './Pages/Staff'
import EditClass from './Pages/Staff/Class/EditClass'
import AddClass from './Pages/Staff/Class/AddClass'
import StaffDashboardPage from './Pages/Staff/StaffDashboardPage'
import { ToastProvider } from './Components/ui/use-toast'

function App() {
	return (
		<ToastProvider>
			<Router>
				<Routes>
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
							path='/overview'
							element={<OverViewPage />}
						/>

						<Route
							index
							path='/classes'
							element={<ClassPage />}
						/>
						<Route
							path='*'
							element={<NotFound />}
						/>
					</Route>
					<Route element={<StaffLayout />}>
						<Route
							path='/class/edit'
							element={<EditClass />}
						/>
						<Route
							path='/class/add'
							element={<AddClass />}
						/>
						<Route
							path='/staff'
							element={<StaffDashboardPage />}
						/>
					</Route>
				</Routes>
			</Router>
		</ToastProvider>
	)
}

export default App
