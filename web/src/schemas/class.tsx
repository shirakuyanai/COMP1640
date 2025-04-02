import { z } from 'zod'

const scheduleSchema = z.object({
	days: z.array(z.string()),
	times: z.array(z.string())
})

export const addClassSchema = z.object({
	className: z.string().min(1, 'Required'),
	studentId: z.string().min(1, 'Required'),
	tutorId: z.string().min(1, 'Required'),
	description: z.string().optional(),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	schedule: scheduleSchema.optional(),
	meetingLink: z.string().url('Must be a valid URL').optional()
})
