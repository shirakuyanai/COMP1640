import { and, eq } from 'drizzle-orm'
import { db } from '../config/db_config.js'
import Class from '../schema/Class.js'
import Tutor from '../schema/Tutor.js'
import Student from '../schema/Student.js'
import Message from '../schema/Message.js'
import User from '../schema/User.js'
import Conversation from '../schema/Conversation.js'
import { Log, logError } from '../lib/logger.js'

export const getMessagesOfConversation = async ({ conversationId }) => {
	if (!conversationId) {
		logError('get messages', 'no conversation id provided')
		return { status: 401, item: 'no conversation id provided' }
	}
	const messages = await getMessages(conversationId)
	if (messages.status === 200) Log('messages found')
	return { status: 200, item: messages.item }
}

export const getConversation = async ({ conversationId, classId }) => {
	if (!conversationId && !classId) {
		logError('get conversation', 'no conversation or class id provided')
		return { status: 401, item: 'no conversation or class id provided' }
	}

	let conversation = null
	if (!conversationId) {
		const found_conversation = await createConversation(classId)
		if (found_conversation.status !== 200) return found_conversation
		conversation = found_conversation.item
	} else {
		const found_conversation = await db
			.select()
			.from(Conversation)
			.where(eq(Conversation.id, conversationId))
		if (!found_conversation || found_conversation.length === 0) {
			logError('get conversation', 'conversation not found')
			return { status: 404, item: 'conversation not found' }
		}
		conversation = found_conversation[0]
	}
	if (!conversation) {
		logError('get conversation', 'conversation not found')
		return { status: 404, item: 'conversation not found' }
	}
	Log('conversation found')
	return { status: 200, item: conversation }
}

export const createConversation = async (classId) => {
	try {
		const found_class = await db
			.select()
			.from(Class)
			.where(eq(Class.id, classId))
		if (!found_class || found_class.length === 0)
			return { status: 400, item: 'invalid class' }

		const student = await db
			.select()
			.from(Student)
			.where(eq(Student.studentId, found_class[0].studentId))

		if (!student || student.length === 0)
			return { status: 400, item: 'invalid student' }

		const student_user = await db
			.select()
			.from(User)
			.where(eq(User.userId, student[0].userId))

		if (!student_user || student_user.length === 0)
			return { status: 400, item: 'invalid student' }

		const tutor = await db
			.select()
			.from(Tutor)
			.where(eq(Tutor.tutorId, found_class[0].tutorId))

		if (!tutor || tutor.length === 0)
			return { status: 400, item: 'invalid tutor' }

		const tutor_user = await db
			.select()
			.from(User)
			.where(eq(User.userId, tutor[0].userId))

		if (!tutor_user || tutor_user.length === 0)
			return { status: 401, item: 'invalid tutor' }

		const existing_conversation = await db
			.select()
			.from(Conversation)
			.where(
				and(
					eq(Conversation.tutorId, tutor_user[0].userId),
					eq(Conversation.studentId, student_user[0].userId),
				),
			)

		if (existing_conversation && existing_conversation.length > 0) {
			Log('conversation found')
			return { status: 200, item: existing_conversation[0] }
		}

		const conversation = await db
			.insert(Conversation)
			.values({
				studentId: student_user[0].userId,
				tutorId: tutor_user[0].userId,
			})
			.onConflictDoNothing()
			.returning()

		if (!conversation || conversation.length === 0) {
			logError('create a new conversation', 'conversation not created')
			return { status: 401, item: 'conversation not created' }
		}
		Log('conversation created')
		return { status: 200, item: conversation[0] }
	} catch (err) {
		logError('create a new conversation', err)
		return { status: 500, item: err }
	}
}

const getMessages = async (conversationId) => {
	try {
		const messages = await db
			.select()
			.from(Message)
			.where(eq(Message.conversationId, conversationId))
			.orderBy(Message.sendDate)

		if (!messages || messages.length === 0) {
			Log('no messages found')
			return { status: 200, item: [] }
		}

		Log('messages found')
		return { status: 200, item: messages }
	} catch (err) {
		logError('get messages', err)
		return { status: 500, item: err }
	}
}

export const saveMessage = async ({
	conversationId,
	senderId,
	messageContent,
}) => {
	try {
		const message = await db
			.insert(Message)
			.values({
				conversationId,
				senderId,
				messageContent,
			})
			.returning()

		if (!message || message.length === 0) {
			logError('save message', 'message not saved')
			return { status: 401, item: 'message not saved' }
		}

		Log('message saved')
		return { status: 200, item: message[0] }
	} catch (err) {
		logError('save message', err)
		return { status: 500, item: err }
	}
}
