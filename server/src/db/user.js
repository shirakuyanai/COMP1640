import { eq } from 'drizzle-orm'
import User from '../schema/User.js'
import UserRole from '../schema/UserRole.js'
import Role from '../schema/Role.js'
import { db } from '../config/db_config.js'

import { Log, logError } from '../lib/logger.js'

/**
 * This code is used to get the currently logged in user.
 * The function checks if the user is found and if not,
 * returns a 404 error. When the user is found, it creates
 * a new user object with the user's attributes and returns
 * it with a 200 status code.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {import('express').Response} - Express HTTP response
 */
export const getLoggedInUser = async (req, res) => {
	try {
		const foundUser = await db
			.select()
			.from(User)
			.where(eq(User.userId, req.user.id))
		if (!foundUser[0] || foundUser.length === 0) {
			logError(
				'get current user',
				`User doesn't exist. Please logout and try again.`,
			)
			return {
				status: 400,
				item: `User doesn't exist. Please logout and try again.`,
			}
		}
		if (foundUser[0].isLocked) {
			logError('get current user', `User has been terminated`)
			return {
				status: 400,
				item: `User has been terminated`,
			}
		}

		const userRole = await db
			.select()
			.from(UserRole)
			.where(eq(UserRole.userId, foundUser[0].userId))

		if (!userRole[0] || userRole.length === 0) {
			logError('get current user', `User has invalid role`)
			return {
				status: 400,
				item: `User has invalid role`,
			}
		}
		const role = await db
			.select()
			.from(Role)
			.where(eq(Role.roleId, userRole[0].roleId))

		if (!role[0] || role.length === 0) {
			logError('get current user', `This user's role no longer exists`)
			return {
				status: 400,
				item: `This user's role no longer exists`,
			}
		}
		const user = {
			id: foundUser[0].id,
			email: foundUser[0].email,
			username: foundUser[0].username,
			role: role[0].roleName,
		}
		return { status: 200, item: user }
	} catch (err) {
		return { status: 500, item: logError('get logged in user', err) }
	}
}
