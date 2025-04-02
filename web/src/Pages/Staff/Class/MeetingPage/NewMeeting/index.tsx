import { Button } from '@/Components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from '@/Components/ui/form'
import { Input } from '@/Components/ui/input'
import { Textarea } from '@/Components/ui/textarea'
import { newMeetingSchema } from '@/schemas/meeting'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

function NewMeeting() {
	const [meeting, setMeeting] = useState({
		classId: 'aslkdjas',
		meetingDate: '',
		meetingType: 'in-person',
		meetingNote: '',
		meetingLink: '',
		location: '',
		studentAttended: 0,
	})

	const form = useForm<z.infer<typeof newMeetingSchema>>({
		resolver: zodResolver(newMeetingSchema),
		defaultValues: meeting,
	})

	const onSubmit = async (values: z.infer<typeof newMeetingSchema>) => {
		alert(JSON.stringify(values))
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
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='meetingNote'
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
													meetingNote: e.target.value,
												}))
											}}
										/>
									</FormControl>
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
