import { Form } from '@/Components/ui/form'
import { sendMessageSchema } from '@/schemas/message'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

function SendMessageForm() {
	let form = useForm<z.infer<typeof sendMessageSchema>>({
		resolver: zodResolver(sendMessageSchema),
		defaultValues: {
			conversationId: '',
			senderId: '',
			messageContent: '',
		},
	})

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit((values) => {
					alert(values)
				})}
			>
				<div className='p-4 border-t border-gray-200 flex items-center'>
					<input
						type='text'
						placeholder='Enter Message...'
						className='w-full p-2 border border-gray-300 rounded-lg'
					/>
					<button
						title='Send message'
						className='ml-2 bg-blue-500 text-white p-2 rounded-lg'
					>
						<i className='fas fa-paper-plane'></i>
					</button>
				</div>
			</form>
		</Form>
	)
}

export default SendMessageForm
