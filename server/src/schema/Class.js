import { uuid, pgTable, text, unique, timestamp, json } from 'drizzle-orm/pg-core'
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
	description: text('description'),
	startDate: timestamp('startDate'),
	endDate: timestamp('endDate'),
	schedule: json('schedule'),
	meetingLink: text('meetingLink')
})

export default Class
