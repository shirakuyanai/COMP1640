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
import { alreadyLoggedIn, authenticateApp, Login } from './lib/auth.js'
import studentTutorRoutes from './routes/studentTutorRoutes.js';

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

	//....

	///////////////////////////////////

	// Student-Tutor functions
	app.use('/studentTutor', studentTutorRoutes);

	// User functions

	//....

	app.listen(PORT, () => console.log(`listening on port ${PORT}`))
})
