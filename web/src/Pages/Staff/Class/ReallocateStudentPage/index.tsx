import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/Components/ui/form'
import { Button } from '@/Components/ui/button'
import RequiredLabelIcon from '@/Components/RequiredLabelIcon'
import { useForm } from 'react-hook-form'

const students = [
	{ id: '1', name: 'Alice Johnson' },
	{ id: '2', name: 'Bob Smith' },
	{ id: '3', name: 'Charlie Brown' },
]

const classes = [
	{ id: '101', name: 'Math ' },
	{ id: '102', name: 'Physic' },
	{ id: '103', name: 'English' },
]

// Form structure
function ReallocateStudentForm() {
	const form = useForm({
		defaultValues: {
			studentId: '',
			oldClassId: '',
			newClassId: '',
		},
	})

	const onSubmit = (values: any) => {
		alert(`Student ${values.studentId} moved from ${values.oldClassId} to ${values.newClassId}`)
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-6 bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mx-auto'>
				<h2 className='text-2xl font-semibold text-center'>Reallocate Student</h2>

				{/* Select Student */}
				<FormField
					control={form.control}
					name='studentId'
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								Select Student <RequiredLabelIcon />
							</FormLabel>
							<FormControl>
								<select
									className='border p-3 rounded-md w-full'
									value={field.value}
									onChange={(e) => field.onChange(e.target.value)}
								>
									<option value=''>Select a student</option>
									{students.map((student) => (
										<option key={student.id} value={student.id}>
											{student.name}
										</option>
									))}
								</select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Select Old Class */}
				<FormField
					control={form.control}
					name='oldClassId'
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								Current Class <RequiredLabelIcon />
							</FormLabel>
							<FormControl>
								<select
									className='border p-3 rounded-md w-full'
									value={field.value}
									onChange={(e) => field.onChange(e.target.value)}
								>
									<option value=''>Select current class</option>
									{classes.map((cls) => (
										<option key={cls.id} value={cls.id}>
											{cls.name}
										</option>
									))}
								</select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Select New Class */}
				<FormField
					control={form.control}
					name='newClassId'
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								New Class <RequiredLabelIcon />
							</FormLabel>
							<FormControl>
								<select
									className='border p-3 rounded-md w-full'
									value={field.value}
									onChange={(e) => field.onChange(e.target.value)}
								>
									<option value=''>Select new class</option>
									{classes.map((cls) => (
										<option key={cls.id} value={cls.id}>
											{cls.name}
										</option>
									))}
								</select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Submit Button */}
				<Button
					type='submit'
					className='bg-gradient-to-r from-purple-500 to-blue-700 text-white font-semibold py-3 rounded-md hover:opacity-90 transition-all'
				>
					Reallocate Student
				</Button>
			</form>
		</Form>
	)
}

export default ReallocateStudentForm
