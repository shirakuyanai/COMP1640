import express from 'express'
import { db } from '../config/db_config.js'
import { Meeting } from '../schema/Meeting.js'
import { eq } from 'drizzle-orm'

const router = express.Router()

router.get('/', async (req, res) => {
	try {
		const meetings = await db.select().from(Meeting)
		res.json(meetings)
	} catch (err) {
		console.error('GET /meetings error:', err)
		res.status(500).json({ error: 'Failed to fetch meetings' })
	}
})

router.post('/', async (req, res) => {
	try {
		const inserted = await db.insert(Meeting).values({
			userId: req.body.userId,
			tutorId: req.body.tutorId,
			meetingDate: req.body.meetingDate,
			meetingType: req.body.meetingType,
			meetingNotes: req.body.meetingNotes,
			meetingLink: req.body.meetingLink,
			studentAttended: req.body.studentAttended ?? false,
		}).returning()
		res.status(201).json(inserted[0])
	} catch (err) {
		console.error('POST /meetings error:', err)
		res.status(500).json({ error: 'Failed to create meeting' })
	}
})

router.put('/:id', async (req, res) => {
	try {
		const updated = await db
			.update(Meeting)
			.set(req.body)
			.where(eq(Meeting.meetingId, req.params.id))
			.returning()

		res.json(updated[0])
	} catch (err) {
		console.error('PUT /meetings error:', err)
		res.status(500).json({ error: 'Failed to update meeting' })
	}
})

router.delete('/:id', async (req, res) => {
	try {
		await db.delete(Meeting).where(eq(Meeting.meetingId, req.params.id))
		res.json({ message: 'Meeting deleted' })
	} catch (err) {
		console.error('DELETE /meetings error:', err)
		res.status(500).json({ error: 'Failed to delete meeting' })
	}
})

export default router
