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
		Log('class found with student and tutor')
		return { status: 200, item: data }
	} catch (err) {
		logError('find class with student and tutor', err)
		return { status: 500, error: err }
	}
}

export const getClassById = async (classId) => {
	try {
		const data = await db.select().from(Class).where(eq(Class.id, classId))
		if (!data || data.length === 0) {
			logError('find class by id', 'class not found')
			return { status: 404, error: 'class not found' }
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
