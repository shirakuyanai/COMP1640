// Node.js body parsing middleware.
import bodyParser from 'body-parser'

// ExpressJS framework for HTTP server.
import express from 'express'
const app = express()

// support parsing of application/json type post data.
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())

// CORS import
import cors from 'cors'

// CORS policies
app.use(
	cors({
		origin: JSON.parse(process.env.ALLOWED_HOSTS ?? '[]'),
		credentials: true,
	}),
)
app.enable('trust proxy')

import http from 'http'
const server = http.createServer(app)

import { initSocket } from './lib/socket.js'
const io = initSocket(server)

import { connectToDatabase } from './config/db_config.js'
import {
	alreadyLoggedIn,
	authenticateApp,
	staffOnly,
	authenticateToken,
	Login,
} from './lib/auth.js'

import { Log } from './lib/logger.js'

import {
	addNewClass,
	getClassById,
	getClassesForUser,
	getDataForCreatingClass,
} from './db/class.js'
import { getLoggedInUser } from './db/user.js'
import {
	getConversation,
	getMessagesOfConversation,
	saveMessage,
} from './db/message.js'

import meetingRoutes from './routes/meetings.js'
app.use('/api/meetings', meetingRoutes)

const usersSockets = {}

connectToDatabase().then(() => {
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

		socket.on('offer', (data) => socket.broadcast.emit('offer', data))
		socket.on('answer', (data) => socket.broadcast.emit('answer', data))
		socket.on('ice-candidate', (data) => socket.broadcast.emit('ice-candidate', data))

		socket.on('disconnect', () => {
			Log('user disconnected')
			delete usersSockets[socket.username]
		})
	})

	app.get('/', (req, res) => {
		res.json('Congratulations, your server is up and running!')
	})

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
			})
			res.status(response.status).json(response.item)
		},
	)

	app.post(
		'/getMessages',
		authenticateApp,
		authenticateToken,
		async (req, res) => {
			const response = await getMessagesOfConversation(req.body)
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

    const PORT = process.env.PORT || 5000
	server.listen(PORT, () => console.log(`listening on port ${PORT}`))
})
