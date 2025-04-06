import { AddNewMeeting } from '@/actions/postData'
import { Button } from '@/Components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/Components/ui/form'
import { Input } from '@/Components/ui/input'
import { Textarea } from '@/Components/ui/textarea'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { newMeetingSchema } from '@/schemas/meeting'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'

function NewMeeting() {
	const { id } = useParams()
	const { authToken } = useGlobalState()
	const navigate = useNavigate()
	const [meeting, setMeeting] = useState({
		classId: id ?? '',
		meetingDate: '',
		meetingType: 'in-person',
		meetingNotes: '',
		meetingLink: '',
		location: '',
		studentAttended: 0,
	})

	const form = useForm<z.infer<typeof newMeetingSchema>>({
		resolver: zodResolver(newMeetingSchema),
		defaultValues: meeting,
	})

	const onSubmit = async (values: z.infer<typeof newMeetingSchema>) => {
		const response = await AddNewMeeting(values, authToken)
		if (response) {
			alert('Meeting created successfully!')
			navigate(`/dashboard/classes/${id}/meetings`)
		} else {
			alert('Failed to create meeting')
		}
	}

	return (
		<div>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className='p-10 flex flex-col gap-5'
				>
					<div className='flex flex-col gap-5'>
						<Input
							type='hidden'
							{...form.register(`classId`)}
						/>
						<Input
							type='number'
							hidden
							value={0}
							{...form.register(`studentAttended`)}
						/>
						<FormField
							control={form.control}
							name='meetingDate'
							render={({ field }) => (
								<FormItem className='flex flex-col gap-2'>
									<FormLabel>Select a date time</FormLabel>
									<FormControl>
										<Input
											{...field}
											type='datetime-local'
											onChange={(e) => {
												field.onChange(e.target.value)
												setMeeting((prevMeeting) => ({
													...prevMeeting,
													meetingDate: e.target.value,
												}))
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='meetingType'
							render={({ field }) => (
								<FormItem className='flex flex-col gap-2'>
									<FormLabel>Select a meeting type</FormLabel>
									<FormControl>
										<select
											{...field}
											className='border-1 rounded-md p-4'
											onChange={(e) => {
												field.onChange(e.target.value)
												setMeeting((prevMeeting) => ({
													...prevMeeting,
													meetingType: e.target.value,
												}))
											}}
										>
											<option value='in-person'>In-person</option>
											<option value='online'>Online</option>
										</select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='meetingNotes'
							render={({ field }) => (
								<FormItem className='flex flex-col gap-2'>
									<FormLabel>Note</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											onChange={(e) => {
												field.onChange(e.target.value)
												setMeeting((prevMeeting) => ({
													...prevMeeting,
													meetingNotes: e.target.value,
												}))
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div hidden={meeting.meetingType === 'in-person'}>
							<FormField
								control={form.control}
								name='meetingLink'
								render={({ field }) => (
									<FormItem className='flex flex-col gap-2'>
										<FormLabel>Virtual meeting link</FormLabel>
										<FormControl>
											<Input
												{...field}
												type='url'
												onChange={(e) => {
													field.onChange(e.target.value)
													setMeeting((prevMeeting) => ({
														...prevMeeting,
														meetingLink: e.target.value,
													}))
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div hidden={meeting.meetingType === 'online'}>
							<FormField
								control={form.control}
								name='location'
								render={({ field }) => (
									<FormItem className='flex flex-col gap-2'>
										<FormLabel>Meeting location</FormLabel>
										<FormControl>
											<Input
												{...field}
												onChange={(e) => {
													field.onChange(e.target.value)
													setMeeting((prevMeeting) => ({
														...prevMeeting,
														location: e.target.value,
													}))
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
					<Button
						type='submit'
						className='w-fit'
					>
						Save
					</Button>
				</form>
			</Form>
		</div>
	)
}

export default NewMeeting
