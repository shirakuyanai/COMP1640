import { db } from '../config/db_config.js'
import { eq } from 'drizzle-orm'
import Class from '../schema/Class.js'
import Student from '../schema/Student.js'
import Tutor from '../schema/Tutor.js'
import { Log, logError } from '../lib/logger.js'
import User from '../schema/User.js'

export const getAllStudents = async () => {
	try {
		const data = await db.select().from(Student)
		Log('got all students')
		return { status: 200, item: data }
	} catch (err) {
		logError('get all students', err)
		return { status: 500, error: err }
	}
}

export const getAllTutors = async () => {
	try {
		const data = await db.select().from(Tutor)
		Log('got all tutors')
		return { status: 200, item: data }
	} catch (err) {
		logError('get all tutors', err)
		return { status: 500, error: err }
	}
}

export async function getAllClasses() {
	try {
		console.log('Starting getAllClasses...')
		
		// Get all classes first
		const classes = await db
			.select({
				id: Class.id,
				className: Class.className,
				studentId: Class.studentId,
				tutorId: Class.tutorId,
				description: Class.description,
				startDate: Class.startDate,
				endDate: Class.endDate,
				schedule: Class.schedule,
				meetingLink: Class.meetingLink,
			})
			.from(Class)
			.execute()

		console.log('Retrieved classes:', classes)

		if (!classes) {
			console.error('No classes found')
			return {
				status: 200,
				item: []
			}
		}

		// Get student and tutor details for each class
		const classesWithDetails = await Promise.all(
			classes.map(async (classItem) => {
				try {
					// Get student details with username from User table
					const student = await db
						.select({
							username: User.username,
						})
						.from(Student)
						.innerJoin(User, eq(Student.userId, User.userId))
						.where(eq(Student.studentId, classItem.studentId))
						.execute()

					// Get tutor details with username from User table
					const tutor = await db
						.select({
							username: User.username,
						})
						.from(Tutor)
						.innerJoin(User, eq(Tutor.userId, User.userId))
						.where(eq(Tutor.tutorId, classItem.tutorId))
						.execute()

					return {
						...classItem,
						studentUsername: student[0]?.username || 'Unknown',
						tutorUsername: tutor[0]?.username || 'Unknown',
					}
				} catch (error) {
					console.error('Error getting details for class:', classItem.id, error)
					return {
						...classItem,
						studentUsername: 'Unknown',
						tutorUsername: 'Unknown',
					}
				}
			})
		)

		console.log('Classes with details:', classesWithDetails)

		return {
			status: 200,
			item: classesWithDetails || [],
		}
	} catch (error) {
		console.error('Error in getAllClasses:', error)
		return {
			status: 500,
			item: { error: error.message || 'Failed to fetch classes' },
		}
	}
}

export const getClassOfStudentAndTutor = async ({ studentId, tutorId }) => {
	try {
		const data = await db
			.select()
			.from(Class)
			.where(and(eq(Class.studentId, studentId), eq(Class.tutorId, tutorId)))
		Log('class found with user')
		return { status: 200, item: data }
	} catch (err) {
		logError('find class with user', err)
		return { status: 500, error: err }
	}
}

