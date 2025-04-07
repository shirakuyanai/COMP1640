import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { getAllClasses, getDataForCreatingClass } from '@/actions/getData'
import { FaUserGraduate, FaChalkboardTeacher, FaCalendarCheck, FaArrowUp, FaArrowDown, FaEdit, FaSave, FaTimes } from 'react-icons/fa'
import { FaUsers, FaPersonChalkboard } from 'react-icons/fa6'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import StudentCard from './StudentCard'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/Components/ui/use-toast'
import { Input } from '@/Components/ui/input'

type DetailViewType = 'overview' | 'classes' | 'students' | 'tutors' | 'performance' | null;

type TutorWorkload = {
	name: string;
	classes: number;
	students: number;
}

type ActivityType = 'create' | 'update' | 'reallocate';

type Activity = {
	id: string;
	className: string;
	tutorUsername: string;
	date: string;
	type: ActivityType;
};

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#6366F1', '#3B82F6'];

function StaffDashboardPage() {
	const navigate = useNavigate()
	const { currentUser, authToken } = useGlobalState()
	const [selectedView, setSelectedView] = useState<DetailViewType>('overview')
	const [studentsWithoutClass, setStudentsWithoutClass] = useState<any[]>([])
	const [editingClassId, setEditingClassId] = useState<string | null>(null)
	const [editingClassName, setEditingClassName] = useState<string>('')
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
		recentActivities: Activity[];
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
					const unassignedStudents = studentsAndTutorsData.students.filter(
						(student: any) => !assignedStudentIds.has(student.studentId)
					)
					setStudentsWithoutClass(unassignedStudents)

					// Calculate tutor workload
					const tutorWorkload = studentsAndTutorsData.tutors.map((tutor: any) => {
						const tutorClasses = classesData.filter((c: any) => c.tutorId === tutor.tutorId);
						// Get unique students for this tutor by collecting studentIds then getting the unique set size
						const uniqueStudentIds = new Set(tutorClasses.map((c: any) => c.studentId));
						
						return {
							name: tutor.username,
							classes: tutorClasses.length,
							students: uniqueStudentIds.size
						};
					});

					setDashboardData({
						totalClasses: classesData.length,
						activeClasses: classesData.filter((c: any) => c.status === 'active').length,
						studentsWithoutClass: unassignedStudents.length,
						totalStudents: studentsAndTutorsData.students.length,
						totalTutors: studentsAndTutorsData.tutors.length,
						recentActivities: classesData.slice(0, 5).map((c: any) => ({
							id: c.id,
							className: c.className,
							tutorUsername: c.tutorUsername,
							date: c.startDate,
							type: new Date(c.startDate).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 
								? 'create' 
								: (c.className.includes('reallocate') || c.className.includes('reassign')) 
									? 'reallocate' 
									: 'update'
						})),
						classTrends: {
							total: classesData.length,
							active: classesData.filter((c: any) => c.status === 'active').length,
							inactive: classesData.filter((c: any) => c.status !== 'active').length
						},
						studentTrends: {
							assigned: studentsAndTutorsData.students.length - unassignedStudents.length,
							unassigned: unassignedStudents.length
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

	const handleDeleteClass = async (classId: string) => {
		try {
			const response = await fetch(`${import.meta.env.VITE_HOST}/deleteClass`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authentication: `Bearer ${authToken}`,
					API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
				},
				body: JSON.stringify({
					classId,
				}),
			});

			if (response.ok) {
				toast({
					title: "Success",
					description: "Class deleted successfully",
				});
				
				// Update local state to reflect the deletion
				const updatedClasses = rawData.classes.filter((c: any) => c.id !== classId);
				setRawData({
					...rawData,
					classes: updatedClasses
				});
				
				// Recalculate assigned students
				const assignedStudentIds = new Set(updatedClasses.map((c: any) => c.studentId));
				const unassignedStudents = rawData.students.filter(
					(student: any) => !assignedStudentIds.has(student.studentId)
				);
				
				// Recalculate tutor workload
				const tutorWorkload = rawData.tutors.map((tutor: any) => {
					const tutorClasses = updatedClasses.filter((c: any) => c.tutorId === tutor.tutorId);
					const uniqueStudentIds = new Set(tutorClasses.map((c: any) => c.studentId));
					
					return {
						name: tutor.username,
						classes: tutorClasses.length,
						students: uniqueStudentIds.size
					};
				});
				
				// Update dashboard data
				setDashboardData({
					...dashboardData,
					totalClasses: updatedClasses.length,
					activeClasses: updatedClasses.filter((c: any) => c.status === 'active').length,
					studentsWithoutClass: unassignedStudents.length,
					recentActivities: updatedClasses.slice(0, 5).map((c: any) => ({
						id: c.id,
						className: c.className,
						tutorUsername: c.tutorUsername,
						date: c.startDate,
						type: new Date(c.startDate).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 
							? 'create' 
							: (c.className.includes('reallocate') || c.className.includes('reassign')) 
								? 'reallocate' 
								: 'update'
					})),
					classTrends: {
						total: updatedClasses.length,
						active: updatedClasses.filter((c: any) => c.status === 'active').length,
						inactive: updatedClasses.filter((c: any) => c.status !== 'active').length
					},
					studentTrends: {
						assigned: rawData.students.length - unassignedStudents.length,
						unassigned: unassignedStudents.length
					},
					tutorWorkload
				});
				
				setStudentsWithoutClass(unassignedStudents);
			} else {
				const error = await response.json();
				throw new Error(error.message || 'Failed to delete class');
			}
		} catch (error) {
			console.error('Delete class error:', error);
			
			// Try to parse the error response
			let errorMessage = "Failed to delete class";
			if (error instanceof Error) {
				errorMessage = error.message;
			}
			
			toast({
				title: "Error",
				description: errorMessage,
				variant: "destructive",
			});
		}
	};

	const handleEditClass = (classItem: any, e?: React.MouseEvent) => {
		if (e) {
			e.stopPropagation();
		}
		setEditingClassId(classItem.id);
		setEditingClassName(classItem.className);
	};
	
	const handleCancelEdit = (e?: React.MouseEvent) => {
		if (e) {
			e.stopPropagation();
		}
		setEditingClassId(null);
		setEditingClassName('');
	};
	
	const handleSaveClassName = async (classId: string) => {
		try {
			const response = await fetch(`${import.meta.env.VITE_HOST}/updateClass`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authentication: `Bearer ${authToken}`,
					API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
				},
				body: JSON.stringify({
					classId,
					className: editingClassName,
				}),
			});

			if (response.ok) {
				toast({
					title: "Success",
					description: "Class name updated successfully",
				});
				
				// Update local state with new class name
				const updatedClasses = rawData.classes.map((c: any) => 
					c.id === classId ? { ...c, className: editingClassName } : c
				);
				
				setRawData({
					...rawData,
					classes: updatedClasses
				});
				
				// Reset editing state
				setEditingClassId(null);
				setEditingClassName('');
			} else {
				const error = await response.json();
				throw new Error(error.message || 'Failed to update class name');
			}
		} catch (error) {
			console.error('Edit class error:', error);
			
			let errorMessage = "Failed to update class name";
			if (error instanceof Error) {
				errorMessage = error.message;
			}
			
			toast({
				title: "Error",
				description: errorMessage,
				variant: "destructive",
			});
		}
	};

	const StatCard = ({ icon, title, value, description, type, trend, color = "purple" }: any) => {
		const colorVariants = {
			purple: "from-purple-500 to-indigo-600 shadow-purple-200",
			blue: "from-blue-500 to-cyan-600 shadow-blue-200",
			green: "from-green-500 to-emerald-600 shadow-green-200",
			yellow: "from-yellow-500 to-amber-600 shadow-yellow-200",
		};

		const bgClass = colorVariants[color as keyof typeof colorVariants] || colorVariants.purple;

		return (
			<Card 
				className={cn(
					"cursor-pointer transition-all duration-300 border-none hover:shadow-xl overflow-hidden",
					selectedView === type ? "ring-2 ring-purple-500 shadow-lg" : ""
				)}
				onClick={() => setSelectedView(type)}
			>
				<div className={`h-2 bg-gradient-to-r ${bgClass}`} />
				<CardContent className="p-6">
					<div className="flex items-center">
						<div className={`bg-gradient-to-r ${bgClass} p-3 rounded-lg text-white`}>
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
					</div>
				</CardContent>
			</Card>
		)
	}

	const DetailView = () => {
		if (!selectedView) return null;

		const renderContent = () => {
			switch (selectedView) {
				case 'overview':
					return (
						<div className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								{/* Classes by Tutor */}
								<Card className="shadow-md hover:shadow-lg transition-shadow">
									<CardHeader className="border-b pb-3">
										<CardTitle className="text-lg font-semibold">Classes by Tutor</CardTitle>
									</CardHeader>
									<CardContent className="pt-4">
										<div className="h-[300px]">
											<ResponsiveContainer width="100%" height="100%">
												<BarChart data={dashboardData.tutorWorkload}>
													<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
													<XAxis dataKey="name" />
													<YAxis />
													<Tooltip />
													<Bar dataKey="classes" fill="#8B5CF6" name="Classes" radius={[4, 4, 0, 0]} />
												</BarChart>
											</ResponsiveContainer>
										</div>
									</CardContent>
								</Card>

								{/* Monthly Class Creation Trends */}
								<Card className="shadow-md hover:shadow-lg transition-shadow">
									<CardHeader className="border-b pb-3">
										<CardTitle className="text-lg font-semibold">Monthly Class Creation</CardTitle>
									</CardHeader>
									<CardContent className="pt-4">
										<div className="h-[300px]">
											<ResponsiveContainer width="100%" height="100%">
												<LineChart data={
													Object.entries(
														rawData.classes.reduce((acc: any, curr: any) => {
															const month = new Date(curr.startDate).toLocaleString('default', { month: 'short', year: '2-digit' });
															acc[month] = (acc[month] || 0) + 1;
															return acc;
														}, {})
													).map(([month, count]) => ({
														month,
														count
													})).sort((a, b) => new Date(a.month) - new Date(b.month))
												}>
													<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
													<XAxis dataKey="month" />
													<YAxis />
													<Tooltip />
													<Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} name="New Classes" />
												</LineChart>
											</ResponsiveContainer>
										</div>
									</CardContent>
								</Card>

								{/* Student Assignment Status */}
								<Card className="shadow-md hover:shadow-lg transition-shadow">
									<CardHeader className="border-b pb-3">
										<CardTitle className="text-lg font-semibold">Student Assignment Status</CardTitle>
									</CardHeader>
									<CardContent className="pt-4">
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
														label={({ name, value }) => `${name}: ${value}`}
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

							{/* Recent Activities */}
							<Card className="shadow-md hover:shadow-lg transition-shadow">
								<CardHeader className="border-b pb-3">
									<CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
								</CardHeader>
								<CardContent className="pt-4">
									<div className="space-y-4">
										{dashboardData.recentActivities.length > 0 ? (
											dashboardData.recentActivities.map((activity: Activity, index: number) => (
												<div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
													<div>
														<div className="flex items-center gap-2">
															<p className="font-medium">{activity.className}</p>
															<span className={`text-xs px-2 py-0.5 rounded-full ${
																activity.type === 'create'
																	? 'bg-green-100 text-green-800' 
																	: activity.type === 'update'
																	? 'bg-blue-100 text-blue-800'
																	: 'bg-purple-100 text-purple-800'
															}`}>
																{activity.type === 'create' ? 'Created' : activity.type === 'update' ? 'Updated' : 'Reallocated'}
															</span>
														</div>
														<p className="text-sm text-gray-500">
															{activity.tutorUsername ? `Tutor: ${activity.tutorUsername}` : 'No tutor assigned'}
														</p>
													</div>
													<div className="text-sm text-gray-500">
														{new Date(activity.date).toLocaleDateString()}
													</div>
												</div>
											))
										) : (
											<div className="text-center py-4 text-gray-500">No recent activities</div>
										)}
									</div>
								</CardContent>
							</Card>
						</div>
					);

				case 'classes':
					return (
						<div className="space-y-6">
							<Card className="shadow-md hover:shadow-lg transition-shadow">
								<CardHeader className="border-b pb-3">
									<CardTitle className="text-lg font-semibold flex justify-between items-center">
										<span>All Classes</span>
										<span className="text-sm font-normal text-gray-500">Total: {rawData.classes.length}</span>
									</CardTitle>
								</CardHeader>
								<CardContent className="pt-4">
									{rawData.classes.length > 0 ? (
										<div className="space-y-4">
											{rawData.classes.map((classItem: any, index: number) => (
												<div key={index} className="p-4 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-all">
													<div className="flex justify-between items-start">
														<div>
															{editingClassId === classItem.id ? (
																<div className="flex items-center gap-2 mb-2">
																	<Input
																		value={editingClassName}
																		onChange={(e) => setEditingClassName(e.target.value)}
																		className="h-8 max-w-[250px]"
																		placeholder="Class name"
																		autoFocus
																		onMouseDown={(e) => e.stopPropagation()}
																	/>
																	<Button 
																		variant="outline" 
																		size="sm"
																		className="h-8 px-2 text-green-600 border-green-200 hover:bg-green-50"
																		onClick={(e) => handleSaveClassName(classItem.id)}
																		onMouseDown={(e) => e.stopPropagation()}
																	>
																		<FaSave className="mr-1 h-3 w-3" />
																		Save
																	</Button>
																	<Button 
																		variant="outline" 
																		size="sm"
																		className="h-8 px-2 text-gray-600 border-gray-200 hover:bg-gray-50"
																		onClick={(e) => handleCancelEdit(e)}
																		onMouseDown={(e) => e.stopPropagation()}
																	>
																		<FaTimes className="mr-1 h-3 w-3" />
																		Cancel
																	</Button>
																</div>
															) : (
																<p className="font-medium text-purple-700 flex items-center gap-1.5">
																	{classItem.className}
																	<Button 
																		variant="ghost" 
																		size="sm"
																		className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
																		onClick={(e) => handleEditClass(classItem, e)}
																		onMouseDown={(e) => e.stopPropagation()}
																	>
																		<FaEdit className="h-3 w-3" />
																	</Button>
																</p>
															)}
															<div className="text-sm text-gray-600 mt-1 space-y-1">
																<p className="flex justify-between">
																	<span>Student:</span> 
																	<span className="font-medium">{classItem.studentUsername}</span>
																</p>
																<p className="flex justify-between">
																	<span>Tutor:</span> 
																	<span className="font-medium">{classItem.tutorUsername}</span>
																</p>
															</div>
														</div>
														<div className="flex gap-2">
															<Button 
																variant="outline" 
																size="sm"
																className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50"
																onClick={(e) => {
																	if (confirm('Are you sure you want to delete this class?')) {
																		handleDeleteClass(classItem.id);
																	}
																}}
															>
																Delete
															</Button>
														</div>
													</div>
												</div>
											))}
										</div>
									) : (
										<div className="text-center py-8 text-gray-500">No classes found</div>
									)}
								</CardContent>
							</Card>
						</div>
					);

				case 'students':
					return (
						<div className="space-y-6">
							<div className="bg-white p-4 rounded-lg shadow-sm">
								<div className="flex justify-between items-center">
									<div>
										<h3 className="text-lg font-semibold">All Students</h3>
										<p className="text-sm text-gray-500">
											Total: {dashboardData.totalStudents} students ({dashboardData.studentsWithoutClass} unassigned)
										</p>
									</div>
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{rawData.students.length > 0 ? (
									rawData.students.map((student: any) => {
										const isAssigned = !studentsWithoutClass.some(
											(s: any) => s.studentId === student.studentId
										)
										return (
											<StudentCard
												key={student.studentId}
												username={student.username}
												userId={student.userId}
												studentId={student.studentId}
												status={isAssigned ? 'Assigned' : 'Unassigned'}
											/>
										)
									})
								) : (
									<div className="col-span-3 text-center py-8 text-gray-500">No students found</div>
								)}
							</div>
						</div>
					);

				case 'tutors':
					return (
						<div className="space-y-6">
							<Card className="shadow-md hover:shadow-lg transition-shadow">
								<CardHeader className="border-b pb-3">
									<CardTitle className="text-lg font-semibold flex justify-between items-center">
										<span>All Tutors</span>
										<span className="text-sm font-normal text-gray-500">Total: {rawData.tutors.length}</span>
									</CardTitle>
								</CardHeader>
								<CardContent className="pt-4">
									{rawData.tutors.length > 0 ? (
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											{rawData.tutors.map((tutor: any, index: number) => (
												<div key={index} className="p-4 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-all">
													<div className="flex items-center space-x-4">
														<div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white h-10 w-10 rounded-full flex items-center justify-center">
															{tutor.username.charAt(0).toUpperCase()}
														</div>
														<div>
															<p className="font-medium">{tutor.username}</p>
															<p className="text-xs text-gray-500">ID: {tutor.tutorId}</p>
														</div>
													</div>
													<div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
														<div className="text-center p-2 rounded bg-purple-50">
															<p className="text-xs text-gray-600">Classes</p>
															<p className="font-semibold text-purple-700">{dashboardData.tutorWorkload[index]?.classes || 0}</p>
														</div>
														<div className="text-center p-2 rounded bg-blue-50">
															<p className="text-xs text-gray-600">Students</p>
															<p className="font-semibold text-blue-700">{dashboardData.tutorWorkload[index]?.students || 0}</p>
														</div>
													</div>
												</div>
											))}
										</div>
									) : (
										<div className="text-center py-8 text-gray-500">No tutors found</div>
									)}
								</CardContent>
							</Card>
						</div>
					);

				case 'performance':
					return (
						<div className="space-y-6">
							<Card className="shadow-md hover:shadow-lg transition-shadow">
								<CardHeader className="border-b pb-3">
									<CardTitle className="text-lg font-semibold">Performance Metrics</CardTitle>
								</CardHeader>
								<CardContent className="pt-4">
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
											<h4 className="font-medium text-green-800">Active Class Rate</h4>
											<p className="text-2xl font-bold text-green-600">
												{((dashboardData.classTrends.active / dashboardData.classTrends.total) * 100).toFixed(1)}%
											</p>
										</div>
										<div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
											<h4 className="font-medium text-blue-800">Student Assignment Rate</h4>
											<p className="text-2xl font-bold text-blue-600">
												{((dashboardData.studentTrends.assigned / dashboardData.totalStudents) * 100).toFixed(1)}%
											</p>
										</div>
										<div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-100">
											<h4 className="font-medium text-purple-800">Average Tutor Workload</h4>
											<p className="text-2xl font-bold text-purple-600">
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
			<Card className="shadow-md">
				<CardHeader className="border-b pb-3">
					<CardTitle className="text-lg font-semibold flex justify-between items-center">
						<span>{selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} View</span>
						<Button 
							variant="outline" 
							size="sm"
							className="flex items-center gap-2 hover:bg-gray-50"
							onClick={() => setSelectedView('overview')}
						>
							Back to Overview
						</Button>
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-4">
					{renderContent()}
				</CardContent>
			</Card>
		);
	};

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[70vh]">
				<Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-2" />
				<p className="text-gray-600">Loading dashboard data...</p>
			</div>
		)
	}

	return (
		<div className="p-6 space-y-8 bg-gray-50 min-h-screen">
			{/* Header */}
			<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
				<h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
					Welcome, {currentUser?.username}!
				</h1>
				<p className="text-gray-600 mt-1">Here's your teaching management overview</p>
			</div>

			{/* Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<StatCard
					icon={<FaChalkboardTeacher className="h-6 w-6" />}
					title="Total Classes"
					value={dashboardData.totalClasses}
					description="Classes managed"
					type="classes"
					color="purple"
				/>
				<StatCard
					icon={<FaUserGraduate className="h-6 w-6" />}
					title="Total Students"
					value={dashboardData.totalStudents}
					description="Enrolled students"
					type="students"
					color="blue"
				/>
				<StatCard
					icon={<FaUsers className="h-6 w-6" />}
					title="Unassigned"
					value={dashboardData.studentsWithoutClass}
					description="Students without class"
					type="students"
					color="yellow"
				/>
				<StatCard
					icon={<FaPersonChalkboard className="h-6 w-6" />}
					title="Total Tutors"
					value={dashboardData.totalTutors}
					description="Available tutors"
					type="tutors"
					color="green"
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
