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
} from './lib/auth.js'
import { addNewClass, getDataForCreatingClass } from './db/class.js'
import { getLoggedInUser } from './db/user.js'

// Connect to the database first, then do everything else later
connectToDatabase().then(() => {
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
			})
			res.status(response.status).json(response.item)
		},
	)

	//....

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

	//....

	app.listen(PORT, () => console.log(`listening on port ${PORT}`))
})
