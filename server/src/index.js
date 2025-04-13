// Node.js body parsing middleware.
import bodyParser from 'body-parser'

// ExpressJS framework for HTTP server.
import express from 'express'
const app = express()

app.use(express.json())

// support parsing of application/json type post data.
app.use(bodyParser.json())

//support parsing of application/x-www-form-urlencoded post data.
app.use(bodyParser.urlencoded({ extended: true }))

// Server port.
const PORT = process.env.PORT || 5000

// CORS import.
import cors from 'cors'

// CORS policies.
app.use(
	cors({
		origin: JSON.parse(process.env.ALLOWED_HOSTS ?? '[]'),
		credentials: true,
	}),
)
app.enable('trust proxy')

// Database connection import
import { connectToDatabase } from './config/db_config.js'
import {
	alreadyLoggedIn,
	authenticateApp,
	staffOnly,
	authenticateToken,
	hashPassword,
	Login,
	studentsNotAllowed,
} from './lib/auth.js'

import {
	addNewClass,
	getClassById,
	getClassesForUser,
	getDataForCreatingClass,
	reallocateClass,
	getAllClasses,
	deleteClass,
	updateClass,
	getClassDetailForSysAdmin,
} from './db/class.js'
import { getLoggedInUser, getUserPublicInfoById } from './db/user.js'
import {
	getConversation,
	getMessagesOfConversation,
	saveMessage,
} from './db/message.js'

// Import the post and comment functions
import {
	createPost,
	getPostsByClassId,
	getPostById,
	updatePost,
	deletePost,
} from './db/post.js'
import {
	createComment,
	getCommentsByPostId,
	updateComment,
	deleteComment,
} from './db/comment.js'

import { Server } from 'socket.io'
import http from 'http'
import { Log } from './lib/logger.js'
import {
	changeMeetingAttendance,
	getAllMeetingsOfAClass,
	newMeeting,
	deleteMeetingById,
} from './db/meeting.js'
import client from './config/redis.config.js'

const server = http.createServer(app)

const io = new Server(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
	},
})

const usersSockets = {}

