import { z } from 'zod'

export const loginInfoSchema = z.object({
	username: z.string().min(1, 'Required'),
	password: z.string().min(1, 'Required'),
})
