import {
	uuid,
	text,
	pgTable,
	pgEnum,
	timestamp,
	boolean,
	unique,
	integer,
} from 'drizzle-orm/pg-core'

import Class from './Class.js'

// Define the ENUM type separately
export const meetingTypeEnum = pgEnum('meetingType', ['in-person', 'online'])

export const Meeting = pgTable('meeting', {
	meetingId: uuid('meetingId').defaultRandom().unique().primaryKey(),
	classId: uuid('classId').references(() => Class.id),
	meetingDate: timestamp('meetingDate', { withTimezone: true }).notNull(),
	meetingType: meetingTypeEnum('meetingType').notNull(), // Use the defined ENUM
	meetingNotes: text('meetingNotes'),
	meetingLink: text('meetingLink'),
	location: text('location'),
	studentAttended: integer('studentAttended').default(0).notNull(),
	// 0: not yet
	// 1: attended
	// 2: absent
})
