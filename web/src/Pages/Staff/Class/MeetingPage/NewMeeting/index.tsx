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
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { z } from 'zod'
import { FaCalendarAlt, FaVideo, FaMapMarkerAlt, FaLink, FaStickyNote, FaArrowLeft } from 'react-icons/fa'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { toast } from '@/Components/ui/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select'

function NewMeeting() {
	const { id } = useParams()
	const { authToken, currentUser } = useGlobalState()
	const navigate = useNavigate()
	
	// Authorization check - only tutors can access this page
	if (currentUser && currentUser.role !== 'tutor') {
		toast({
			title: "Access Denied",
			description: "Only tutors can create meetings.",
			variant: "destructive",
		})
		return <Navigate to="/dashboard" replace />
	}

	// If user is not authenticated yet
	if (!currentUser) {
		return (
			<div className="flex items-center justify-center min-h-[50vh]">
				<div className="w-8 h-8 border-4 border-t-indigo-500 border-indigo-200 rounded-full animate-spin"></div>
			</div>
		)
	}
	
	const [meeting, setMeeting] = useState({
		classId: id ?? '',
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
		try {
			const response = await AddNewMeeting(values, authToken)
			if (response) {
				toast({
					title: "Success!",
					description: "Meeting created successfully!",
					variant: "default",
				})
				navigate(`/dashboard/classes/${id}/meetings`)
			} else {
				toast({
					title: "Error",
					description: "Failed to create meeting. Please try again.",
					variant: "destructive",
				})
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "An unexpected error occurred. Please try again.",
				variant: "destructive",
			})
		}
	}

	return (
		<div className='space-y-6'>
			{/* Header with back button and title */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-3'>
					<div className='bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-xl shadow-md'>
						<FaCalendarAlt className="h-6 w-6 text-white" />
					</div>
					<div>
						<h1 className='text-2xl font-bold text-gray-800'>Schedule New Meeting</h1>
						<p className='text-gray-500'>Create a new meeting for this class</p>
					</div>
				</div>
				<Button 
					variant="outline"
					className='border-gray-200 hover:bg-gray-50 transition-all' 
					onClick={() => navigate(`/dashboard/classes/${id}/meetings`)}
				>
					<FaArrowLeft className="h-3 w-3 mr-2" /> Back to Meetings
				</Button>
			</div>

			{/* Divider */}
			<div className='h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent'></div>

			<Card className='border border-gray-100 shadow-sm'>
				<CardHeader className='bg-gradient-to-r from-gray-50 to-indigo-50 border-b border-gray-100'>
					<div className='flex items-center gap-2'>
						<div className='bg-indigo-100 p-1.5 rounded-md'>
							<FaCalendarAlt className='h-4 w-4 text-indigo-600' />
						</div>
						<CardTitle className='text-lg font-semibold text-gray-800'>Meeting Details</CardTitle>
					</div>
				</CardHeader>
				<CardContent className='p-6'>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className='flex flex-col gap-6'
						>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								{/* Hidden fields */}
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

								{/* Date and Time */}
								<FormField
									control={form.control}
									name='meetingDate'
									render={({ field }) => (
										<FormItem className='flex flex-col gap-2'>
											<FormLabel className='flex items-center gap-2 text-gray-700'>
												<FaCalendarAlt className="h-3 w-3 text-indigo-500" /> 
												Meeting Date & Time
											</FormLabel>
											<FormControl>
												<Input
													{...field}
													type='datetime-local'
													className='focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all'
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

								{/* Meeting Type */}
								<FormField
									control={form.control}
									name='meetingType'
									render={({ field }) => (
										<FormItem className='flex flex-col gap-2'>
											<FormLabel className='flex items-center gap-2 text-gray-700'>
												{field.value === 'online' ? 
													<FaVideo className="h-3 w-3 text-indigo-500" /> : 
													<FaMapMarkerAlt className="h-3 w-3 text-indigo-500" />} 
												Meeting Type
											</FormLabel>
											<FormControl>
												<Select
													onValueChange={(value) => {
														field.onChange(value)
														setMeeting((prevMeeting) => ({
															...prevMeeting,
															meetingType: value,
														}))
													}}
													defaultValue={field.value}
												>
													<SelectTrigger className='focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all'>
														<SelectValue placeholder="Select meeting type" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value='in-person' className='flex items-center gap-2'>
															<div className='flex items-center gap-2'>
																<FaMapMarkerAlt className="h-3 w-3 text-green-500" /> 
																In-person
															</div>
														</SelectItem>
														<SelectItem value='online' className='flex items-center gap-2'>
															<div className='flex items-center gap-2'>
																<FaVideo className="h-3 w-3 text-blue-500" /> 
																Online
															</div>
														</SelectItem>
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Meeting Note */}
							<FormField
								control={form.control}
								name='meetingNote'
								render={({ field }) => (
									<FormItem className='flex flex-col gap-2'>
										<FormLabel className='flex items-center gap-2 text-gray-700'>
											<FaStickyNote className="h-3 w-3 text-indigo-500" /> 
											Meeting Notes
										</FormLabel>
										<FormControl>
											<Textarea
												{...field}
												className='min-h-24 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all'
												placeholder="Add details about the meeting agenda, preparation required, etc."
												onChange={(e) => {
													field.onChange(e.target.value)
													setMeeting((prevMeeting) => ({
														...prevMeeting,
														meetingNote: e.target.value,
													}))
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Conditional fields based on meeting type */}
							<div className='grid grid-cols-1 gap-6'>
								{meeting.meetingType === 'online' && (
									<FormField
										control={form.control}
										name='meetingLink'
										render={({ field }) => (
											<FormItem className='flex flex-col gap-2'>
												<FormLabel className='flex items-center gap-2 text-gray-700'>
													<FaLink className="h-3 w-3 text-indigo-500" /> 
													Virtual Meeting Link
												</FormLabel>
												<FormControl>
													<Input
														{...field}
														type='url'
														className='focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all'
														placeholder="https://meet.google.com/... or https://zoom.us/..."
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
								)}

								{meeting.meetingType === 'in-person' && (
									<FormField
										control={form.control}
										name='location'
										render={({ field }) => (
											<FormItem className='flex flex-col gap-2'>
												<FormLabel className='flex items-center gap-2 text-gray-700'>
													<FaMapMarkerAlt className="h-3 w-3 text-indigo-500" /> 
													Meeting Location
												</FormLabel>
												<FormControl>
													<Input
														{...field}
														className='focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all'
														placeholder="Room 101, Building A, Campus..."
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
								)}
							</div>
							
							<div className='flex justify-end mt-4'>
								<Button
									type='button'
									variant="outline"
									className='mr-2 border-gray-200 hover:bg-gray-50 transition-all'
									onClick={() => navigate(`/dashboard/classes/${id}/meetings`)}
								>
									Cancel
								</Button>
								<Button
									type='submit'
									className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all'
								>
									Schedule Meeting
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	)
}

export default NewMeeting
