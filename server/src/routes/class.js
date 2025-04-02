import express from 'express'
import { authenticateToken, authenticateApp } from '../middleware/auth.js'
import { reallocateClass, addNewClass, getClassesForUser } from '../db/class.js'

const router = express.Router()

// Get student classes
router.get('/student/:id', authenticateApp, authenticateToken, async (req, res) => {
	try {
		const userId = req.params.id
		const result = await getClassesForUser(userId, 'student')

		if (result.error) {
			return res.status(result.status).json({ error: result.error })
		}

		res.status(result.status).json(result.item)
	} catch (error) {
		console.error('Error in /student/:id endpoint:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
})

// Get tutor classes
router.get('/tutor/:id', authenticateApp, authenticateToken, async (req, res) => {
	try {
		const userId = req.params.id
		const result = await getClassesForUser(userId, 'tutor')

		if (result.error) {
			return res.status(result.status).json({ error: result.error })
		}

		res.status(result.status).json(result.item)
	} catch (error) {
		console.error('Error in /tutor/:id endpoint:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
})

// Add new class route
router.post('/addNewClass', authenticateToken, async (req, res) => {
	try {
		const { className, studentId, tutorId, startDate, endDate, schedule } = req.body

		if (!className || !studentId || !tutorId || !startDate || !endDate || !schedule) {
			return res.status(400).json({ error: 'Missing required fields' })
		}

		const result = await addNewClass({
			className,
			studentId,
			tutorId,
			startDate,
			endDate,
			schedule
		})

		res.status(result.status).json(result.item)
	} catch (error) {
		console.error('Error in /addNewClass endpoint:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
})

// Reallocate class route
router.post('/reallocate', authenticateToken, async (req, res) => {
	try {
		const { classId, newStudentId, newTutorId } = req.body

		if (!classId) {
			return res.status(400).json({ error: 'Class ID is required' })
		}

		const result = await reallocateClass({ classId, newStudentId, newTutorId })

		res.status(result.status).json(result.item)
	} catch (error) {
		console.error('Error in /reallocate endpoint:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
})

export default router 