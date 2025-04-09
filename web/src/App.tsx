import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from 'react-router-dom'
import Layout from './Pages/layout'
import LoginPage from './Pages/LoginPage'
import HomePage from './Pages/AdminPage'
import OverViewPage from './Pages/Overview'
import ClassesPage from './Pages/Classes'
import NotFound from '@/Components/NotFound'
import StaffLayout from './Pages/Staff/layout'
import ReallocatePage from './Pages/Staff/Reallocate'
import AddClass from './Pages/Staff/Class/AddClass'
import StaffDashboardPage from './Pages/Staff/StaffDashboardPage'
import { GlobalStateProvider } from './misc/GlobalStateContext'
import ClassPage from './Pages/Classes/ClassPage'
import { Toaster } from '@/Components/ui/toaster'
import MeetingPage from './Pages/Staff/Class/MeetingPage'
import NewMeeting from './Pages/Staff/Class/MeetingPage/NewMeeting'
import Schedule from './Pages/Schedule'
import ViewUserPublicInfo from './Pages/ViewUserPublicInfo'
import AdminRoute from './Components/AdminRoute'

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
					<Route
						index
						path='/user/view/:userId'
						element={<ViewUserPublicInfo />}
					/>
					<Route
						path='/admin'
						element={
							<AdminRoute>
								<HomePage />
							</AdminRoute>
						}
					/>
					<Route element={<Layout />}>
						<Route
							index
							path='/'
							element={<OverViewPage />}
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
							path='/dashboard/schedule'
							element={<Schedule />}
						/>

						<Route
							index
							path='/dashboard/classes/:id'
							element={<ClassPage />}
						/>
						<Route
							path='/dashboard/classes/:id/meetings'
							element={<MeetingPage />}
						/>
						<Route
							path='/dashboard/classes/:id/meetings/newMeeting'
							element={<NewMeeting />}
						/>
					</Route>

					{/* Staff routes */}
					<Route element={<StaffLayout />}>
						<Route path='/staff'>
							<Route
								index
								element={<StaffDashboardPage />}
							/>
							<Route path='classes'>
								<Route
									path='new'
									element={<AddClass />}
								/>
							</Route>
							<Route
								path='reallocate'
								element={<ReallocatePage />}
							/>
						</Route>
					</Route>

					{/* Catch-all route for 404 */}
					<Route
						path='*'
						element={<NotFound />}
					/>
				</Routes>
				<Toaster />
			</Router>
		</GlobalStateProvider>
	)
}

export default App
