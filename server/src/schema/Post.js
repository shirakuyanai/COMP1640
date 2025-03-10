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

const Post = pgTable('post', {
	postId: uuid('postId').defaultRandom().unique().primaryKey(),
	userId: uuid('userId')
		.references(() => User.userId)
		.notNull(),
	postContent: text('postContent').notNull(),
	postDate: timestamp('postDate', { withTimezone: true })
		.notNull()
		.defaultNow(),
})

export default Post
