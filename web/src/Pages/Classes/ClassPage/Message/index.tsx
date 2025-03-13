import { getClassById, getConversation, getMessages } from '@/actions/getData'
import { getSocket, initializeSocket } from '@/lib/socket'
import { convertToLocalTimezone } from '@/lib/utils'
import { useGlobalState } from '@/misc/GlobalStateContext'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { FaPaperPlane } from 'react-icons/fa6'

const MessagePage: React.FC = () => {
	const params = useParams()
	const navigate = useNavigate()
	const { authToken, currentUser } = useGlobalState()
	const [currentClass, setCurrentClass] = useState(null)

	const [messages, setMessages] = useState<
		{
			messageId: string
			conversationId: string
			senderId: string
			messageContent: string
			sendDate: string
		}[]
	>([])
	const [conversation, setConversation] = useState(null)
	const [socket, setSocket] = useState<any>(null)

	useEffect(() => {
		if (currentUser) {
			initializeSocket(currentUser.username)
			setSocket(getSocket())
		}
	}, [currentUser])

	const getData = async () => {
		if (!params.id) navigate('/')
		const found_class = await getClassById({
			token: authToken,
			classId: params.id ?? '',
			userId: currentUser.id,
			role: currentUser.role,
		})

		// const found_class = await getClassById(authToken, params.id ?? '')
		if (!found_class) {
			navigate('/')
		} else {
			setCurrentClass(found_class)
		}
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
		} else {
			navigate('/')
		}
	}

	useEffect(() => {
		if (socket) {
			if (conversation) socket.emit('joinRoom', (conversation as any).id)
			socket.on('receiveMessage', (messageData: any) => {
				setMessages((prevMessages) => [...prevMessages, messageData])
			})

			return () => {
				socket.off('receiveMessage')
			}
		}
	}, [socket, conversation])

	useEffect(() => {
		if (currentUser) getData()
	}, [currentUser])

	const [message, setMessage] = useState('')

	const sendMessage = () => {
		if (message && socket && conversation && currentUser) {
			const messageData = {
				messageId: '',
				conversationId: (conversation as any).id,
				messageContent: message,
				senderId: currentUser.id,
				sendDate: new Date().toISOString(),
			}

			setMessages((prevMessages) => [...prevMessages, messageData])

			socket.emit('sendMessage', {
				message: messageData,
				room: conversation ? (conversation as any).id : '',
			})
			setMessage('')
		}
	}

	if (socket)
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
							<span className='ml-2 text-lg font-semibold'>
								{currentClass ? (currentClass as any).className : 'N/A'}
							</span>
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

							{messages.length > 0 &&
								messages.map(
									(message, i) =>
										(message.senderId === currentUser.id && (
											<div
												className='flex justify-end space-x-2'
												key={i}
											>
												<div>
													<div className='bg-blue-500 text-white p-2 rounded-lg lg:max-w-200'>
														<p className='break-words'>
															{message.messageContent}
														</p>
														<span className='text-xs text-gray-200'>
															{convertToLocalTimezone(message.sendDate)}
														</span>
													</div>
												</div>
											</div>
										)) ||
										(message.senderId !== currentUser.id && (
											<div className='flex items-start space-x-2'>
												<img
													src='https://storage.googleapis.com/a1aa/image/dh0AmYifcf0VudUDHtqN8bwFEwYDcelC5fhSHMFLOYQ.jpg'
													alt='Patrick Hendricks'
													className='rounded-full w-10 h-10'
												/>
												<div>
													<div className='bg-purple-500 text-white p-2 rounded-lg lg:max-w-200'>
														<p className='break-words'>
															{message.messageContent}
														</p>
														<span className='text-xs text-gray-200'>
															{convertToLocalTimezone(message.sendDate)}
														</span>
													</div>
												</div>
											</div>
										)),
								)}
						</div>
					</div>

					{/* Message Input */}
					<form
						onSubmit={(e) => {
							sendMessage()
							e.preventDefault()
						}}
					>
						<div className='p-4 border-t border-gray-200 flex items-center'>
							<input
								type='text'
								value={message}
								placeholder='Enter Message...'
								className='w-full p-2 border border-gray-300 rounded-lg'
								onChange={(e) => setMessage(e.target.value)}
							/>
							<button
								title='Send message'
								className='ml-2 bg-blue-500 text-white p-2 rounded-lg'
							>
								<FaPaperPlane />
							</button>
						</div>
					</form>
				</div>
			</div>
		)
}

export default MessagePage
