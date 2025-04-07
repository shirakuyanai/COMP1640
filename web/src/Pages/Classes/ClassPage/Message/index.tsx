import { getClassById, getConversation, getMessages } from '@/actions/getData'
import { getSocket, initializeSocket } from '@/lib/socket'
import { convertToLocalTimezone } from '@/lib/utils'
import { useGlobalState } from '@/misc/GlobalStateContext'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { FaPaperPlane } from 'react-icons/fa'

const MessagePage = ({ found_class }: { found_class: any }) => {
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
		if (currentUser) {
			getData()
		}
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
			<div className='flex h-full bg-white rounded-lg shadow-sm overflow-hidden'>
				{/* Chat Section */}
				<div className='flex-1 flex flex-col'>
					<div className='p-2 md:p-4 flex items-center justify-between border-b border-gray-200'>
						<div className='flex items-center'>
							<img
								src='https://storage.googleapis.com/a1aa/image/df0CF7_imT5d76erw6dMhuYdT-uuq7ZtPaisg2K6FYI.jpg'
								alt='Group 11223'
								className='rounded-full w-8 h-8 md:w-10 md:h-10'
							/>
							<span className='ml-2 text-sm md:text-lg font-semibold truncate max-w-[120px] md:max-w-full'>
								{currentClass ? (currentClass as any).className : 'N/A'}
							</span>
							<span className='ml-2 text-green-500'>
								<i className='fas fa-circle'></i>
							</span>
						</div>
						<div className='flex space-x-2 text-gray-500'>
							<i className='fas fa-ellipsis-v'></i>
						</div>
					</div>

					{/* Chat Messages */}
					<div className='flex-1 p-2 md:p-4 overflow-y-auto'>
						<div className='flex flex-col space-y-3 md:space-y-4'>
							{/* Example message */}

							{messages.length === 0 && (
								<div className='text-center text-gray-500'>No messages yet</div>
							)}

							{messages.length > 0 &&
								messages.map((message, i) => {
									const key = message.messageId || `message-${i}-${message.sendDate}`;
									
									return message.senderId === currentUser.id ? (
										<div
											className='flex justify-end space-x-2'
											key={key}
										>
											<div>
												<div className='bg-blue-500 text-white p-2 rounded-lg max-w-[200px] sm:max-w-[300px] md:max-w-[400px]'>
													<p className='break-words text-sm md:text-base'>
														{message.messageContent}
													</p>
													<span className='text-[10px] md:text-xs text-gray-200'>
														{convertToLocalTimezone(message.sendDate)}
													</span>
												</div>
											</div>
										</div>
									) : (
										<div className='flex items-start space-x-2' key={key}>
											<img
												src='https://storage.googleapis.com/a1aa/image/dh0AmYifcf0VudUDHtqN8bwFEwYDcelC5fhSHMFLOYQ.jpg'
												alt='Patrick Hendricks'
												className='rounded-full w-8 h-8 md:w-10 md:h-10'
											/>
											<div>
												<div className='bg-purple-500 text-white p-2 rounded-lg max-w-[200px] sm:max-w-[300px] md:max-w-[400px]'>
													<p className='break-words text-sm md:text-base'>
														{message.messageContent}
													</p>
													<span className='text-[10px] md:text-xs text-gray-200'>
														{convertToLocalTimezone(message.sendDate)}
													</span>
												</div>
											</div>
										</div>
									);
								})}
						</div>
					</div>

					{/* Message Input */}
					<form
						onSubmit={(e) => {
							sendMessage()
							e.preventDefault()
						}}
					>
						<div className='p-2 md:p-4 border-t border-gray-200 flex items-center'>
							<input
								type='text'
								value={message}
								placeholder='Enter Message...'
								className='w-full p-1 md:p-2 border border-gray-300 rounded-lg text-sm md:text-base'
								onChange={(e) => setMessage(e.target.value)}
							/>
							<button
								title='Send message'
								className='ml-2 bg-blue-500 text-white p-1 md:p-2 rounded-lg'
							>
								<FaPaperPlane className="h-4 w-4 md:h-5 md:w-5" />
							</button>
						</div>
					</form>
				</div>
			</div>
		)
}

export default MessagePage
