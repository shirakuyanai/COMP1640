import { z } from 'zod'

export const sendMessageSchema = z.object({
	conversationId: z.string().min(1, 'Required'),
	senderId: z.string().min(1, 'Required'),
	messageContent: z.string().min(1, 'Required'),
})