export const getClassesForUser = async (userId, role) => {
	if (role !== 'student' && role !== 'tutor') {
		logError('get classes for user', 'invalid role')
		return { status: 400, error: 'invalid role' }
	}
	try {
		let user = null
		switch (role) {
			case 'student': {
				user = await db.select().from(Student).where(eq(Student.userId, userId))
				break
			}
			case 'tutor': {
				user = await db.select().from(Tutor).where(eq(Tutor.userId, userId))
				break
			}
			default: {
				return { status: 404, error: 'invalid user' }
			}
		}

		if (!user || user.length === 0) {
			logError('get classes for user', 'invalid user')
			return { status: 404, error: 'invalid user' }
		}

		const user_user = await db
			.select()
			.from(User)
			.where(eq(User.userId, userId))

		if (!user_user || user_user.length === 0) {
			logError('get classes for user', 'invalid user')
			return { status: 404, error: 'invalid user' }
		}

		let data = await db
			.select()
			.from(Class)
			.where(
				role === 'student'
					? eq(Class.studentId, user[0].studentId)
					: eq(Class.tutorId, user[0].tutorId),
			)

		if (!data || data.length === 0) {
			logError('find classes with user', 'classes not found')
			return { status: 404, error: 'classes not found' }
		}

		let user2 = null
		switch (role) {
			case 'student': {
				user2 = await db
					.select()
					.from(Tutor)
					.where(eq(Tutor.tutorId, data[0].tutorId))
				break
			}
			case 'tutor': {
				user2 = await db
					.select()
					.from(Student)
					.where(eq(Student.studentId, data[0].studentId))
				break
			}
			default: {
				return { status: 404, error: 'invalid user' }
			}
		}

		if (!user2 || user2.length === 0) {
			logError('get classes for user', 'invalid user')
			return { status: 404, error: 'invalid user' }
		}
		const user2_user = await db
			.select()
			.from(User)
			.where(eq(User.userId, user2[0].userId))

		if (!user2_user || user2_user.length === 0) {
			logError('get classes for user', 'invalid user')
			return { status: 404, error: 'invalid user' }
		}

		const updatedData = data.map((current_class) => ({
			...current_class,
			studentUsername: user_user[0]?.username || 'Unknown Student',
			tutorUsername: user2_user[0]?.username || 'Unknown Tutor',
		}))

		console.log(updatedData) // ✅ Logs transformed data

		Log('classes found with user')

		return {
			status: 200,
			item: updatedData,
		}
	} catch (err) {
		logError('find classes with user', err)
		return { status: 500, error: err }
	}
}

export const getClassById = async ({ classId, userId, role }) => {
	try {
		const data = await db.select().from(Class).where(eq(Class.id, classId))
		if (!data || data.length === 0) {
			logError('find class by id', 'class not found')
			return { status: 404, error: 'class not found' }
		}
		const user =
			role === 'student'
				? await db.select().from(Student).where(eq(Student.userId, userId))
				: await db.select().from(Tutor).where(eq(Tutor.userId, userId))
		if (!user || user.length === 0) {
			logError('find class by id', 'invalid user')
			return { status: 404, error: 'invalid user' }
		}
		switch (role) {
			case 'student': {
				if (data[0].studentId !== user[0].studentId) {
					logError('find class by id', 'invalid user')
					return { status: 404, error: 'invalid user' }
				}
				break
			}
			case 'tutor': {
				if (data[0].tutorId !== user[0].tutorId) {
					logError('find class by id', 'invalid user')
					return { status: 404, error: 'invalid user' }
				}
				break
			}
		}
		Log('class found by id')
		return { status: 200, item: data[0] }
	} catch (err) {
		logError('find class by id', err)
		return { status: 500, error: err }
	}
}

export const getDataForCreatingClass = async () => {
	try {
		const students = []
		const tutors = []
		const students_raw = await db.select().from(Student)
		for (let i = 0; i < students_raw.length; i++) {
			const student = await db
				.select()
				.from(User)
				.where(eq(User.userId, students_raw[i].userId))
				.limit(1)

			if (student && student.length > 0) {
				students.push({ ...students_raw[i], username: student[0].username })
			}
		}

		const tutors_raw = await db.select().from(Tutor)
		for (let i = 0; i < tutors_raw.length; i++) {
			const tutor = await db
				.select()
				.from(User)
				.where(eq(User.userId, tutors_raw[i].userId))
				.limit(1)

			if (tutor && tutor.length > 0) {
				tutors.push({ ...tutors_raw[i], username: tutor[0].username })
			}
		}

		return { status: 200, item: { students, tutors } }
	} catch (err) {
		logError('get data for creating class', err)
		return { status: 500, error: err }
	}
}

