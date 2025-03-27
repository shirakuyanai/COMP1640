import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { getAllClasses, getDataForCreatingClass } from '@/actions/getData'
import { FaUserGraduate, FaChalkboardTeacher, FaCalendarCheck, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import { FaUsers, FaPersonChalkboard } from 'react-icons/fa6'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

type DetailViewType = 'overview' | 'classes' | 'students' | 'tutors' | 'performance' | null;

type TutorWorkload = {
	name: string;
	classes: number;
	students: number;
}

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#6366F1', '#3B82F6'];

function StaffDashboardPage() {
	const navigate = useNavigate()
	const { currentUser, authToken } = useGlobalState()
	const [selectedView, setSelectedView] = useState<DetailViewType>('overview')
	const [rawData, setRawData] = useState<{
		classes: any[];
		students: any[];
		tutors: any[];
	}>({
		classes: [],
		students: [],
		tutors: []
	})
	const [dashboardData, setDashboardData] = useState<{
		totalClasses: number;
		activeClasses: number;
		studentsWithoutClass: number;
		totalStudents: number;
		totalTutors: number;
		recentActivities: any[];
		classTrends: {
			total: number;
			active: number;
			inactive: number;
		};
		studentTrends: {
			assigned: number;
			unassigned: number;
		};
		tutorWorkload: TutorWorkload[];
	}>({
		totalClasses: 0,
		activeClasses: 0,
		studentsWithoutClass: 0,
		totalStudents: 0,
		totalTutors: 0,
		recentActivities: [],
		classTrends: {
			total: 0,
			active: 0,
			inactive: 0
		},
		studentTrends: {
			assigned: 0,
			unassigned: 0
		},
		tutorWorkload: []
	})
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				setIsLoading(true)
				const [classesData, studentsAndTutorsData] = await Promise.all([
					getAllClasses(authToken),
					getDataForCreatingClass(authToken)
				])

				if (classesData && studentsAndTutorsData && studentsAndTutorsData.students && studentsAndTutorsData.tutors) {
					setRawData({
						classes: classesData,
						students: studentsAndTutorsData.students,
						tutors: studentsAndTutorsData.tutors
					})

					const assignedStudentIds = new Set(classesData.map((c: any) => c.studentId))
					const studentsWithoutClass = studentsAndTutorsData.students.filter(
						(student: any) => !assignedStudentIds.has(student.studentId)
					)

					// Calculate tutor workload
					const tutorWorkload = studentsAndTutorsData.tutors.map((tutor: any) => ({
						name: tutor.username,
						classes: classesData.filter((c: any) => c.tutorId === tutor.tutorId).length,
						students: classesData.filter((c: any) => c.tutorId === tutor.tutorId).length
					}))

					setDashboardData({
						totalClasses: classesData.length,
						activeClasses: classesData.filter((c: any) => c.status === 'active').length,
						studentsWithoutClass: studentsWithoutClass.length,
						totalStudents: studentsAndTutorsData.students.length,
						totalTutors: studentsAndTutorsData.tutors.length,
						recentActivities: classesData.slice(0, 5),
						classTrends: {
							total: classesData.length,
							active: classesData.filter((c: any) => c.status === 'active').length,
							inactive: classesData.filter((c: any) => c.status !== 'active').length
						},
						studentTrends: {
							assigned: studentsAndTutorsData.students.length - studentsWithoutClass.length,
							unassigned: studentsWithoutClass.length
						},
						tutorWorkload
					})
				}
			} catch (error) {
				console.error('Error fetching dashboard data:', error)
			} finally {
				setIsLoading(false)
			}
		}

		if (authToken) {
			fetchDashboardData()
		}
	}, [authToken])

	const StatCard = ({ icon, title, value, description, type, trend }: any) => (
		<Card 
			className={`cursor-pointer transition-all ${selectedView === type ? 'ring-2 ring-purple-500' : 'hover:shadow-lg'}`}
			onClick={() => setSelectedView(type)}
		>
			<CardContent className="flex items-center p-6">
				<div className="bg-purple-100 p-3 rounded-lg">
					{icon}
				</div>
				<div className="ml-4">
					<p className="text-sm font-medium text-gray-500">{title}</p>
					<div className="flex items-center gap-2">
						<h4 className="text-2xl font-bold">{value}</h4>
						{trend && (
							<span className={`flex items-center text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
								{trend > 0 ? <FaArrowUp /> : <FaArrowDown />}
								{Math.abs(trend)}%
							</span>
						)}
					</div>
					<p className="text-sm text-gray-500">{description}</p>
				</div>
			</CardContent>
		</Card>
	)

	const DetailView = () => {
		if (!selectedView) return null;

		const renderContent = () => {
			switch (selectedView) {
				case 'overview':
					return (
						<div className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Class Status Overview */}
								<Card>
									<CardHeader>
										<CardTitle>Class Status Overview</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="h-[300px]">
											<ResponsiveContainer width="100%" height="100%">
												<PieChart>
													<Pie
														data={[
															{ name: 'Active', value: dashboardData.classTrends.active },
															{ name: 'Inactive', value: dashboardData.classTrends.inactive }
														]}
														cx="50%"
														cy="50%"
														labelLine={false}
														outerRadius={80}
														fill="#8884d8"
														dataKey="value"
													>
														{[
															{ name: 'Active', value: dashboardData.classTrends.active },
															{ name: 'Inactive', value: dashboardData.classTrends.inactive }
														].map((entry, index) => (
															<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
														))}
													</Pie>
													<Tooltip />
												</PieChart>
											</ResponsiveContainer>
										</div>
									</CardContent>
								</Card>

								{/* Student Assignment Overview */}
								<Card>
									<CardHeader>
										<CardTitle>Student Assignment Overview</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="h-[300px]">
											<ResponsiveContainer width="100%" height="100%">
												<PieChart>
													<Pie
														data={[
															{ name: 'Assigned', value: dashboardData.studentTrends.assigned },
															{ name: 'Unassigned', value: dashboardData.studentTrends.unassigned }
														]}
														cx="50%"
														cy="50%"
														labelLine={false}
														outerRadius={80}
														fill="#8884d8"
														dataKey="value"
													>
														{[
															{ name: 'Assigned', value: dashboardData.studentTrends.assigned },
															{ name: 'Unassigned', value: dashboardData.studentTrends.unassigned }
														].map((entry, index) => (
															<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
														))}
													</Pie>
													<Tooltip />
												</PieChart>
											</ResponsiveContainer>
										</div>
									</CardContent>
								</Card>
							</div>

							{/* Tutor Workload Overview */}
							<Card>
								<CardHeader>
									<CardTitle>Tutor Workload Overview</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="h-[300px]">
										<ResponsiveContainer width="100%" height="100%">
											<BarChart data={dashboardData.tutorWorkload}>
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis dataKey="name" />
												<YAxis />
												<Tooltip />
												<Bar dataKey="classes" fill="#8B5CF6" name="Classes" />
												<Bar dataKey="students" fill="#10B981" name="Students" />
											</BarChart>
										</ResponsiveContainer>
									</div>
								</CardContent>
							</Card>

							{/* Recent Activities */}
							<Card>
								<CardHeader>
									<CardTitle>Recent Activities</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{dashboardData.recentActivities.map((activity: any, index: number) => (
											<div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
												<div>
													<p className="font-medium">{activity.className}</p>
													<p className="text-sm text-gray-500">
														{activity.tutorUsername ? `Tutor: ${activity.tutorUsername}` : 'No tutor assigned'}
													</p>
												</div>
												<div className="text-sm text-gray-500">
													{new Date(activity.startDate).toLocaleDateString()}
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</div>
					);

				case 'classes':
					return (
						<div className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<Card>
									<CardHeader>
										<CardTitle>Class Status Distribution</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="h-[300px]">
											<ResponsiveContainer width="100%" height="100%">
												<PieChart>
													<Pie
														data={[
															{ name: 'Active', value: dashboardData.classTrends.active },
															{ name: 'Inactive', value: dashboardData.classTrends.inactive }
														]}
														cx="50%"
														cy="50%"
														labelLine={false}
														outerRadius={80}
														fill="#8884d8"
														dataKey="value"
													>
														{[
															{ name: 'Active', value: dashboardData.classTrends.active },
															{ name: 'Inactive', value: dashboardData.classTrends.inactive }
														].map((entry, index) => (
															<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
														))}
													</Pie>
													<Tooltip />
												</PieChart>
											</ResponsiveContainer>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Class Trends</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="h-[300px]">
											<ResponsiveContainer width="100%" height="100%">
												<LineChart data={[
													{ name: 'Total', value: dashboardData.classTrends.total },
													{ name: 'Active', value: dashboardData.classTrends.active },
													{ name: 'Inactive', value: dashboardData.classTrends.inactive }
												]}>
													<CartesianGrid strokeDasharray="3 3" />
													<XAxis dataKey="name" />
													<YAxis />
													<Tooltip />
													<Line type="monotone" dataKey="value" stroke="#8B5CF6" />
												</LineChart>
											</ResponsiveContainer>
										</div>
									</CardContent>
								</Card>
							</div>

							<Card>
								<CardHeader>
									<CardTitle>All Classes</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{rawData.classes.map((classItem: any, index: number) => (
											<div key={index} className="p-3 bg-gray-50 rounded-lg">
												<p className="font-medium">{classItem.className}</p>
												<div className="text-sm text-gray-500">
													<p>Student: {classItem.studentUsername}</p>
													<p>Tutor: {classItem.tutorUsername}</p>
													<p>Status: <span className={`font-medium ${classItem.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>{classItem.status}</span></p>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</div>
					);

				case 'students':
					return (
						<div className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<Card>
									<CardHeader>
										<CardTitle>Student Assignment Status</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="h-[300px]">
											<ResponsiveContainer width="100%" height="100%">
												<PieChart>
													<Pie
														data={[
															{ name: 'Assigned', value: dashboardData.studentTrends.assigned },
															{ name: 'Unassigned', value: dashboardData.studentTrends.unassigned }
														]}
														cx="50%"
														cy="50%"
														labelLine={false}
														outerRadius={80}
														fill="#8884d8"
														dataKey="value"
													>
														{[
															{ name: 'Assigned', value: dashboardData.studentTrends.assigned },
															{ name: 'Unassigned', value: dashboardData.studentTrends.unassigned }
														].map((entry, index) => (
															<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
														))}
													</Pie>
													<Tooltip />
												</PieChart>
											</ResponsiveContainer>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Student Assignment Trends</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="h-[300px]">
											<ResponsiveContainer width="100%" height="100%">
												<LineChart data={[
													{ name: 'Total', value: dashboardData.totalStudents },
													{ name: 'Assigned', value: dashboardData.studentTrends.assigned },
													{ name: 'Unassigned', value: dashboardData.studentTrends.unassigned }
												]}>
													<CartesianGrid strokeDasharray="3 3" />
													<XAxis dataKey="name" />
													<YAxis />
													<Tooltip />
													<Line type="monotone" dataKey="value" stroke="#8B5CF6" />
												</LineChart>
											</ResponsiveContainer>
										</div>
									</CardContent>
								</Card>
							</div>

							<Card>
								<CardHeader>
									<CardTitle>All Students</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{rawData.students.map((student: any, index: number) => (
											<div key={index} className="p-3 bg-gray-50 rounded-lg">
												<p className="font-medium">{student.username}</p>
												<p className="text-sm text-gray-500">ID: {student.studentId}</p>
												<p className="text-sm text-gray-500">
													Status: <span className={`font-medium ${rawData.classes.some((c: any) => c.studentId === student.studentId) ? 'text-green-500' : 'text-red-500'}`}>
														{rawData.classes.some((c: any) => c.studentId === student.studentId) ? 'Assigned' : 'Unassigned'}
													</span>
												</p>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</div>
					);

				case 'tutors':
					return (
						<div className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Tutor Workload Distribution</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="h-[300px]">
										<ResponsiveContainer width="100%" height="100%">
											<BarChart data={dashboardData.tutorWorkload}>
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis dataKey="name" />
												<YAxis />
												<Tooltip />
												<Bar dataKey="classes" fill="#8B5CF6" name="Classes" />
												<Bar dataKey="students" fill="#10B981" name="Students" />
											</BarChart>
										</ResponsiveContainer>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>All Tutors</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{rawData.tutors.map((tutor: any, index: number) => (
											<div key={index} className="p-3 bg-gray-50 rounded-lg">
												<p className="font-medium">{tutor.username}</p>
												<p className="text-sm text-gray-500">ID: {tutor.tutorId}</p>
												<p className="text-sm text-gray-500">
													Classes: {dashboardData.tutorWorkload[index]?.classes || 0}
												</p>
												<p className="text-sm text-gray-500">
													Students: {dashboardData.tutorWorkload[index]?.students || 0}
												</p>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</div>
					);

				case 'performance':
					return (
						<div className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<Card>
									<CardHeader>
										<CardTitle>Class Performance Overview</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="h-[300px]">
											<ResponsiveContainer width="100%" height="100%">
												<BarChart data={rawData.classes.map((c: any) => ({
													name: c.className,
													status: c.status === 'active' ? 1 : 0
												}))}>
													<CartesianGrid strokeDasharray="3 3" />
													<XAxis dataKey="name" />
													<YAxis />
													<Tooltip />
													<Bar dataKey="status" fill="#8B5CF6" name="Status" />
												</BarChart>
											</ResponsiveContainer>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Tutor Performance Overview</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="h-[300px]">
											<ResponsiveContainer width="100%" height="100%">
												<BarChart data={dashboardData.tutorWorkload}>
													<CartesianGrid strokeDasharray="3 3" />
													<XAxis dataKey="name" />
													<YAxis />
													<Tooltip />
													<Bar dataKey="classes" fill="#8B5CF6" name="Classes" />
													<Bar dataKey="students" fill="#10B981" name="Students" />
												</BarChart>
											</ResponsiveContainer>
										</div>
									</CardContent>
								</Card>
							</div>

							<Card>
								<CardHeader>
									<CardTitle>Performance Metrics</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div className="p-4 bg-gray-50 rounded-lg">
											<h4 className="font-medium">Active Class Rate</h4>
											<p className="text-2xl font-bold text-green-500">
												{((dashboardData.classTrends.active / dashboardData.classTrends.total) * 100).toFixed(1)}%
											</p>
										</div>
										<div className="p-4 bg-gray-50 rounded-lg">
											<h4 className="font-medium">Student Assignment Rate</h4>
											<p className="text-2xl font-bold text-blue-500">
												{((dashboardData.studentTrends.assigned / dashboardData.totalStudents) * 100).toFixed(1)}%
											</p>
										</div>
										<div className="p-4 bg-gray-50 rounded-lg">
											<h4 className="font-medium">Average Tutor Workload</h4>
											<p className="text-2xl font-bold text-purple-500">
												{(dashboardData.tutorWorkload.reduce((acc: number, curr: any) => acc + curr.classes, 0) / dashboardData.totalTutors).toFixed(1)}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					);

				default:
					return null;
			}
		};

		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex justify-between items-center">
						<span>{selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} View</span>
						<Button 
							variant="ghost" 
							size="sm"
							onClick={() => setSelectedView('overview')}
						>
							Back to Overview
						</Button>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{renderContent()}
				</CardContent>
			</Card>
		);
	};

	if (isLoading) {
		return <div className="p-8">Loading dashboard data...</div>
	}

	return (
		<div className="p-8 space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold">Welcome, {currentUser?.username}!</h1>
				<p className="text-gray-500">Here's your teaching management overview</p>
			</div>

			{/* Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
				<StatCard
					icon={<FaChalkboardTeacher className="text-purple-600 h-6 w-6" />}
					title="Total Classes"
					value={dashboardData.totalClasses}
					description="Classes managed"
					type="classes"
				/>
				<StatCard
					icon={<FaCalendarCheck className="text-green-600 h-6 w-6" />}
					title="Active Classes"
					value={dashboardData.activeClasses}
					description="Currently running"
					type="classes"
				/>
				<StatCard
					icon={<FaUserGraduate className="text-yellow-600 h-6 w-6" />}
					title="Total Students"
					value={dashboardData.totalStudents}
					description="Enrolled students"
					type="students"
				/>
				<StatCard
					icon={<FaUsers className="text-blue-600 h-6 w-6" />}
					title="Unassigned"
					value={dashboardData.studentsWithoutClass}
					description="Students without class"
					type="students"
				/>
				<StatCard
					icon={<FaPersonChalkboard className="text-indigo-600 h-6 w-6" />}
					title="Total Tutors"
					value={dashboardData.totalTutors}
					description="Available tutors"
					type="tutors"
				/>
			</div>

			{/* Detail View */}
			<div className="grid grid-cols-1 gap-6">
				<DetailView />
			</div>
		</div>
	)
}

export default StaffDashboardPage
