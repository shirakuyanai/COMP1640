import { uuid, pgTable, primaryKey, text, unique } from 'drizzle-orm/pg-core'
import User from './User.js'

const Staff = pgTable('staff', {
	staffId: uuid('staffId').defaultRandom().unique().primaryKey(),
	userId: uuid('userId')
		.references(() => User.userId)
		.notNull(),
})
export default Staff
