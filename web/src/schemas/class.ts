import { z } from 'zod'

const dateSchema = z.string()
	.min(1, 'Date is required')
	.refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')

export const addClassSchema = z.object({
	className: z.string().min(1, 'Class name is required'),
	studentId: z.string().min(1, 'Student is required'),
	tutorId: z.string().min(1, 'Tutor is required'),
	startDate: dateSchema,
	endDate: dateSchema,
	schedule: z.object({
		days: z.array(z.string()),
		times: z.array(z.string())
	})
}).refine(
	(data) => {
		const startDate = new Date(data.startDate)
		const endDate = new Date(data.endDate)
		return endDate > startDate
	},
	{
		message: "End date must be after start date",
		path: ["endDate"]
	}
)

export type AddClassSchema = z.infer<typeof addClassSchema> 