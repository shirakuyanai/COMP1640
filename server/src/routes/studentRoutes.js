import express from 'express';
import { reassignStudents } from '../controllers/studentController.js';

const router = express.Router();
router.post('/reassign', reassignStudents);
export default router;
