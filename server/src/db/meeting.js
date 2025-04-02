import { eq } from 'drizzle-orm'
import { db } from '../config/db_config.js'
import { logError } from '../lib/logger.js'
import { Meeting } from '../schema/Meeting.js'
import Class from '../schema/Class.js'
import Tutor from '../schema/Tutor.js'

export const getAllMeetingsOfAClass = async (classId) => {
	try {
		const meetings = await db
			.select()
			.from(Meeting)
			.where(eq(Meeting.classId, classId))

		if (meetings.length === 0) {
			logError('get all meetings of a class', 'No meetings found')
			return {
				status: 404,
				item: 'No meetings found',
			}
		}

		const this_class = await db
			.select()
			.from(Class)
			.where(eq(Class.id, classId))

		if (this_class.length === 0) {
			logError('get all meetings of a class', 'Invalid class')
			return {
				status: 404,
				item: 'Invalid class',
			}
		}

		const tutor = await db
			.select()
			.from(Tutor)
			.where(eq(Tutor.tutorId, this_class[0].tutorId))

		if (tutor.length === 0) {
			logError('get all meetings of a class', 'Invalid tutor')
			return {
				status: 404,
				item: 'Invalid tutor',
			}
		}

		const processed_meetings = meetings.map((meeting) => ({
			meetingDate: new Date(meeting.meetingDate).toLocaleString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
			}),
			meetingType: meeting.meetingType,
			meetingLink: meeting.meetingLink,
			location: meeting.location,
			meetingNote: meeting.meetingNotes,
			studentAttended: meeting.studentAttended,
		}))

		console.log(processed_meetings)

		return { status: 200, item: processed_meetings }
	} catch (err) {
		logError('get all meetings of a class', err)
		return {
			status: 500,
			item: err,
		}
	}
}

export const newMeeting = async ({
	classId,
	meetingDate,
	meetingType,
	meetingNote,
	meetingLink,
	location,
	studentAttended,
}) => {
	try {
		console.log({
			classId,
			meetingDate,
			meetingType,
			meetingNote,
			meetingLink,
			location,
			studentAttended,
		})
		const newMeeting = await db
			.insert(Meeting)
			.values({
				classId,
				meetingDate: new Date(meetingDate),
				meetingType,
				meetingNote: meetingNote ? meetingNote : null,
				meetingLink: meetingLink ? meetingLink : null,
				location: location ? location : null,
				studentAttended,
			})
			.returning()

		if (newMeeting.length === 0) {
			logError('create a new meeting', 'Failed to create a new meeting')
			return {
				status: 500,
				item: 'Failed to create a new meeting',
			}
		}

		return { status: 200, item: newMeeting }
	} catch (err) {
		logError('create a new meeting', err)
		return {
			status: 500,
			item: err,
		}
	}
}
