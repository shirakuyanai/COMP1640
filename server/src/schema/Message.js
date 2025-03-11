import {
	uuid,
	text,
	pgTable,
	timestamp,
	pgEnum,
	primaryKey,
	unique,
} from 'drizzle-orm/pg-core'
import User from './User.js'
import Conversation from './Conversation.js'

const Message = pgTable('message', {
	messageId: uuid('messageId').defaultRandom().unique().primaryKey(),
	conversationId: uuid('conversationId')
		.references(() => Conversation.id)
		.notNull(),
	senderId: uuid('senderId')
		.references(() => User.userId)
		.notNull(),
	messageContent: text('messageContent').notNull(),
	sendDate: timestamp('sendDate', { withTimezone: true })
		.notNull()
		.defaultNow(),
})

export default Message
