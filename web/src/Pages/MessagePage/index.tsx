import { getConversation, getMessages } from '@/actions/getData'
import { useGlobalState } from '@/misc/GlobalStateContext'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const MessagePage: React.FC = () => {
	const params = useParams()
	const { authToken } = useGlobalState()
	const [messages, setMessages] = useState([])
	const [conversation, setConversation] = useState(null)

	const getData = async () => {
		const found_conversation = await getConversation({
			token: authToken,
			classId: params.id ?? '',
			conversationId: conversation ? (conversation as any).id : '',
		})
		if (found_conversation) {
			setConversation(found_conversation)

			const found_messages = await getMessages({
				token: authToken,
				conversationId: found_conversation.id,
			})

			if (found_messages) setMessages(found_messages)
		}
	}

	useEffect(() => {
		getData()
	}, [])

	return (
		<div className='flex h-screen bg-gray-100'>
			{/* Chat Section */}
			<div className='flex-1 flex flex-col'>
				<div className='p-4 flex items-center justify-between border-b border-gray-200'>
					<div className='flex items-center'>
						<img
							src='https://storage.googleapis.com/a1aa/image/df0CF7_imT5d76erw6dMhuYdT-uuq7ZtPaisg2K6FYI.jpg'
							alt='Group 11223'
							className='rounded-full w-10 h-10'
						/>
						<span className='ml-2 text-lg font-semibold'>Group 11223</span>
						<span className='ml-2 text-green-500'>
							<i className='fas fa-circle'></i>
						</span>
					</div>
					<div className='flex space-x-2 text-gray-500'>
						<i className='fas fa-search'></i>
						<i className='fas fa-phone'></i>
						<i className='fas fa-video'></i>
						<i className='fas fa-ellipsis-v'></i>
					</div>
				</div>

				{/* Chat Messages */}
				<div className='flex-1 p-4 overflow-y-auto'>
					<div className='flex flex-col space-y-4'>
						{/* Example message */}

						{messages.length === 0 && (
							<div className='text-center text-gray-500'>No messages yet</div>
						)}
						<div className='flex items-start space-x-2'>
							<img
								src='https://storage.googleapis.com/a1aa/image/dh0AmYifcf0VudUDHtqN8bwFEwYDcelC5fhSHMFLOYQ.jpg'
								alt='Patrick Hendricks'
								className='rounded-full w-10 h-10'
							/>
							<div>
								<div className='bg-purple-500 text-white p-2 rounded-lg lg:max-w-200'>
									<p className='break-words'>Good morning</p>
									<span className='text-xs text-gray-200'>10:00</span>
								</div>
								<span className='text-xs text-gray-500'>Patrick Hendricks</span>
							</div>
						</div>
						<div className='flex justify-end space-x-2'>
							<div>
								<div className='bg-blue-500 text-white p-2 rounded-lg lg:max-w-200'>
									<p className='break-words'>
										Lorem ipsum dolor sit amet consectetur adipisicing elit. Est
										nihil quisquam et enim libero ea eius, sapiente, saepe
										dolorem at dolorum adipisci eaque quasi. Repudiandae atque
										unde voluptatum dolore provident.
									</p>
									<span className='text-xs text-gray-200'>10:00</span>
								</div>
							</div>
						</div>
						{messages.length > 0 &&
							messages.map((message, i) => (
								<div
									key={i}
									className='flex items-start space-x-2'
								>
									<img
										src='https://storage.googleapis.com/a1aa/image/dh0AmYifcf0VudUDHtqN8bwFEwYDcelC5fhSHMFLOYQ.jpg'
										alt='Patrick Hendricks'
										className='rounded-full w-10 h-10'
									/>
									<div>
										<div className='bg-blue-500 text-white p-2 rounded-lg'>
											<p>Good morning</p>
											<span className='text-xs text-gray-200'>10:00</span>
										</div>
										<span className='text-xs text-gray-500'>
											Patrick Hendricks
										</span>
									</div>
								</div>
							))}
					</div>
				</div>

				{/* Message Input */}
				<form>
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
			</div>
		</div>
	)
}

export default MessagePage
