import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import { reallocateClass } from '../db/class.js'
import { getIO } from '../lib/socket.js'
import { getUpdatedDashboardData } from '../db/dashboard.js'


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

	const updatedDashboardData = await getUpdatedDashboardData() 

	const io = getIO()
	io.emit('dashboardUpdate', updatedDashboardData)

res.json(result)
	} catch (error) {
		console.error('Error in /reallocate endpoint:', error)
		res.status(500).json({ error: 'Internal server error' })
	}
})

router.post('/reallocate', authenticateToken, async (req, res) => {
	try {
	  const { classId, newStudentId, newTutorId } = req.body
  
	  const result = await reallocateClass({ classId, newStudentId, newTutorId })
  
	  if (!result.error) {
		const updatedDashboardData = await getUpdatedDashboardData()
		const io = getIO()
		io.emit('dashboardUpdate', updatedDashboardData)
	  }
  
	  res.json(result)
	} catch (error) {
	  console.error('Error in /reallocate endpoint:', error)
	  res.status(500).json({ error: 'Internal server error' })
	}
  })
  

export default router 