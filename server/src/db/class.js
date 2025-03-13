import { db } from '../config/db_config.js'
import Student from '../schema/Student.js'
import Tutor from '../schema/Tutor.js'
import Class from '../schema/Class.js'
import { Log, logError } from '../lib/logger.js'
import { and, eq } from 'drizzle-orm'
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

export const getAllClasses = async () => {
	try {
		const data = await db.select().from(Class)
		Log('got all classes')
		return { status: 200, item: data }
	} catch (err) {
		logError('get all classes', err)
		return { status: 500, error: err }
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

export const addNewClass = async ({ studentId, tutorId, className }) => {
	if (!studentId || !tutorId || !className)
		return { status: 400, error: 'Missing required fields' }

	try {
		const newRow = await db
			.insert(Class)
			.values({ studentId, tutorId, className })
			.onConflictDoNothing()
			.returning()

		Log('new class added')
		return { status: 200, item: newRow }
	} catch (err) {
		logError('add new class', err)
		return { status: 500, item: err }
	}
}
