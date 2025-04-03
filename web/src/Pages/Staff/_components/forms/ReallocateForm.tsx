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

// Schema for the reallocation form
const reallocateSchema = z.object({
	classId: z.string().min(1, 'Please select a class'),
	newStudentId: z.string().min(1, 'Please select a new student'),
	newTutorId: z.string().min(1, 'Please select a new tutor'),
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
	const [error, setError] = useState('')

	const form = useForm<z.infer<typeof reallocateSchema>>({
		resolver: zodResolver(reallocateSchema),
		defaultValues: {
			classId: '',
			newStudentId: '',
			newTutorId: '',
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
					getDataForCreatingClass(authToken),
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
			setError('')
			const result = await reallocateClass(authToken, values)

			if (result.success) {
				alert('Class reallocated successfully')
				const newStudent = studentsAndTutors.students.find(
					(student) => student.studentId === values.newStudentId,
				)
				const newTutor = studentsAndTutors.tutors.find(
					(tutor) => tutor.tutorId === values.newTutorId,
				)

				setSelectedClass((prevClass) =>
					prevClass
						? {
								...prevClass,
								studentUsername: newStudent.username,
								tutorUsername: newTutor.username,
						  }
						: null,
				)
			} else {
				setError(result.error || 'Failed to reallocate class')
			}
		} catch (error) {
			console.error('Error in form submission:', error)
			setError(
				error instanceof Error ? error.message : 'Failed to reallocate class',
			)
		}
	}

	if (isLoading) return <div>Loading...</div>

	if (error) return <div className='text-red-500'>{error}</div>

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='flex gap-6 flex-col'
			>
				<div className='flex gap-6 flex-col'>
					{/* Show current class details if a class is selected */}
					{selectedClass && (
						<div className='bg-gray-50 p-4 rounded-md'>
							<h3 className='font-semibold mb-2'>Current Class Details</h3>
							<p>Class Name: {selectedClass.className}</p>
							<p>Current Student: {selectedClass.studentUsername}</p>
							<p>Current Tutor: {selectedClass.tutorUsername}</p>
							{selectedClass.description && (
								<p>Description: {selectedClass.description}</p>
							)}
							{selectedClass.startDate && (
								<p>
									Start Date:{' '}
									{new Date(selectedClass.startDate).toLocaleDateString()}
								</p>
							)}
							{selectedClass.endDate && (
								<p>
									End Date:{' '}
									{new Date(selectedClass.endDate).toLocaleDateString()}
								</p>
							)}
						</div>
					)}
					{/* Class Selection */}
					<FormField
						control={form.control}
						name='classId'
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Select Class<p className='text-red-500'>*</p>
								</FormLabel>
								<FormControl>
									<select
										className='border p-4 rounded-md w-full'
										value={field.value}
										onChange={(e) => onClassChange(e.target.value)}
									>
										<option value=''>Select a class</option>
										{classes.map((classItem: any) => (
											<option
												key={classItem.id}
												value={classItem.id}
											>
												{classItem.className}
											</option>
										))}
									</select>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* New Student Selection */}
					<FormField
						control={form.control}
						name='newStudentId'
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									New Student<p className='text-red-500'>*</p>
								</FormLabel>
								<FormControl>
									<select
										className='border p-4 rounded-md w-full'
										value={field.value ?? ''}
										onChange={(e) => field.onChange(e.target.value)}
									>
										<option value=''>Select new student</option>
										{studentsAndTutors.students.map((student: any) => (
											<option
												key={student.studentId}
												value={student.studentId}
											>
												{student.username}
											</option>
										))}
									</select>
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
								<FormLabel>
									New Tutor<p className='text-red-500'>*</p>
								</FormLabel>
								<FormControl>
									<select
										className='border p-4 rounded-md w-full'
										value={field.value ?? ''}
										onChange={(e) => field.onChange(e.target.value)}
									>
										<option value=''>Select new tutor</option>
										{studentsAndTutors.tutors.map((tutor: any) => (
											<option
												key={tutor.tutorId}
												value={tutor.tutorId}
											>
												{tutor.username}
											</option>
										))}
									</select>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				{error && <div className='text-red-500'>{error}</div>}

				<div className='self-end'>
					<Button
						className='bg-gradient-to-r from-purple-500 to-blue-700 cursor-pointer'
						disabled={form.formState.isSubmitting}
					>
						{form.formState.isSubmitting ? 'Reallocating...' : 'Reallocate'}
					</Button>
				</div>
			</form>
		</Form>
	)
}

export default ReallocateForm
