import { z } from 'zod'
import { differenceInMonths, differenceInYears } from 'date-fns'

export const addClassSchema = z
	.object({
		className: z.string().min(1, 'Required'),
		studentId: z.string().min(1, 'Required'),
		tutorId: z.string().min(1, 'Required'),
		startDate: z.string(),
		endDate: z.string(),
	})
	.superRefine((data, ctx) => {
		alert(data.startDate)
		const startDateTime = new Date(data.startDate)
		const endDateTime = new Date(data.endDate)
		const now = new Date()

		if (
			now > startDateTime ||
			differenceInYears(startDateTime, now) > 1 ||
			differenceInYears(startDateTime, now) < -1
		)
			ctx.addIssue({
				code: 'custom',
				message: 'Start date must be in the future and within 1 year from now.',
				path: ['startDate'],
			})

		const monthsApart = differenceInMonths(endDateTime, startDateTime)

		if (monthsApart < 2 && startDateTime < endDateTime)
			ctx.addIssue({
				code: 'custom',
				message: 'End date must be at least 2 months after start date.',
				path: ['endDate'],
			})

		if (
			now > endDateTime ||
			differenceInYears(endDateTime, now) > 1 ||
			differenceInYears(endDateTime, now) < -1
		)
			ctx.addIssue({
				code: 'custom',
				message: 'End date must be in the future and within 1 year from now.',
				path: ['endDate'],
			})
	})
