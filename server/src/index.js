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
} from './db/class.js'
import { getLoggedInUser } from './db/user.js'
import {
	getConversation,
	getMessagesOfConversation,
	saveMessage,
} from './db/message.js'

import { Server } from 'socket.io'
import http from 'http'
import { Log } from './lib/logger.js'
import {
	changeMeetingAttendance,
	getAllMeetingsOfAClass,
	newMeeting,
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
				res.status(response.status).json(response.item)
			},
		)

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
			'/getMeetingsOfAClass/:classId',
			authenticateApp,
			authenticateToken,
			async (req, res) => {
				const response = await getAllMeetingsOfAClass(req.params.classId)
				res.status(response.status).json(response.item)
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
			staffOnly,
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
				const response = await reallocateClass(req.body)
				res.status(response.status || 200).json(response)
			},
		)

		server.listen(PORT, () => console.log(`listening on port ${PORT}`))
	})
