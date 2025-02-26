import {
	uuid,
	text,
	pgTable,
	timestamp,
	pgEnum,
	primaryKey,
} from 'drizzle-orm/pg-core'
import User from './User.js'
import Post from './Post.js'

const Comment = pgTable('comment', {
	commentId: uuid('commentId').defaultRandom().primaryKey(),
	postId: uuid('postId')
		.references(() => Post.postId)
		.notNull(),
	userId: uuid('userId')
		.references(() => User.userId)
		.notNull(),
	commentContent: text('commentContent').notNull(),
	commentDate: timestamp('commentDate', { withTimezone: true })
		.notNull()
		.defaultNow(),
})

export default Comment
