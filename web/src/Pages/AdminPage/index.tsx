import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { getAllClasses, getClassDetailForSysAdmin } from '@/actions/getData'
import { LogoutAPI } from '@/actions/postData'
import { 
	Card, 
	CardContent, 
	CardHeader,
	CardTitle,
} from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import { 
	FaCalendarAlt, 
	FaChalkboardTeacher, 
	FaUserGraduate, 
	FaClock, 
	FaComments, 
	FaRegFileAlt, 
	FaSearch,
	FaListAlt,
	FaSignOutAlt
} from 'react-icons/fa'

interface ClassBasicInfo {
	id: string;
	className: string;
	studentId?: string;
	tutorId?: string;
	startDate?: string;
	endDate?: string;
	studentUsername?: string;
	tutorUsername?: string;
}

interface ClassDetailsType {
	className?: string;
	student?: string;
	tutor?: string;
	startDate?: string | null;
	endDate?: string | null;
	description?: string | null;
	meetings?: number;
	posts?: number;
	messages?: number;
}

function HomePage() {
	const { currentUser, authToken, setAuthToken, setCurrentUser } = useGlobalState()
	const navigate = useNavigate()
	const { classId } = useParams()
	const [classes, setClasses] = useState<ClassBasicInfo[]>([])
	const [classDetails, setClassDetails] = useState<ClassDetailsType | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedClassId, setSelectedClassId] = useState<string | null>(null)

	const handleLogout = async () => {
		const response = await LogoutAPI({ setAuthToken, setCurrentUser })
		if (!response.error) {
			navigate('/login')
		}
	}

	// Fetch all classes
	useEffect(() => {
		const fetchClasses = async () => {
			if (!authToken) {
				setLoading(false)
				return
			}

			try {
				const response = await getAllClasses(authToken)
				console.log("API Response:", response); // Debug log
				console.log("API Response type:", typeof response);
				
				// Handle different response formats
				if (response && Array.isArray(response)) {
					// If response is an array directly
					console.log("Response is an array");
					setClasses(response);
				} else if (response && response.item && Array.isArray(response.item)) {
					// If response has an item array property
					console.log("Response has item array property");
					setClasses(response.item);
				} else if (response && typeof response === 'object') {
					// If response is an object with a status property
					console.log("Response is an object, checking for data");
					
					if (response.status === 200 && response.item) {
						console.log("Response has status 200 and item property");
						
						// Check if item is an array
						if (Array.isArray(response.item)) {
							console.log("Response item is an array");
							setClasses(response.item);
						} else {
							console.log("Response item is not an array", response.item);
							// Try to convert to array if it's an object
							const classArray = [response.item].filter(Boolean);
							setClasses(classArray);
						}
					} else {
						console.log("Response status not 200 or no item property", response);
						setError(response.error || "Failed to fetch classes");
					}
				} else if (response && response.error) {
					setError(response.error);
				} else {
					console.error("Unexpected response format:", response);
					setError("Received unexpected data format from server");
				}
			} catch (err: any) {
				console.error('Error fetching classes:', err)
				// If there's a token error, we might want to redirect to login
				if (err.message && typeof err.message === 'string' && err.message.includes('jwt')) {
					setError('Authentication error. Please log in again.')
				} else {
					setError('Failed to load classes. Please try again.')
				}
			} finally {
				setLoading(false)
			}
		}

		fetchClasses()
	}, [authToken])

	// Fetch class details when a class is selected
	useEffect(() => {
		const fetchClassDetails = async () => {
			if (!authToken || !currentUser || !selectedClassId) {
				return
			}

			setLoading(true)
			try {
				const response = await getClassDetailForSysAdmin({
					token: authToken,
					userId: currentUser.userId,
					classId: selectedClassId
				})
				
				console.log("Class details response:", response); // Debug log
				
				// Check if response is already the class details object
				if (response && typeof response === 'object' && 'student' in response) {
					console.log("Direct class details received:", response);
					setClassDetails(response);
					setError(null);
				}
				// Check if response has status and item properties
				else if (response && response.status === 200) {
					console.log("Class details item:", response.item);
					setClassDetails(response.item)
					setError(null)
				} else {
					console.error("Failed to fetch class details:", response);
					setError(response?.error || 'Failed to fetch class details')
					setClassDetails(null)
				}
			} catch (err: any) {
				console.error('Error fetching class details:', err);
				setError('An error occurred while fetching class details')
				setClassDetails(null)
			} finally {
				setLoading(false)
			}
		}

		fetchClassDetails()
	}, [authToken, currentUser, selectedClassId])

	// Filter classes based on search term
	const filteredClasses = classes.filter(c => 
		(c.className || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
		(c.studentUsername || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
		(c.tutorUsername || '').toLowerCase().includes(searchTerm.toLowerCase())
	)

	// Debug logs
	useEffect(() => {
		console.log("Classes state:", classes);
		console.log("Filtered classes:", filteredClasses);
	}, [classes, filteredClasses]);

	if (!authToken) {
		return (
			<div className="flex items-center justify-center min-h-[80vh]">
				<div className="text-center p-8 max-w-md">
					<h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
					<p className="text-gray-600 mb-6">Please log in to view admin dashboard.</p>
					<Button onClick={() => navigate('/login')}>
						Go to Login
					</Button>
				</div>
			</div>
		)
	}

	if (error && error.includes('Authentication')) {
		return (
			<div className="flex items-center justify-center min-h-[80vh]">
				<div className="text-center p-8 max-w-md">
					<h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Error</h2>
					<p className="text-gray-600 mb-6">{error}</p>
					<Button onClick={() => navigate('/login')}>
						Login Again
					</Button>
				</div>
			</div>
		)
	}

	if (loading && !classDetails && classes.length === 0) {
		return (
			<div className="flex items-center justify-center min-h-[80vh]">
				<div className="w-12 h-12 border-4 border-t-indigo-500 border-indigo-200 rounded-full animate-spin"></div>
			</div>
		)
	}

	return (
		<div className="container mx-auto p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Admin Dashboard</h1>
				<Button 
					variant="outline" 
					className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 border-red-200"
					onClick={handleLogout}
				>
					<FaSignOutAlt className="h-4 w-4" />
					<span>Logout</span>
				</Button>
			</div>
			
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="md:col-span-1">
					<Card className="border border-gray-200 shadow-sm h-full">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FaListAlt className="h-5 w-5 text-indigo-500" />
								Classes ({filteredClasses.length})
							</CardTitle>
							<div className="relative mt-2">
								<input
									type="text"
									placeholder="Search classes..."
									className="w-full px-4 py-2 border border-gray-300 rounded-md pr-10"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
								<FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
							</div>
						</CardHeader>
						<CardContent className="max-h-[70vh] overflow-y-auto">
							{filteredClasses.length === 0 ? (
								<div className="text-center py-8">
									<FaRegFileAlt className="mx-auto text-gray-300 h-8 w-8 mb-2" />
									<p className="text-gray-500">{classes.length > 0 ? 'No matching classes found' : 'No classes found'}</p>
									{error && !error.includes('Authentication') && (
										<p className="text-sm text-red-500 mt-2">{error}</p>
									)}
								</div>
							) : (
								<ul className="space-y-2">
									{filteredClasses.map((classItem) => (
										<li 
											key={classItem.id} 
											className={`p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors ${
												selectedClassId === classItem.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
											}`}
											onClick={() => setSelectedClassId(classItem.id)}
										>
											<div className="font-medium">{classItem.className || 'Unnamed Class'}</div>
											{(classItem.studentUsername || classItem.tutorUsername) && (
												<div className="text-sm text-gray-600 flex flex-col md:flex-row md:justify-between mt-1">
													{classItem.studentUsername && (
														<span>Student: {classItem.studentUsername}</span>
													)}
													{classItem.tutorUsername && (
														<span>Tutor: {classItem.tutorUsername}</span>
													)}
												</div>
											)}
											{(!classItem.studentUsername && !classItem.tutorUsername) && (
												<div className="text-xs text-gray-500 mt-1">
													ID: {classItem.id}
												</div>
											)}
										</li>
									))}
								</ul>
							)}
						</CardContent>
					</Card>
				</div>
				
				<div className="md:col-span-2">
					{!selectedClassId ? (
						<div className="flex items-center justify-center h-full min-h-[50vh] bg-gray-50 rounded-lg border border-dashed border-gray-300">
							<div className="text-center p-8">
								<FaRegFileAlt className="mx-auto text-gray-400 h-12 w-12 mb-4" />
								<h3 className="text-lg font-medium text-gray-700 mb-2">No Class Selected</h3>
								<p className="text-gray-500 max-w-md">
									Select a class from the list to view detailed information.
								</p>
							</div>
						</div>
					) : loading ? (
						<div className="flex items-center justify-center min-h-[50vh]">
							<div className="w-12 h-12 border-4 border-t-indigo-500 border-indigo-200 rounded-full animate-spin"></div>
						</div>
					) : error && !error.includes('Authentication') ? (
						<div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-300 min-h-[50vh] flex items-center justify-center">
							<div>
								<h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
								<p className="text-gray-600 mb-6">{error}</p>
								<Button 
									variant="outline"
									onClick={() => setSelectedClassId(null)}
								>
									Select Another Class
								</Button>
							</div>
						</div>
					) : !classDetails ? (
						<div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-300 min-h-[50vh] flex items-center justify-center">
							<div>
								<h2 className="text-2xl font-bold text-gray-800 mb-4">Class Not Found</h2>
								<p className="text-gray-600 mb-6">The class details could not be loaded.</p>
								<Button 
									variant="outline"
									onClick={() => setSelectedClassId(null)}
								>
									Select Another Class
								</Button>
							</div>
						</div>
					) : (
						<div className="space-y-6">
							<Card className="border border-gray-200 shadow-sm">
								<CardHeader>
									<CardTitle className="text-xl">{classDetails.className || "Untitled Class"}</CardTitle>
									<p className="text-gray-500">Class Details</p>
								</CardHeader>
							</Card>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<Card className="border border-gray-200 shadow-sm">
									<CardHeader>
										<CardTitle className="flex items-center gap-2 text-lg">
											<FaUserGraduate className="h-5 w-5 text-indigo-500" />
											Student
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="flex items-center gap-3">
											<div className="bg-indigo-100 p-3 rounded-full">
												<FaUserGraduate className="h-6 w-6 text-indigo-600" />
											</div>
											<div>
												<p className="font-medium text-lg">{classDetails.student || "No student assigned"}</p>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card className="border border-gray-200 shadow-sm">
									<CardHeader>
										<CardTitle className="flex items-center gap-2 text-lg">
											<FaChalkboardTeacher className="h-5 w-5 text-indigo-500" />
											Tutor
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="flex items-center gap-3">
											<div className="bg-indigo-100 p-3 rounded-full">
												<FaChalkboardTeacher className="h-6 w-6 text-indigo-600" />
											</div>
											<div>
												<p className="font-medium text-lg">{classDetails.tutor || "No tutor assigned"}</p>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>

							<Card className="border border-gray-200 shadow-sm">
								<CardHeader>
									<CardTitle className="flex items-center gap-2 text-lg">
										<FaCalendarAlt className="h-5 w-5 text-indigo-500" />
										Class Schedule
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="flex items-center gap-3">
											<div className="bg-green-100 p-3 rounded-full">
												<FaCalendarAlt className="h-5 w-5 text-green-600" />
											</div>
											<div>
												<p className="text-sm text-gray-500">Start Date</p>
												<p className="font-medium">
													{classDetails.startDate 
														? new Date(classDetails.startDate).toLocaleDateString() 
														: 'Not specified'}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-3">
											<div className="bg-red-100 p-3 rounded-full">
												<FaCalendarAlt className="h-5 w-5 text-red-600" />
											</div>
											<div>
												<p className="text-sm text-gray-500">End Date</p>
												<p className="font-medium">
													{classDetails.endDate 
														? new Date(classDetails.endDate).toLocaleDateString() 
														: 'Not specified'}
												</p>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							{classDetails.description && (
								<Card className="border border-gray-200 shadow-sm">
									<CardHeader>
										<CardTitle className="flex items-center gap-2 text-lg">
											<FaRegFileAlt className="h-5 w-5 text-indigo-500" />
											Description
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-gray-700">{classDetails.description}</p>
									</CardContent>
								</Card>
							)}

							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<Card className="border border-gray-200 shadow-sm">
									<CardContent className="p-6">
										<div className="flex items-center">
											<div className="bg-blue-100 p-3 rounded-full mr-3">
												<FaClock className="h-5 w-5 text-blue-600" />
											</div>
											<div>
												<p className="font-medium text-2xl">{classDetails.meetings || 0}</p>
												<p className="text-sm text-gray-500">Meetings</p>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card className="border border-gray-200 shadow-sm">
									<CardContent className="p-6">
										<div className="flex items-center">
											<div className="bg-purple-100 p-3 rounded-full mr-3">
												<FaRegFileAlt className="h-5 w-5 text-purple-600" />
											</div>
											<div>
												<p className="font-medium text-2xl">{classDetails.posts || 0}</p>
												<p className="text-sm text-gray-500">Posts</p>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card className="border border-gray-200 shadow-sm">
									<CardContent className="p-6">
										<div className="flex items-center">
											<div className="bg-green-100 p-3 rounded-full mr-3">
												<FaComments className="h-5 w-5 text-green-600" />
											</div>
											<div>
												<p className="font-medium text-2xl">{classDetails.messages || 0}</p>
												<p className="text-sm text-gray-500">Messages</p>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default HomePage
