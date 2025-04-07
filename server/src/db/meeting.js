import { eq } from 'drizzle-orm'
import { db } from '../config/db_config.js'
import { logError } from '../lib/logger.js'
import { Meeting } from '../schema/Meeting.js'
import Class from '../schema/Class.js'
import Tutor from '../schema/Tutor.js'

export const getAllMeetingsOfAClass = async (classId) => {
	try {
		const meetings = await db
			.select({
				meetingId: Meeting.meetingId,
				classId: Meeting.classId,
				meetingDate: Meeting.meetingDate,
				meetingType: Meeting.meetingType,
				meetingNotes: Meeting.meetingNotes,
				meetingLink: Meeting.meetingLink,
				location: Meeting.location,
				studentAttended: Meeting.studentAttended
			})
			.from(Meeting)
			.where(eq(Meeting.classId, classId))

		if (meetings.length === 0) {
			return {
				status: 200,
				item: []
			}
		}

		const this_class = await db
			.select({
				id: Class.id,
				className: Class.className,
				tutorId: Class.tutorId,
				studentId: Class.studentId,
				startDate: Class.startDate,
				endDate: Class.endDate
			})
			.from(Class)
			.where(eq(Class.id, classId))

		if (this_class.length === 0) {
			return {
				status: 200,
				item: []
			}
		}

		const tutor = await db
			.select({
				tutorId: Tutor.tutorId
			})
			.from(Tutor)
			.where(eq(Tutor.tutorId, this_class[0].tutorId))

		if (tutor.length === 0) {
			return {
				status: 200,
				item: []
			}
		}

		const processed_meetings = meetings.map((meeting) => ({
			meetingId: meeting.meetingId,
			classId: meeting.classId,
			meetingDate: new Date(meeting.meetingDate).toLocaleString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
			}),
			meetingType: meeting.meetingType,
			meetingLink: meeting.meetingLink || null,
			location: meeting.location || null,
			meetingNotes: meeting.meetingNotes || null,
			studentAttended: meeting.studentAttended
		}))

		return { status: 200, item: processed_meetings }
	} catch (err) {
		console.error('Error in getAllMeetingsOfAClass:', err)
		return {
			status: 500,
			item: []
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
				meetingNotes: meetingNote ? meetingNote : null,
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

export const changeMeetingAttendance = async ({ meetings }) => {
	try {
		for (let i = 0; i < meetings.length; i++) {
			const meeting = await db
				.update(Meeting)
				.set({ studentAttended: meetings[i].status })
				.where(eq(Meeting.meetingId, meetings[i].meetingId))
				.returning()

			if (meeting.length === 0) {
				logError(
					'change meeting attendance',
					'Failed to change meeting attendance',
				)
				return {
					status: 500,
					item: 'Failed to change meeting attendance',
				}
			}
		}

		return { status: 200, item: 'Attendance status updated successfully' }
	} catch (err) {
		logError('change meeting attendance', err)
		return {
			status: 500,
			item: err,
		}
	}
}

export const deleteMeetingsByClassId = async (classId) => {
	try {
		// First check if there are any meetings for this class
		const meetings = await db
			.select({
				meetingId: Meeting.meetingId
			})
			.from(Meeting)
			.where(eq(Meeting.classId, classId));
		
		if (meetings.length === 0) {
			// No meetings found for this class
			return { 
				status: 200, 
				item: { 
					message: 'No meetings to delete', 
					count: 0 
				} 
			};
		}

		// Delete all meetings for this class
		const deletedMeetings = await db
			.delete(Meeting)
			.where(eq(Meeting.classId, classId))
			.returning();

		return { 
			status: 200, 
			item: { 
				message: 'All meetings deleted successfully', 
				count: deletedMeetings.length 
			} 
		};
	} catch (error) {
		console.error('Error in deleteMeetingsByClassId:', error);
		logError('delete meetings by class ID', error);
		return {
			status: 500,
			error: error.message || 'Failed to delete meetings'
		};
	}
}
