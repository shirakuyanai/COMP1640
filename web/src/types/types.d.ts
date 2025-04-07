interface StudentType {
	studentId: string
	userId: string
	username: string
}

interface TutorType {
	tutorId: string
	userId: string
	username: string
}

interface MeetingType {
	meetingId: string
	meetingDate: string
	meetingType: string
	meetingLink: string
	location: string
	meetingNotes: string
	studentAttended: number
}
