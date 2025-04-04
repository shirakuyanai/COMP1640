import express from 'express'
import cors from 'cors'
import postRouter from './routes/post.js'

const app = express()

// Enable CORS for all routes
app.use(cors())

// Parse JSON bodies
app.use(express.json())

// Routes
app.use('/post', postRouter)

export default app 