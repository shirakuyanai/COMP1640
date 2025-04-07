import { addClassSchema } from '@/schemas/class'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/Components/ui/form'
import { Input } from '@/Components/ui/input'
import RequiredLabelIcon from '@/Components/RequiredLabelIcon'
import { Button } from '@/Components/ui/button'
import { useEffect, useState } from 'react'
import { getDataForCreatingClass } from '@/actions/getData'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { FaSave } from 'react-icons/fa'
import { toast } from '@/Components/ui/use-toast'
import { useNavigate } from 'react-router-dom'
import { AddNewClass } from '@/actions/postData'

type ClassUpdateFormProps = {
	onSubmit?: (data: z.infer<typeof addClassSchema>) => void
	isLocked?: boolean
	initialData?: z.infer<typeof addClassSchema>
}

function ClassUpdateForm({
	onSubmit,
	isLocked = false,
	initialData
}: ClassUpdateFormProps) {
	const { authToken } = useGlobalState()
	const navigate = useNavigate()

	const form = useForm<z.infer<typeof addClassSchema>>({
		resolver: zodResolver(addClassSchema),
		defaultValues: initialData ?? {
			className: '',
			studentId: '',
			tutorId: '',
			startDate: '',
			endDate: ''
		},
	})

	const handleSubmit = async (values: z.infer<typeof addClassSchema>) => {
		try {
			// Format dates to match datetime-local input format
			const formattedStartDate = values.startDate ? new Date(values.startDate).toISOString().slice(0, 16) : undefined
			const formattedEndDate = values.endDate ? new Date(values.endDate).toISOString().slice(0, 16) : undefined

			const formData = {
				...values,
				startDate: formattedStartDate,
				endDate: formattedEndDate
			}

			if (onSubmit) {
				onSubmit(formData)
			} else {
				const response = await AddNewClass(formData, authToken)
				if (response.error) {
					toast({
						title: "Error",
						description: response.message,
						variant: "destructive"
					})
				} else {
					toast({
						title: "Success",
						description: "Class created successfully"
					})
					navigate('/staff/class')
				}
			}
		} catch (error) {
			console.error('Error submitting form:', error)
			toast({
				title: "Error",
				description: "Failed to create class",
				variant: "destructive"
			})
		}
	}

	const [studentsAndTutors, setStudentsAndTutors] = useState<{
		students: StudentType[]
		tutors: TutorType[]
	}>({
		students: [],
		tutors: [],
	})

	const getData = async () => {
		const data = await getDataForCreatingClass(authToken)
		setStudentsAndTutors(data)
	}

	useEffect(() => {
		getData()
	}, [])

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				className='flex gap-6 flex-col'
			>
				<div className='flex gap-6 flex-col'>
					<FormField
						control={form.control}
						name='className'
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Class Name
									<RequiredLabelIcon />
								</FormLabel>
								<FormControl>
									<Input
										{...field}
										className='h-12'
										disabled={isLocked}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='studentId'
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Student
									<RequiredLabelIcon />
								</FormLabel>
								<FormControl>
									<select
										{...field}
										className='h-12 w-full rounded-md border border-input bg-background px-3 py-2'
										disabled={isLocked}
									>
										<option value="">Select a student</option>
										{studentsAndTutors.students.map((student) => (
											<option key={student.studentId} value={student.studentId}>
												{student.username}
											</option>
										))}
									</select>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='tutorId'
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Tutor
									<RequiredLabelIcon />
								</FormLabel>
								<FormControl>
									<select
										{...field}
										className='h-12 w-full rounded-md border border-input bg-background px-3 py-2'
										disabled={isLocked}
									>
										<option value="">Select a tutor</option>
										{studentsAndTutors.tutors.map((tutor) => (
											<option key={tutor.tutorId} value={tutor.tutorId}>
												{tutor.username}
											</option>
										))}
									</select>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='startDate'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Start Date</FormLabel>
								<FormControl>
									<Input
										{...field}
										type="datetime-local"
										className='h-12'
										disabled={isLocked}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='endDate'
						render={({ field }) => (
							<FormItem>
								<FormLabel>End Date</FormLabel>
								<FormControl>
									<Input
										{...field}
										type="datetime-local"
										className='h-12'
										disabled={isLocked}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<Button 
					type="submit" 
					className="gap-2"
					disabled={isLocked}
				>
					<FaSave className="h-4 w-4" />
					Save Class
				</Button>
			</form>
		</Form>
	)
}

export default ClassUpdateForm
