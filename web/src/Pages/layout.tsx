import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '@/Components/Sidebar'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { useEffect, useState } from 'react'
import { getCurrentUser, getConversation, getMessages } from '@/actions/getData'
import { Button } from '@/Components/ui/button'
import { CiChat1 } from 'react-icons/ci'
import MessagePage from './Classes/ClassPage/Message'
import MessageList from './Classes/ClassPage/Message/MessageList'
import { getSocket, initializeSocket } from '@/lib/socket'
import { X } from 'lucide-react'

interface Message {
	senderId: string
	senderName: string
	senderAvatar: string
	messageContent: string
	sendDate: string
	isRead: boolean
}

function Layout() {
	const { currentUser, authToken, setCurrentUser } = useGlobalState()
	const navigate = useNavigate()
	const [isLoading, setIsLoading] = useState(true)
	const [socket, setSocket] = useState<any>(null)
	const [currentConversation, setCurrentConversation] = useState<any>(null)
	const [isMessageOpen, setIsMessageOpen] = useState(false)
	const [showChat, setShowChat] = useState(false)
	const [unreadMessages, setUnreadMessages] = useState<Message[]>([])
	const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

	// Mock data - replace with real API call
	useEffect(() => {
		if (currentUser?.role === 'student') {
			// Simulate getting unread messages
			setUnreadMessages([
				{
					senderId: '1',
					senderName: 'Prof. Michael Brown',
					senderAvatar: 'https://storage.googleapis.com/a1aa/image/df0CF7_imT5d76erw6dMhuYdT-uuq7ZtPaisg2K6FYI.jpg',
					messageContent: "Don't forget to check the updated course materials.",
					sendDate: new Date().toISOString(),
					isRead: false
				},
				{
					senderId: '2',
					senderName: 'Dr. Sarah Wilson',
					senderAvatar: 'https://storage.googleapis.com/a1aa/image/df0CF7_imT5d76erw6dMhuYdT-uuq7ZtPaisg2K6FYI.jpg',
					messageContent: 'The meeting is scheduled for tomorrow at 2 PM.',
					sendDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
					isRead: false
				},
				{
					senderId: '3',
					senderName: 'Admin Team',
					senderAvatar: 'https://storage.googleapis.com/a1aa/image/df0CF7_imT5d76erw6dMhuYdT-uuq7ZtPaisg2K6FYI.jpg',
					messageContent: 'New system update available.',
					sendDate: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
					isRead: false
				}
			])
		}
	}, [currentUser])

	const handleMessageClick = (message: Message) => {
		setSelectedMessage(message)
		setShowChat(true)
		// Mark message as read
		setUnreadMessages(prev => 
			prev.map(msg => 
				msg.senderId === message.senderId ? { ...msg, isRead: true } : msg
			)
		)
	}

	const handleBack = () => {
		setShowChat(false)
		setSelectedMessage(null)
	}

	useEffect(() => {
		const checkAuth = async () => {
			if (!authToken) {
				setIsLoading(false)
				navigate('/login')
				return
			}

			try {
				const user = await getCurrentUser(authToken)
				if (!user) {
					setIsLoading(false)
					navigate('/login')
					return
				}
				
				setCurrentUser(user)
				
				if (user.role === 'staff') {
					setIsLoading(false)
					navigate('/staff')
					return
				}
				
				// Initialize socket for chat
				if (user.role === 'student') {
					initializeSocket(user.username)
					setSocket(getSocket())
				}
				
				setIsLoading(false)
			} catch (error) {
				console.error('Auth check failed:', error)
				setIsLoading(false)
				navigate('/login')
			}
		}

		checkAuth()
	}, [authToken, navigate, setCurrentUser])

	if (isLoading) {
		return <div>Loading...</div>
	}

	if (!currentUser || currentUser.role === 'staff') {
		return null
	}

	const unreadCount = unreadMessages.filter(msg => !msg.isRead).length

	return (
		<div className='bg-accent/5 min-h-screen'>
			<div className='flex flex-row'>
				<Sidebar />
				<div className='flex-1 ml-64 container bg-gray-50'>
					<Outlet />
				</div>
			</div>
			
			{/* Fixed Message Button & Box */}
			<div className="fixed bottom-4 right-4 flex flex-col items-end">
				{isMessageOpen && (
					<div className="bg-white rounded-lg shadow-lg mb-4 w-[350px] h-[500px] flex flex-col overflow-hidden">
						{showChat ? (
							<MessagePage 
								found_class={selectedMessage} 
								onBack={handleBack}
							/>
						) : (
							<>
								<div className="flex items-center justify-between p-3 border-b">
									<div className="flex items-center gap-2">
										<img
											src='https://storage.googleapis.com/a1aa/image/df0CF7_imT5d76erw6dMhuYdT-uuq7ZtPaisg2K6FYI.jpg'
											alt='Avatar'
											className='rounded-full w-8 h-8'
										/>
										<span className="font-semibold">Messages</span>
									</div>
									<Button 
										variant="ghost" 
										size="icon"
										className="h-8 w-8 p-0"
										onClick={() => {
											setIsMessageOpen(false)
											setShowChat(false)
										}}
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
								<MessageList 
									messages={unreadMessages}
									onMessageClick={handleMessageClick}
								/>
							</>
						)}
					</div>
				)}
				<div className="relative">
					<Button 
						size="lg" 
						className="rounded-full w-12 h-12 p-0 bg-blue-500 hover:bg-blue-600"
						onClick={() => setIsMessageOpen(!isMessageOpen)}
					>
						<CiChat1 className="w-6 h-6 text-white" />
					</Button>
					{unreadCount > 0 && (
						<div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
							{unreadCount}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default Layout
