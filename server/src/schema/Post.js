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
import Class from './Class.js'

const Post = pgTable('post', {
	postId: uuid('postId').defaultRandom().unique().primaryKey(),
	userId: uuid('userId')
		.references(() => User.userId)
		.notNull(),
	classId: uuid('classId')
		.references(() => Class.id)
		.notNull(),
	title: text('title').notNull(),
	postContent: text('postContent').notNull(),
	postDate: timestamp('postDate', { withTimezone: true })
		.notNull()
		.defaultNow(),
})

export default Post
