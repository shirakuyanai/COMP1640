import { uuid, text, pgTable, timestamp, unique } from 'drizzle-orm/pg-core'
import Tutor from './Tutor.js'
import Student from './Student.js'

const Document = pgTable('document', {
	documentId: uuid('documentId').defaultRandom().unique().primaryKey(),
	tutorId: uuid('tutorId')
		.references(() => Tutor.tutorId)
		.notNull(),
	studentId: uuid('studentId')
		.references(() => Student.studentId)
		.notNull(),
	documentName: text('documentName').notNull(),
	filePath: text('filePath').notNull(),
	uploadDate: timestamp('uploadDate', { withTimezone: true })
		.notNull()
		.defaultNow(),
})

export default Document
