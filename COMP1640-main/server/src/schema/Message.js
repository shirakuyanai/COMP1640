import {
	uuid,
	text,
	pgTable,
	timestamp,
	pgEnum,
	primaryKey,
} from 'drizzle-orm/pg-core'
import User from './User.js'
import Conversation from './Conversation.js'

const Message = pgTable('message', {
	messageId: uuid('messageId').defaultRandom().primaryKey(),
	conversationId: uuid('conversationId')
		.references(() => Conversation.conversationId)
		.notNull(),
	senderId: uuid('senderId')
		.references(() => User.userId)
		.notNull(),
	recipientId: uuid('recipientId')
		.references(() => User.userId)
		.notNull(),
	messageContent: text('messageContent').notNull(),
	sendDate: timestamp('sendDate', { withTimezone: true })
		.notNull()
		.defaultNow(),
})

export default Message
