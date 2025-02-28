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
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import RequiredLabelIcon from '@/components/RequiredLabelIcon'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { getDataForCreatingClass } from '@/actions/getData'
import { AddNewClass } from '@/actions/postData'
import { useGlobalState } from '@/misc/GlobalStateContext'

function ClassUpdateForm({
	class_detail,
}: {
	class_detail?: {
		className: string
		studentId: string
		tutorId: string
	}
}) {
	const form = useForm<z.infer<typeof addClassSchema>>({
		resolver: zodResolver(addClassSchema),
		defaultValues: class_detail ?? {
			className: '',
			studentId: '',
			tutorId: '',
		},
	})

	const onSubmit = async (values: z.infer<typeof addClassSchema>) => {
		const response = await AddNewClass(values)
		if (response) alert('Class added successfully')
	}

	const [studentsAndTutors, setStudentsAndTutors] = useState<{
		students: StudentType[]
		tutors: TutorType[]
	}>({
		students: [],
		tutors: [],
	})

	const { authToken } = useGlobalState()

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
				onSubmit={form.handleSubmit(onSubmit)}
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
										className='border p-4 rounded-md'
										value={field.value ?? ''}
										onChange={(e) => {
											field.onChange(e.target.value)
										}}
									>
										<option value=''>Select a tutor</option>
										{studentsAndTutors.students.map((student) => (
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
										className='border p-4 rounded-md'
										value={field.value ?? ''}
										onChange={(e) => {
											field.onChange(e.target.value)
										}}
									>
										<option value=''>Select a tutor</option>
										{studentsAndTutors.tutors.map((tutor) => (
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
				<div className='self-end'>
					<Button
						className='bg-gradient-to-r from-purple-500 to-blue-700 cursor-pointer'
						disabled={form.formState.isSubmitting}
					>
						Save
					</Button>
				</div>
			</form>
		</Form>
	)
}

export default ClassUpdateForm
