import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import { reallocateClass } from '../db/class.js'
import { verifyToken } from '../middleware/auth.js'
import { verifyAPIKey } from '../middleware/apikey.js'
import {
	getAllClasses,
	getClassesForUser,
	getClassById,
	getDataForCreatingClass,
	addNewClass,
	updateClass,
	deleteClass,
} from '../db/class.js'

const router = express.Router()

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

// Get all classes
router.get('/getAllClasses', verifyAPIKey, verifyToken, async (req, res) => {
	const result = await getAllClasses()
	res.status(result.status).json(result)
})

// Get classes for a user
router.get('/getClassesForUser/:userId/:role', verifyAPIKey, verifyToken, async (req, res) => {
	const result = await getClassesForUser(req.params.userId, req.params.role)
	res.status(result.status).json(result.item)
})

// Get class by ID
router.get('/getClassById/:id', verifyAPIKey, verifyToken, async (req, res) => {
	const result = await getClassById({
		classId: req.params.id,
		userId: req.user.id,
		role: req.user.role,
	})
	res.status(result.status).json(result)
})

// Get data for creating class
router.get(
	'/getDataForCreatingClass',
	verifyAPIKey,
	verifyToken,
	async (req, res) => {
		const result = await getDataForCreatingClass()
		res.status(result.status).json(result)
	},
)

// Add new class
router.post('/addNewClass', verifyAPIKey, verifyToken, async (req, res) => {
	const result = await addNewClass(req.body)
	res.status(result.status).json(result)
})

// Update class
router.put('/updateClass', verifyAPIKey, verifyToken, async (req, res) => {
	const result = await updateClass(req.body)
	res.status(result.status).json(result)
})

// Delete class
router.delete('/deleteClass', verifyAPIKey, verifyToken, async (req, res) => {
	const result = await deleteClass(req.body.classId)
	res.status(result.status).json(result)
})

export default router 