// Connect to the database first, then do everything else later
connectToDatabase()
	.then(async () => await client.connect())
	.then(() => {
		// Websocket for direct messaging
		io.use((socket, next) => {
			const username = socket.handshake.auth.username
			Log(`user ${username} connected`)
			delete usersSockets[username]
			usersSockets[username] = socket.id
			socket.username = username
			next()
		})

		io.on('connection', (socket) => {
			// Handle dashboard connections for staff
			socket.on('joinDashboard', () => {
				socket.join('dashboard')
				Log(`${socket.username} joined dashboard room`)
			})

			// Handle dashboard disconnections
			socket.on('leaveDashboard', () => {
				socket.leave('dashboard')
				Log(`${socket.username} left dashboard room`)
			})

			socket.on('sendMessage', async (messageData) => {
				if (messageData.room) {
					const savedMessage = await saveMessage({
						conversationId: messageData.message.conversationId,
						senderId: messageData.message.senderId,
						messageContent: messageData.message.messageContent,
					})
					socket.broadcast
						.to(messageData.room)
						.emit('receiveMessage', messageData.message)
				} else {
					io.emit('receiveMessage', messageData.message)
				}
			})

			socket.on('connectToUser', (recipient) => {
				const room = [socket.username, recipient].sort().join('-')
				io.to(usersSockets[recipient]).emit('receiveInvitation', room)
				io.to(socket.id).emit('receiveInvitation', room)
			})

			socket.on('joinRoom', (room) => {
				socket.room = room
				socket.join(room)
			})

			socket.on('disconnect', () => {
				Log('user disconnected')

				delete usersSockets[socket.username]
			})
		})

		app.get('/', (req, res) => {
			res.json('Congratulations, your server is up and running!')
		})

		// Authentication

		app.post('/login', authenticateApp, alreadyLoggedIn, async (req, res) => {
			const response = await Login(req, res)
			res.status(response.status).json(response.item)
		})

		app.get(
			'/getDataForCreatingClass',
			authenticateApp,
			authenticateToken,
			staffOnly,
			async (req, res) => {
				const response = await getDataForCreatingClass()
				res.status(response.status).json(response.item)
			},
		)

		app.post(
			'/addNewClass',
			authenticateApp,
			authenticateToken,
			staffOnly,
			async (req, res) => {
				const response = await addNewClass({
					studentId: req.body.studentId,
					tutorId: req.body.tutorId,
					className: req.body.className,
					description: req.body.description,
					startDate: req.body.startDate,
					endDate: req.body.endDate,
					schedule: req.body.schedule,
					meetingLink: req.body.meetingLink,
				})
				// Emit dashboard update event
				if (response.status === 200) {
					io.to('dashboard').emit('dashboardUpdate', {
						type: 'addClass',
						data: response.item,
					})
				}

				res.status(response.status).json(response.item)
			},
		)
	})
	.then(() => {
		app.post(
			'/newMeeting',
			authenticateApp,
			authenticateToken,
			async (req, res) => {
				const response = await newMeeting({
					classId: req.body.classId,
					meetingDate: req.body.meetingDate,
					meetingType: req.body.meetingType,
					meetingNotes: req.body.meetingNotes,
					meetingLink: req.body.meetingLink,
					location: req.body.location,
					studentAttended: req.body.studentAttended,
				})
				res.status(response.status).json(response.item)
			},
		)

		app.post(
			'/changeMeetingAttendance',
			authenticateApp,
			authenticateToken,
			studentsNotAllowed,
			async (req, res) => {
				const response = await changeMeetingAttendance({
					meetings: req.body.meetings,
				})
				res.status(response.status).json(response.item)
			},
		)

		app.get(
			'/getUserPublicInfoById/:userId',
			authenticateApp,
			authenticateToken,
			async (req, res) => {
				const response = await getUserPublicInfoById(req.params.userId)
				res.status(response.status).json(response.item)
			},
		)

		app.get(
			'/getClassDetailForSysAdmin/:classId/:userId',
			authenticateApp,
			authenticateToken,
			async (req, res) => {
				const response = await getClassDetailForSysAdmin({
					classId: req.params.classId,
					userId: req.params.userId,
				})
				res.status(response.status).json(response.item)
			},
		)

		app.get(
			'/getMeetingsOfAClass/:classId',
			authenticateApp,
			authenticateToken,
			async (req, res) => {
				const response = await getAllMeetingsOfAClass(req.params.classId)
				res.status(response.status).json(response.item)
			},
		)

		app.delete(
			'/deleteMeeting/:meetingId',
			authenticateApp,
			authenticateToken,
			studentsNotAllowed, // Only tutors should be able to delete meetings
			async (req, res) => {
				try {
					const response = await deleteMeetingById(req.params.meetingId);
					return res.status(response.status).json(response.item);
				} catch (error) {
					console.error('Error in deleteMeeting endpoint:', error);
					return res.status(500).json({ 
						error: error.message || 'Internal server error during meeting deletion'
					});
				}
			},
		)

		app.post(
			'/getMessages',
			authenticateApp,
			authenticateToken,
			async (req, res) => {
				const response = await getMessagesOfConversation({
					conversationId: req.body.conversationId,
					offset: req.body.offset ?? 0,
				})
				res.status(response.status).json(response.item)
			},
		)

		app.post(
			'/getConversation',
			authenticateApp,
			authenticateToken,
			async (req, res) => {
				const response = await getConversation(req.body)
				res.status(response.status).json(response.item)
			},
		)

		app.get(
			'/getClassesForUser/:userId/:role',
			authenticateApp,
			authenticateToken,
			async (req, res) => {
				const response = await getClassesForUser(
					req.params.userId,
					req.params.role,
				)
				res.status(response.status).json(response.item)
			},
		)

		app.get(
			'/getAllClasses',
			authenticateApp,
			authenticateToken,

			async (req, res) => {
				try {
					const response = await getAllClasses()
					if (!response) {
						console.error('getAllClasses returned null/undefined')
						return res.status(500).json({ error: 'Internal server error' })
					}

					res.status(response.status).json(response.item)
				} catch (error) {
					console.error('Error in /getAllClasses endpoint:', error)
					res
						.status(500)
						.json({ error: error.message || 'Internal server error' })
				}
			},
		)

		///////////////////////////////////

		// User functions

		app.get(
			'/getCurrentUser',
			authenticateApp,
			authenticateToken,
			async (req, res) => {
				const response = await getLoggedInUser(req, res)
				res.status(response.status).json(response.item)
			},
		)

		app.get(
			'/getClassById/:classId/:userId/:role',
			authenticateApp,
			authenticateToken,
			async (req, res) => {
				const response = await getClassById({
					classId: req.params.classId,
					userId: req.params.userId,
					role: req.params.role,
				})
				res.status(response.status).json(response.item)
			},
		)

		app.post(
			'/class/reallocate',
			authenticateApp,
			authenticateToken,
			staffOnly,
			async (req, res) => {
				try {
					console.log('Received class reallocation request:', req.body)
					
					const response = await reallocateClass({
						classId: req.body.classId,
						newTutorId: req.body.newTutorId,
						newStudentId: req.body.newStudentId
					})
					
					// Emit dashboard update event if successful
					if (response.status === 200) {
						Log(`Class reallocation successful for class ID ${req.body.classId}`)
						
						// Notify all clients watching the dashboard
						io.to('dashboard').emit('dashboardUpdate', {
							type: 'reallocateClass',
							data: { refresh: true },
							timestamp: new Date().toISOString()
						})
						
						Log(`Dashboard socket update emitted for class reallocation: ${req.body.classId}`)
					} else {
						Log(
							`Class reallocation failed for class ID ${req.body.classId}: ${
								response.item?.error || 'Unknown error'
							}`
						)
					}
					
					res.status(response.status).json(response)
				} catch (error) {
					console.error('Error in class/reallocate endpoint:', error)
					res.status(500).json({ 
						item: { 
							error: error.message || 'Internal server error',
							success: false
						} 
					})
				}
			},
		)

		app.put(
			'/updateClass',
			authenticateApp,
			authenticateToken,
			staffOnly,
			async (req, res) => {
				const response = await updateClass({
					classId: req.body.classId,
					className: req.body.className,
				})

				// Emit dashboard update event
				if (response.status === 200) {
					io.to('dashboard').emit('dashboardUpdate', {
						type: 'updateClass',
						data: response.item,
					})
				}

				res.status(response.status).json(response.item)
			},
		)

		app.delete(
			'/deleteClass',
			authenticateApp,
			authenticateToken,
			staffOnly,
			async (req, res) => {
				try {
					if (!req.body || !req.body.classId) {
						return res.status(400).json({ error: 'classId is required' })
					}

					const response = await deleteClass({
						classId: req.body.classId,
					})

					// Emit dashboard update event
					if (response.status === 200) {
						io.to('dashboard').emit('dashboardUpdate', {
							type: 'deleteClass',
							data: { classId: req.body.classId },
						})
					}

					return res
						.status(response.status)
						.json(response.message || response.error || response.item || {})
				} catch (error) {
					console.error('Error in deleteClass endpoint:', error)
					return res
						.status(500)
						.json({ error: error.message || 'Internal server error' })
				}
			},
		)

		// Posts and Comments endpoints
		app.post(
			'/createPost',
			authenticateApp,
			authenticateToken,
			async (req, res) => {
				const response = await createPost({
					userId: req.body.userId,
					classId: req.body.classId,
					title: req.body.title,
					postContent: req.body.postContent,
				})
				res.status(response.status).json(response.item)
			},
		)

		// Get posts by class ID
		app.get(
			'/getPostsByClassId/:classId',
			authenticateApp,
			authenticateToken,
			async (req, res) => {
				try {
					const response = await getPostsByClassId(req.params.classId)
					res.status(response.status).json(response.item)
				} catch (error) {
					console.error('Error in getPostsByClassId endpoint:', error)
					res.status(500).json({ message: 'Failed to get posts' })
				}
			},
		)

		// Get post by ID
		app.get(
			'/getPostById/:postId',
			authenticateApp,
			authenticateToken,
			async (req, res) => {
				try {
					const response = await getPostById(req.params.postId)
					res.status(response.status).json(response.item)
				} catch (error) {
					console.error('Error in getPostById endpoint:', error)
					res.status(500).json({ message: 'Failed to get post' })
				}
			},
		)

		// Update post
		app.put(
			'/updatePost',
			authenticateApp,
			authenticateToken,
			async (req, res) => {
				try {
					const response = await updatePost({
						postId: req.body.postId,
						userId: req.body.userId,
						title: req.body.title,
						postContent: req.body.postContent,
					})
					res.status(response.status).json(response.item)
				} catch (error) {
					console.error('Error in updatePost endpoint:', error)
					res.status(500).json({ message: 'Failed to update post' })
				}
			},
		)

		// Delete post
		app.delete(
			'/deletePost/:postId/:userId',
			authenticateApp,
			authenticateToken,
			async (req, res) => {
				try {
					const response = await deletePost({
						postId: req.params.postId,
						userId: req.params.userId,
					})
					res.status(response.status).json(response.item)
				} catch (error) {
					console.error('Error in deletePost endpoint:', error)
					res.status(500).json({ message: 'Failed to delete post' })
				}
			},
		)

		// Create comment
		app.post(
			'/createComment',
			authenticateApp,
			authenticateToken,
			async (req, res) => {
				try {
					const response = await createComment({
						postId: req.body.postId,
						userId: req.body.userId,
						commentContent: req.body.commentContent,
					})
					res.status(response.status).json(response.item)
				} catch (error) {
					console.error('Error in createComment endpoint:', error)
					res.status(500).json({ message: 'Failed to create comment' })
				}
			},
		)

		// Get comments by post ID
		app.get(
			'/getCommentsByPostId/:postId',
			authenticateApp,
			authenticateToken,
			async (req, res) => {
				try {
					const response = await getCommentsByPostId(req.params.postId)
					res.status(response.status).json(response.item)
				} catch (error) {
					console.error('Error in getCommentsByPostId endpoint:', error)
					res.status(500).json({ message: 'Failed to get comments' })
				}
			},
		)

		// Update comment
		app.put(
			'/updateComment',
			authenticateApp,
			authenticateToken,
			async (req, res) => {
				try {
					const response = await updateComment({
						commentId: req.body.commentId,
						userId: req.body.userId,
						commentContent: req.body.commentContent,
					})
					res.status(response.status).json(response.item)
				} catch (error) {
					console.error('Error in updateComment endpoint:', error)
					res.status(500).json({ message: 'Failed to update comment' })
				}
			},
		)

		// Delete comment
		app.delete(
			'/deleteComment/:commentId/:userId',
			authenticateApp,
			authenticateToken,
			async (req, res) => {
				try {
					const response = await deleteComment({
						commentId: req.params.commentId,
						userId: req.params.userId,
					})
					res.status(response.status).json(response.item)
				} catch (error) {
					console.error('Error in deleteComment endpoint:', error)
					res.status(500).json({ message: 'Failed to delete comment' })
				}
			},
		)

		server.listen(PORT, () => console.log(`listening on port ${PORT}`))
	})
