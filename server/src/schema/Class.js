import { uuid, pgTable, text, unique, timestamp } from 'drizzle-orm/pg-core'
import Tutor from './Tutor.js'
import Student from './Student.js'

const Class = pgTable('class', {
	id: uuid('id').defaultRandom().unique().primaryKey(),
	className: text('className').notNull(),
	studentId: uuid('studentId')
		.references(() => Student.studentId)
		.notNull(),
	tutorId: uuid('tutorId')
		.references(() => Tutor.tutorId)
		.notNull(),
	startDate: timestamp('startDate'),
	endDate: timestamp('endDate')
})

export default Class
