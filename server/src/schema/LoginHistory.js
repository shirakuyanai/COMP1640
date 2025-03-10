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

const LoginHistory = pgTable('login_history', {
	loginId: uuid('loginId').defaultRandom().unique().primaryKey(),
	userId: uuid('userId')
		.references(() => User.userId)
		.notNull(),
	loginDate: timestamp('loginDate', { withTimezone: true })
		.notNull()
		.defaultNow(),
})

export default LoginHistory
