import express from 'express';
import { createMeeting, getMeetings, updateMeeting, deleteMeeting } from '../controllers/meetingController.js';

const router = express.Router();
router.post('/meetings', createMeeting);
router.get('/meetings', getMeetings);
router.put('/meetings/:id', updateMeeting);
router.delete('/meetings/:id', deleteMeeting);
export default router;
