import { db } from '../config/db_config.js'
import { logError } from '../lib/logger.js'
import { Meeting } from '../schema/Meeting.js'

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