export const addNewClass = async ({ studentId, tutorId, className, description, startDate, endDate, schedule, meetingLink }) => {
	try {
		console.log('Received data:', { studentId, tutorId, className, description, startDate, endDate, schedule, meetingLink })
		
		// Validate required fields
		if (!studentId || !tutorId || !className) {
			console.log('Missing required fields:', { studentId, tutorId, className })
			return { status: 400, error: 'Missing required fields' }
		}

		// Validate student exists
		const student = await db.select().from(Student).where(eq(Student.studentId, studentId))
		console.log('Found student:', student)
		if (!student || student.length === 0) {
			return { status: 400, error: 'Invalid student ID' }
		}

		// Validate tutor exists
		const tutor = await db.select().from(Tutor).where(eq(Tutor.tutorId, tutorId))
		console.log('Found tutor:', tutor)
		if (!tutor || tutor.length === 0) {
			return { status: 400, error: 'Invalid tutor ID' }
		}

		// Validate dates if provided
		if (startDate && endDate) {
			const start = new Date(startDate)
			const end = new Date(endDate)
			console.log('Dates:', { start, end })
			if (isNaN(start.getTime()) || isNaN(end.getTime())) {
				return { status: 400, error: 'Invalid date format' }
			}
			if (start > end) {
				return { status: 400, error: 'Start date must be before end date' }
			}
		}

		// Validate schedule if provided
		if (schedule) {
			console.log('Schedule:', schedule)
			if (!Array.isArray(schedule.days) || !Array.isArray(schedule.times)) {
				return { status: 400, error: 'Invalid schedule format' }
			}
		}

		const values = { 
			studentId, 
			tutorId, 
			className,
			description: description || null,
			startDate: startDate ? new Date(startDate) : null,
			endDate: endDate ? new Date(endDate) : null,
			schedule: schedule || null,
			meetingLink: meetingLink || null
		}
		console.log('Inserting values:', values)

		try {
			const newRow = await db
				.insert(Class)
				.values(values)
				.onConflictDoNothing()
				.returning()

			console.log('Insert result:', newRow)

			if (!newRow || newRow.length === 0) {
				return { status: 500, error: 'Failed to create class' }
			}

			Log('new class added')
			return { status: 200, item: newRow[0] }
		} catch (dbError) {
			console.error('Database error:', dbError)
			return { status: 500, error: `Database error: ${dbError.message}` }
		}
	} catch (err) {
		console.error('Error in addNewClass:', err)
		logError('add new class', err)
		return { status: 500, error: `Server error: ${err.message}` }
	}
}

export async function reallocateClass({ classId, newStudentId, newTutorId }) {
	try {
		console.log('Reallocation request:', { classId, newStudentId, newTutorId })

		// Validate that the class exists
		const existingClass = await db
			.select()
			.from(Class)
			.where(eq(Class.id, classId))
			.execute()

		if (!existingClass || existingClass.length === 0) {
			return { status: 404, item: { error: 'Class not found' } }
		}

		// Build update object based on provided values
		const updateObj = {}
		if (newStudentId) {
			// Validate that the student exists
			const student = await db
				.select()
				.from(Student)
				.where(eq(Student.studentId, newStudentId))
				.execute()

			if (!student || student.length === 0) {
				return { status: 404, item: { error: 'Student not found' } }
			}
			updateObj.studentId = newStudentId
		}

		if (newTutorId) {
			// Validate that the tutor exists
			const tutor = await db
				.select()
				.from(Tutor)
				.where(eq(Tutor.tutorId, newTutorId))
				.execute()

			if (!tutor || tutor.length === 0) {
				return { status: 404, item: { error: 'Tutor not found' } }
			}
			updateObj.tutorId = newTutorId
		}

		// If no updates are provided
		if (Object.keys(updateObj).length === 0) {
			return { status: 400, item: { error: 'No changes requested' } }
		}

		// Perform the update
		const result = await db
			.update(Class)
			.set(updateObj)
			.where(eq(Class.id, classId))
			.execute()

		console.log('Update result:', result)
		return { 
			status: 200, 
			item: { 
				success: true, 
				message: 'Class reallocated successfully' 
			} 
		}

	} catch (error) {
		console.error('Error in reallocateClass:', error)
		return { 
			status: 500, 
			item: { 
				error: error.message || 'Failed to reallocate class' 
			} 
		}
	}
}
