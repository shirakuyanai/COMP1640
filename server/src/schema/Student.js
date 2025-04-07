import { uuid, pgTable, unique } from 'drizzle-orm/pg-core'
import User from './User.js'
import Tutor from './Tutor.js'

const Student = pgTable('student', {
	studentId: uuid('studentId').defaultRandom().unique().primaryKey(),
	userId: uuid('userId')
		.references(() => User.userId)
		.notNull(),
})
export default Student
