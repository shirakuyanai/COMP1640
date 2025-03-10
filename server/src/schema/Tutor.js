import { uuid, pgTable, text, primaryKey, unique } from 'drizzle-orm/pg-core'
import User from './User.js'

const Tutor = pgTable('tutor', {
	tutorId: uuid('tutorId').defaultRandom().unique().primaryKey(),
	userId: uuid('userId')
		.references(() => User.userId)
		.notNull(),
})
export default Tutor
