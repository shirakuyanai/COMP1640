import {
	uuid,
	text,
	pgTable,
	timestamp,
	pgEnum,
	primaryKey,
} from 'drizzle-orm/pg-core'
import User from './User.js'

const Conversation = pgTable('conversation', {
	conversationId: uuid('conversationId').defaultRandom().primaryKey(),
	user1Id: uuid('user1Id')
		.references(() => User.userId)
		.notNull(),
	user2Id: uuid('user2Id')
		.references(() => User.userId)
		.notNull(),
})

export default Conversation
