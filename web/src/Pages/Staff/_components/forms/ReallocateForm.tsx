import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/Components/ui/form'
import { Button } from '@/Components/ui/button'
import { useEffect, useState } from 'react'
import { getDataForCreatingClass } from '@/actions/getData'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { getAllClasses } from '@/actions/getData'
import { reallocateClass } from '@/actions/postData'
import { toast } from '@/Components/ui/use-toast'
import { 
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/Components/ui/select'
import { Loader2 } from 'lucide-react'

// Schema for the reallocation form
const reallocateSchema = z.object({
	classId: z.string().min(1, 'Required'),
	newStudentId: z.string().optional(),
	newTutorId: z.string().optional(),
})

function ReallocateForm() {
	const { authToken } = useGlobalState()
	const [classes, setClasses] = useState([])
	const [selectedClass, setSelectedClass] = useState(null)
	const [studentsAndTutors, setStudentsAndTutors] = useState({
		students: [],
		tutors: [],
	})
	const [isLoading, setIsLoading] = useState(true)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState('')

	const form = useForm<z.infer<typeof reallocateSchema>>({
		resolver: zodResolver(reallocateSchema),
		defaultValues: {
			classId: '',
			newStudentId: 'none',
			newTutorId: 'none',
		},
	})

	// Fetch classes and students/tutors data
	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true)
				setError('')

				const [classesData, studentsAndTutorsData] = await Promise.all([
					getAllClasses(authToken),
					getDataForCreatingClass(authToken)
				])

				if (classesData) {
					setClasses(classesData)
				} else {
					setError('Failed to fetch classes')
				}

				if (studentsAndTutorsData) {
					setStudentsAndTutors(studentsAndTutorsData)
				} else {
					setError('Failed to fetch students and tutors')
				}
			} catch (err) {
				console.error('Error fetching data:', err)
				setError('Failed to load data')
				toast({
					title: "Error",
					description: "Failed to load necessary data. Please try again.",
					variant: "destructive",
				})
			} finally {
				setIsLoading(false)
			}
		}

		if (authToken) {
			fetchData()
		}
	}, [authToken])

	// Update selected class when classId changes
	const onClassChange = (classId: string) => {
		const selected = classes.find((c: any) => c.id === classId)
		setSelectedClass(selected)
		form.setValue('classId', classId)
	}

	const onSubmit = async (values: z.infer<typeof reallocateSchema>) => {
		try {
			setIsSubmitting(true)
			setError('')
			
			// Convert the form values - replace 'none' with empty string for API
			const formData = {
				...values,
				newStudentId: values.newStudentId === 'none' ? '' : values.newStudentId,
				newTutorId: values.newTutorId === 'none' ? '' : values.newTutorId,
			}
			
			if (!formData.newStudentId && !formData.newTutorId) {
				toast({
					title: "Validation Error",
					description: "You must select either a new student or a new tutor (or both).",
					variant: "destructive",
				})
				return
			}
			
			const result = await reallocateClass(authToken, formData)
			
			if (result.success) {
				toast({
					title: "Success",
					description: "Class has been reallocated successfully.",
				})
				// Reset form
				form.reset({
					classId: '',
					newStudentId: 'none',
					newTutorId: 'none',
				})
				setSelectedClass(null)
			} else {
				setError(result.error || 'Failed to reallocate class')
				toast({
					title: "Error",
					description: result.error || "Failed to reallocate class. Please try again.",
					variant: "destructive",
				})
			}
		} catch (error) {
			console.error('Error in form submission:', error)
			const errorMsg = error instanceof Error ? error.message : 'Failed to reallocate class'
			setError(errorMsg)
			toast({
				title: "Error",
				description: errorMsg,
				variant: "destructive",
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-2" />
				<p className="text-gray-600">Loading form data...</p>
			</div>
		)
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='flex gap-6 flex-col'
			>
				<div className='flex gap-6 flex-col'>
					{/* Class Selection */}
					<FormField
						control={form.control}
						name='classId'
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-gray-700 font-medium">Select Class</FormLabel>
								<FormControl>
									<Select
										value={field.value}
										onValueChange={(value) => onClassChange(value)}
									>
										<SelectTrigger className="w-full border border-gray-200 rounded-md h-11">
											<SelectValue placeholder="Select a class" />
										</SelectTrigger>
										<SelectContent>
											{classes.length > 0 ? (
												classes.map((classItem: any) => (
													<SelectItem
														key={classItem.id}
														value={classItem.id}
													>
														{classItem.className}
													</SelectItem>
												))
											) : (
												<SelectItem value="" disabled>
													No classes available
												</SelectItem>
											)}
										</SelectContent>
									</Select>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Show current class details if a class is selected */}
					{selectedClass && (
						<div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100">
							<h3 className="font-semibold mb-3 text-purple-800">Current Class Details</h3>
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-gray-600 text-sm">Class Name:</span>
									<span className="font-medium">{selectedClass.className}</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-gray-600 text-sm">Current Student:</span>
									<span className="font-medium">{selectedClass.studentUsername}</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-gray-600 text-sm">Current Tutor:</span>
									<span className="font-medium">{selectedClass.tutorUsername}</span>
								</div>
								{selectedClass.description && (
									<div className="flex items-center justify-between">
										<span className="text-gray-600 text-sm">Description:</span>
										<span className="font-medium">{selectedClass.description}</span>
									</div>
								)}
								<div className="grid grid-cols-2 gap-4 mt-2 pt-2 border-t border-purple-100">
									{selectedClass.startDate && (
										<div className="flex flex-col">
											<span className="text-gray-600 text-xs">Start Date:</span>
											<span className="font-medium">{new Date(selectedClass.startDate).toLocaleDateString()}</span>
										</div>
									)}
									{selectedClass.endDate && (
										<div className="flex flex-col">
											<span className="text-gray-600 text-xs">End Date:</span>
											<span className="font-medium">{new Date(selectedClass.endDate).toLocaleDateString()}</span>
										</div>
									)}
								</div>
							</div>
						</div>
					)}

					{/* New Student Selection */}
					<FormField
						control={form.control}
						name='newStudentId'
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-gray-700 font-medium">New Student (Optional)</FormLabel>
								<FormControl>
									<Select
										value={field.value || "none"}
										onValueChange={field.onChange}
									>
										<SelectTrigger className="w-full border border-gray-200 rounded-md h-11">
											<SelectValue placeholder="Select new student" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">None (Keep current)</SelectItem>
											{studentsAndTutors.students.length > 0 ? (
												studentsAndTutors.students.map((student: any) => (
													<SelectItem
														key={student.studentId}
														value={student.studentId}
													>
														{student.username}
													</SelectItem>
												))
											) : (
												<SelectItem value="no_students" disabled>
													No students available
												</SelectItem>
											)}
										</SelectContent>
									</Select>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* New Tutor Selection */}
					<FormField
						control={form.control}
						name='newTutorId'
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-gray-700 font-medium">New Tutor (Optional)</FormLabel>
								<FormControl>
									<Select
										value={field.value || "none"}
										onValueChange={field.onChange}
									>
										<SelectTrigger className="w-full border border-gray-200 rounded-md h-11">
											<SelectValue placeholder="Select new tutor" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">None (Keep current)</SelectItem>
											{studentsAndTutors.tutors.length > 0 ? (
												studentsAndTutors.tutors.map((tutor: any) => (
													<SelectItem
														key={tutor.tutorId}
														value={tutor.tutorId}
													>
														{tutor.username}
													</SelectItem>
												))
											) : (
												<SelectItem value="no_tutors" disabled>
													No tutors available
												</SelectItem>
											)}
										</SelectContent>
									</Select>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				{error && (
					<div className="text-red-500 bg-red-50 p-3 rounded-md border border-red-200 text-sm">
						{error}
					</div>
				)}

				<div className='self-end'>
					<Button
						className='bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-md hover:shadow-lg'
						disabled={isSubmitting || !form.formState.isValid || !selectedClass}
					>
						{isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Reallocating...
							</>
						) : 'Reallocate Class'}
					</Button>
				</div>
			</form>
		</Form>
	)
}

export default ReallocateForm 