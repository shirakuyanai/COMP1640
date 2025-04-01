import jwt from 'jsonwebtoken'
import { Log } from '../lib/logger.js'

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authentication']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ error: 'Access token required' })
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET_KEY)
        req.user = user
        next()
    } catch (error) {
        Log('Token verification failed:', error)
        return res.status(403).json({ error: 'Invalid or expired token' })
    }
}

export const authenticateApp = (req, res, next) => {
    const apiKey = req.headers['api']

    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({ error: 'Invalid API key' })
    }

    next()
}

export const staffOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'staff') {
        return res.status(403).json({ error: 'Staff access required' })
    }
    next()
}

export const alreadyLoggedIn = (req, res, next) => {
    const token = req.headers['authentication']?.split(' ')[1]
    if (token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET_KEY)
            return res.status(400).json({ error: 'User is already logged in' })
        } catch (error) {
            // Token is invalid, continue with login
        }
    }
    next()
} 