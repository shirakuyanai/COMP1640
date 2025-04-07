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

const Conversation = pgTable(
	'conversation',
	{
		id: uuid('id').defaultRandom().unique().primaryKey(),
		tutorId: uuid('tutorId')
			.references(() => User.userId)
			.notNull(),
		studentId: uuid('studentId')
			.references(() => User.userId)
			.notNull(),
	},
	(table) => {
		return {
			uniqueTutorStudent: unique().on(table.tutorId, table.studentId),
		}
	},
)

export default Conversation
