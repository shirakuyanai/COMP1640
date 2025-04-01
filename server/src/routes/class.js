import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import { reallocateClass, addNewClass } from '../db/class.js'

const router = express.Router()

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

		if (result.error) {
			return res.status(400).json({ error: result.error })
		}

		res.json(result)
	} catch (error) {
		console.error('Error in /addNewClass endpoint:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
})

router.post('/reallocate', authenticateToken, async (req, res) => {
	try {
		const { classId, newStudentId, newTutorId } = req.body

		if (!classId) {
			return res.status(400).json({ error: 'Class ID is required' })
		}

		const result = await reallocateClass({ classId, newStudentId, newTutorId })

		if (result.error) {
			return res.status(400).json({ error: result.error })
		}

		res.json(result)
	} catch (error) {
		console.error('Error in /reallocate endpoint:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
})

export default router 