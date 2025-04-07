import { db } from '../config/db_config.js'
import { eq, and, inArray } from 'drizzle-orm'
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
				startDate: Class.startDate,
				endDate: Class.endDate
			})
			.from(Class)

		console.log('Found classes:', classes)

		if (!classes || classes.length === 0) {
			console.log('No classes found')
			return { status: 200, item: [] }
		}

		// Get all unique student and tutor IDs from the classes
		const studentIds = [...new Set(classes.map(c => c.studentId))]
		const tutorIds = [...new Set(classes.map(c => c.tutorId))]

		let students = []
		let tutors = []

		// Only fetch if we have IDs to fetch
		if (studentIds.length > 0) {
			students = await db
				.select({
					studentId: Student.studentId,
					username: User.username,
				})
				.from(Student)
				.innerJoin(User, eq(Student.userId, User.userId))
				.where(inArray(Student.studentId, studentIds))
		}

		if (tutorIds.length > 0) {
			tutors = await db
				.select({
					tutorId: Tutor.tutorId,
					username: User.username,
				})
				.from(Tutor)
				.innerJoin(User, eq(Tutor.userId, User.userId))
				.where(inArray(Tutor.tutorId, tutorIds))
		}

		// Create lookup maps
		const studentMap = Object.fromEntries(
			students.map(s => [s.studentId, s.username])
		)
		const tutorMap = Object.fromEntries(
			tutors.map(t => [t.tutorId, t.username])
		)

		// Map the classes with usernames
		const classesWithUsernames = classes.map(classItem => ({
			...classItem,
			studentUsername: studentMap[classItem.studentId] || 'Unknown Student',
			tutorUsername: tutorMap[classItem.tutorId] || 'Unknown Tutor',
		}))

		return { status: 200, item: classesWithUsernames }
	} catch (error) {
		console.error('Error in getAllClasses:', error)
		logError('get all classes', error)
		return { status: 500, error: `Server error: ${error.message}` }
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

		// Get classes for the user
		let classes = await db
			.select({
				id: Class.id,
				className: Class.className,
				studentId: Class.studentId,
				tutorId: Class.tutorId,
				startDate: Class.startDate,
				endDate: Class.endDate
			})
			.from(Class)
			.where(
				role === 'student'
					? eq(Class.studentId, user[0].studentId)
					: eq(Class.tutorId, user[0].tutorId),
			)

		if (!classes || classes.length === 0) {
			return { status: 200, item: [] } // Return empty array instead of error
		}

		// Get all unique student and tutor IDs from the classes
		const studentIds = [...new Set(classes.map(c => c.studentId))]
		const tutorIds = [...new Set(classes.map(c => c.tutorId))]

		let students = []
		let tutors = []

		// Only fetch if we have IDs to fetch
		if (studentIds.length > 0) {
			students = await db
				.select({
					studentId: Student.studentId,
					username: User.username,
				})
				.from(Student)
				.innerJoin(User, eq(Student.userId, User.userId))
				.where(inArray(Student.studentId, studentIds))
		}

		if (tutorIds.length > 0) {
			tutors = await db
				.select({
					tutorId: Tutor.tutorId,
					username: User.username,
				})
				.from(Tutor)
				.innerJoin(User, eq(Tutor.userId, User.userId))
				.where(inArray(Tutor.tutorId, tutorIds))
		}

		// Create lookup maps
		const studentMap = Object.fromEntries(
			students.map(s => [s.studentId, s.username])
		)
		const tutorMap = Object.fromEntries(
			tutors.map(t => [t.tutorId, t.username])
		)

		// Map the classes with usernames
		const classesWithUsernames = classes.map(classItem => ({
			...classItem,
			studentUsername: studentMap[classItem.studentId] || 'Unknown Student',
			tutorUsername: tutorMap[classItem.tutorId] || 'Unknown Tutor',
		}))

		Log('classes found with user')

		return {
			status: 200,
			item: classesWithUsernames,
		}
	} catch (err) {
		console.error('Error in getClassesForUser:', err)
		logError('find classes with user', err)
		return { status: 500, error: err.message || 'Internal server error' }
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

export const addNewClass = async ({ studentId, tutorId, className, startDate, endDate }) => {
	try {
		console.log('Received data:', { studentId, tutorId, className, startDate, endDate })
		
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

		const values = { 
			studentId, 
			tutorId, 
			className,
			startDate: startDate ? new Date(startDate) : null,
			endDate: endDate ? new Date(endDate) : null
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

export const updateClass = async ({ classId, className, startDate, endDate }) => {
	try {
		console.log('Updating class:', { classId, className, startDate, endDate });

		// Validate class exists
		const existingClass = await db
			.select()
			.from(Class)
			.where(eq(Class.id, classId));

		if (!existingClass || existingClass.length === 0) {
			return { status: 404, error: 'Class not found' };
		}

		// Validate dates if provided
		if (startDate && endDate) {
			const start = new Date(startDate);
			const end = new Date(endDate);
			if (isNaN(start.getTime()) || isNaN(end.getTime())) {
				return { status: 400, error: 'Invalid date format' };
			}
			if (start > end) {
				return { status: 400, error: 'Start date must be before end date' };
			}
		}

		// Build update object
		const updateData = {
			...(className && { className }),
			...(startDate && { startDate: new Date(startDate) }),
			...(endDate && { endDate: new Date(endDate) }),
		};

		// Update the class
		const updatedClass = await db
			.update(Class)
			.set(updateData)
			.where(eq(Class.id, classId))
			.returning();

		if (!updatedClass || updatedClass.length === 0) {
			return { status: 500, error: 'Failed to update class' };
		}

		Log('class updated');
		return { status: 200, item: updatedClass[0] };
	} catch (error) {
		console.error('Error in updateClass:', error);
		logError('update class', error);
		return { status: 500, error: error.message || 'Failed to update class' };
	}
};

export const deleteClass = async (classId) => {
	try {
		console.log('Deleting class:', classId);

		// Validate class exists
		const existingClass = await db
			.select()
			.from(Class)
			.where(eq(Class.id, classId));

		if (!existingClass || existingClass.length === 0) {
			return { status: 404, error: 'Class not found' };
		}

		// Delete the class
		const deletedClass = await db
			.delete(Class)
			.where(eq(Class.id, classId))
			.returning();

		if (!deletedClass || deletedClass.length === 0) {
			return { status: 500, error: 'Failed to delete class' };
		}

		Log('class deleted');
		return { status: 200, message: 'Class deleted successfully' };
	} catch (error) {
		console.error('Error in deleteClass:', error);
		logError('delete class', error);
		return { status: 500, error: error.message || 'Failed to delete class' };
	}
};
