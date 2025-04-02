import { getClassById, getConversation, getMessages } from '@/actions/getData'
import { getSocket, initializeSocket } from '@/lib/socket'
import { convertToLocalTimezone } from '@/lib/utils'
import { useGlobalState } from '@/misc/GlobalStateContext'
import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FaPaperPlane } from 'react-icons/fa6'
import { Button } from '@/Components/ui/button'
import { X, ArrowLeft } from 'lucide-react'

const MessagePage = ({ found_class, onBack }: { found_class?: any, onBack?: () => void }) => {
	const params = useParams()
	const navigate = useNavigate()
	const { authToken, currentUser } = useGlobalState()
	const [currentClass, setCurrentClass] = useState(null)
	const messagesEndRef = useRef<HTMLDivElement>(null)

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

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
	}

	useEffect(() => {
		scrollToBottom()
	}, [messages])

	useEffect(() => {
		if (currentUser) {
			initializeSocket(currentUser.username)
			setSocket(getSocket())
		}
	}, [currentUser])

	const getData = async () => {
		if (found_class) {
			setCurrentClass(found_class)
		}
		
		// Get latest conversation
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
			<div className='flex flex-col h-full max-h-full'>
				{/* Chat Header */}
				<div className="flex items-center gap-3 bg-blue-600 text-white p-3 min-h-[60px]">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 p-0 text-white hover:bg-blue-500"
						onClick={onBack}
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center font-semibold">
							{found_class?.className?.[0] || 'PMB'}
						</div>
						<span className="font-semibold">
							{found_class?.className || 'Prof. Michael Brown'}
						</span>
					</div>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 p-0 text-white hover:bg-blue-500 ml-auto"
						onClick={onBack}
					>
						<X className="h-4 w-4" />
					</Button>
				</div>

				{/* Chat Messages */}
				<div className='flex-1 min-h-0'>
					<div className='h-full overflow-y-auto'>
						<div className='flex flex-col space-y-3 p-3'>
							{messages.length === 0 && (
								<div className='text-center text-gray-500 text-sm py-10'>No messages yet</div>
							)}

							{messages.length > 0 &&
								messages.map(
									(message, i) =>
										(message.senderId === currentUser.id && (
											<div
												className='flex justify-end'
												key={i}
											>
												<div className='bg-blue-500 text-white p-2 rounded-lg max-w-[200px]'>
													<p className='break-words text-sm'>
														{message.messageContent}
													</p>
													<span className='text-[10px] text-gray-200'>
														{convertToLocalTimezone(message.sendDate)}
													</span>
												</div>
											</div>
										)) ||
										(message.senderId !== currentUser.id && (
											<div className='flex items-start gap-2'>
												<div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
													PMB
												</div>
												<div className='bg-gray-100 text-gray-900 p-2 rounded-lg max-w-[200px]'>
													<p className='break-words text-sm'>
														{message.messageContent}
													</p>
													<span className='text-[10px] text-gray-500'>
														{convertToLocalTimezone(message.sendDate)}
													</span>
												</div>
											</div>
										)),
								)}
							<div ref={messagesEndRef} />
						</div>
					</div>
				</div>

				{/* Message Input */}
				<div className="min-h-[70px] border-t bg-white p-3">
					<form
						onSubmit={(e) => {
							e.preventDefault()
							sendMessage()
						}}
						className="flex items-center gap-2"
					>
						<input
							type='text'
							value={message}
							placeholder='Type a message...'
							className='flex-1 p-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-blue-500'
							onChange={(e) => setMessage(e.target.value)}
						/>
						<button
							type="submit"
							title='Send message'
							className='bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors'
						>
							<FaPaperPlane className="w-4 h-4" />
						</button>
					</form>
				</div>
			</div>
		)
}

export default MessagePage
