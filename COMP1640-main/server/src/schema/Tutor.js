import { uuid, pgTable, text, primaryKey } from 'drizzle-orm/pg-core'
import User from './User.js'

const Tutor = pgTable('tutor', {
	tutorId: uuid('tutorId').defaultRandom().primaryKey(),
	userId: uuid('userId')
		.references(() => User.userId)
		.notNull(),
})
export default Tutor
