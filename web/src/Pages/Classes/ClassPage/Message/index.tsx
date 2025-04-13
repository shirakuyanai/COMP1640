import {
	getClassById,
	getConversation,
	getMessages,
	getUserPublicInfoById,
} from '@/actions/getData'
import { getSocket, initializeSocket } from '@/lib/socket'
import { convertToLocalTimezone } from '@/lib/utils'
import { useGlobalState } from '@/misc/GlobalStateContext'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { FaPaperPlane } from 'react-icons/fa'

// Interface for message data
interface Message {
	messageId: string
	conversationId: string
	senderId: string
	messageContent: string
	sendDate: string
}

// Interface for user data
interface UserInfo {
	userId: string
	username: string
	email?: string
	firstname?: string
	lastname?: string
	biography?: string
}

const MessagePage = ({ found_class }: { found_class: any }) => {
	const params = useParams()
	const navigate = useNavigate()
	const { authToken, currentUser } = useGlobalState()
	const [currentClass, setCurrentClass] = useState(null)
	const [messages, setMessages] = useState<Message[]>([])
	const [conversation, setConversation] = useState(null)
	const [socket, setSocket] = useState<any>(null)
	const [userCache, setUserCache] = useState<Record<string, UserInfo>>({})
	const messagesEndRef = useRef<HTMLDivElement>(null)

	// Initialize socket connection
	useEffect(() => {
		if (currentUser) {
			initializeSocket(currentUser.username)
			setSocket(getSocket())
		}
	}, [currentUser])

	// Scroll to bottom of messages when new messages arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	// Fetch user info if not already in cache
	const fetchUserInfo = async (userId: string) => {
		// Skip if already in cache
		if (userCache[userId]) return userCache[userId]

		// Skip if it's the current user
		if (currentUser && userId === currentUser.id) {
			const userInfo = {
				userId: currentUser.id,
				username: currentUser.username,
				firstname: currentUser.firstname,
				lastname: currentUser.lastname,
			}
			setUserCache((prev) => ({ ...prev, [userId]: userInfo }))
			return userInfo
		}

		try {
			const response = await getUserPublicInfoById({
				token: authToken,
				userId,
			})

			if (response) {
				setUserCache((prev) => ({ ...prev, [userId]: response }))
				return response
			}
		} catch (error) {
			console.error('Error fetching user info:', error)
		}

		// Return basic info if fetch fails
		return { userId, username: 'Unknown User' }
	}

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
				offset: 0,
			})

			if (found_messages) {
				setMessages(found_messages.reverse())

				// // Pre-fetch user info for all message senders
				// const uniqueSenderIds = [...new Set(found_messages.map(msg => msg.senderId))]
				// uniqueSenderIds.forEach(id => fetchUserInfo(id))
			}
		} else {
			navigate('/')
		}
	}

	useEffect(() => {
		if (socket) {
			if (conversation) socket.emit('joinRoom', (conversation as any).id)
			socket.on('receiveMessage', (messageData: any) => {
				setMessages((prevMessages) => [...prevMessages, messageData])

				// Fetch user info for new message sender if not in cache
				if (messageData.senderId && !userCache[messageData.senderId]) {
					fetchUserInfo(messageData.senderId)
				}
			})

			return () => {
				socket.off('receiveMessage')
			}
		}
	}, [socket, conversation, userCache])

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

	// Get the first letter of username for avatar
	const getUserInitial = (user?: UserInfo) => {
		if (!user) return 'U'

		if (user.firstname) return user.firstname.charAt(0).toUpperCase()
		if (user.username) return user.username.charAt(0).toUpperCase()
		return 'U'
	}

	// Get user display name
	const getDisplayName = (user?: UserInfo) => {
		if (!user) return 'Unknown User'

		if (user.firstname && user.lastname)
			return `${user.firstname} ${user.lastname}`
		return user.username
	}

	if (socket)
		return (
			<div className='flex h-full bg-white rounded-lg shadow-sm overflow-hidden'>
				{/* Chat Section */}
				<div className='flex-1 flex flex-col'>
					<div className='p-2 md:p-4 flex items-center justify-between border-b border-gray-200'>
						<div className='flex items-center'>
							<div className='bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-white font-medium'>
								{currentClass
									? (currentClass as any).className.charAt(0).toUpperCase()
									: 'C'}
							</div>
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
							{messages.length === 0 && (
								<div className='text-center text-gray-500'>No messages yet</div>
							)}

							{messages.length > 0 &&
								messages.map((message, i) => {
									return message.senderId === currentUser.id ? (
										<div
											className='flex justify-end space-x-2'
											key={i}
										>
											<div>
												<div className='flex flex-col'>
													<span className='text-xs text-gray-500 text-right mr-1 mb-1'>
														{currentUser.userId}
													</span>
													<div className='bg-blue-500 text-white p-2 rounded-lg max-w-[200px] sm:max-w-[300px] md:max-w-[400px]'>
														<p className='break-words text-sm md:text-base'>
															{message.messageContent}
														</p>
														<span className='text-[10px] md:text-xs text-gray-200 block text-right mt-1'>
															{convertToLocalTimezone(message.sendDate)}
														</span>
													</div>
												</div>
											</div>
										</div>
									) : (
										<div
											className='flex items-start space-x-2'
											key={i}
										>
											<div>
												<div className='flex flex-col'>
													<div className='bg-purple-500 text-white p-2 rounded-lg max-w-[200px] sm:max-w-[300px] md:max-w-[400px]'>
														<p className='break-words text-sm md:text-base'>
															{message.messageContent}
														</p>
														<span className='text-[10px] md:text-xs text-gray-200 block text-right mt-1'>
															{convertToLocalTimezone(message.sendDate)}
														</span>
													</div>
												</div>
											</div>
										</div>
									)
								})}
							<div ref={messagesEndRef} />
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
								<FaPaperPlane className='h-4 w-4 md:h-5 md:w-5' />
							</button>
						</div>
					</form>
				</div>
			</div>
		)

	return <div>Loading...</div>
}

export default MessagePage
