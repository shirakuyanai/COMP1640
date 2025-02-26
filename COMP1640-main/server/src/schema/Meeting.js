import { uuid, text, pgTable, pgEnum, timestamp } from 'drizzle-orm/pg-core'

import Tutor from './Tutor.js'
import User from './User.js'

// Define the ENUM type separately
export const meetingTypeEnum = pgEnum('meetingType', ['in-person', 'online'])

export const Meeting = pgTable('meeting', {
	meetingId: uuid('meetingId').defaultRandom().primaryKey(),
	userId: uuid('userId').references(() => User.userId),
	tutorId: uuid('tutorId')
		.references(() => Tutor.tutorId)
		.notNull(),
	meetingDate: timestamp('meetingDate', { withTimezone: true }).notNull(),
	meetingType: meetingTypeEnum('meetingType').notNull(), // Use the defined ENUM
	meetingNotes: text('meetingNotes'),
	meetingLink: text('meetingLink'),
})
