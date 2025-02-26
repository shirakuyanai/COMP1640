const User = require('../models/User')

const { hashPassword, compareHash } = require('./auth')
const { sendVerificationEmail } = require('./mailer')
const { validatePassword, validateEmail } = require('./validation')

const { Log, logError } = require('./logger')

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
		const foundUser = await User.findOne({
			id: req.user.id,
		})
		if (!foundUser) {
			if (
				process.env.NODE_ENV !== 'production' &&
				process.env.NODE_ENV !== 'test'
			)
				console.log(`User doesn't exist. Please logout and try again.`)
			return {
				status: 400,
				item: `User doesn't exist. Please logout and try again.`,
			}
		}
		const user = {
			id: foundUser.id,
			email: foundUser.email,
			firstname: foundUser.firstname,
			lastname: foundUser.lastname,
			role: foundUser.role,
			verified: foundUser.verified,
		}
		return { status: 200, item: user }
	} catch (err) {
		return { status: 500, item: logError('get logged in user', err) }
	}
}
///////////////////////////////////

/**
 * This function changes a user's password.
 * It requires the user to be logged in, and the user's current password.
 * It also requires the user to input the new password twice, to make sure they didn't make a mistake.
 * It returns an error if the user's current password is incorrect, or if the new password input is not valid.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {import('express').Response} - Express HTTP response
 */
export const changePassword = async (req, res) => {
	try {
		// Validate input
		const results = await ValidateInputChangePassword(req, res)
		if (results && results.status !== 200)
			return { status: results.status, item: results.item }

		// Update password
		const user = results.item
		const new_password = await hashPassword(req.body.new_password)
		if (new_password && new_password.status !== 200)
			return { status: 500, item: new_password.item }

		user.password = new_password.item
		await user.save()

		// Return success message
		return { status: 200, item: 'Password changed successfully' }
	} catch (err) {
		// Return error
		return { status: 500, item: logError('change password', err) }
	}
}
///////////////////////////////////

/**
 * Validate input for change password function
 * If all goes through, return a user object
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {{ status: number, item: any }} The Express response or an error object.
 */
const ValidateInputChangePassword = async (req, res) => {
	try {
		if (!req.body.old_password) {
			if (
				process.env.NODE_ENV !== 'production' &&
				process.env.NODE_ENV !== 'test'
			)
				console.log('Please enter your old password.')
			return { status: 401, item: 'Please enter your old password.' }
		}
		if (!req.body.new_password) {
			if (
				process.env.NODE_ENV !== 'production' &&
				process.env.NODE_ENV !== 'test'
			)
				console.log('Please enter a new password.')
			return { status: 401, item: 'Please enter a new password.' }
		}
		if (!req.body.new_password_2) {
			if (
				process.env.NODE_ENV !== 'production' &&
				process.env.NODE_ENV !== 'test'
			)
				console.log('Please confirm your new password.')
			return { status: 401, item: 'Please confirm your new password.' }
		}
		if (!(await validatePassword(req.body.new_password))) {
			if (
				process.env.NODE_ENV !== 'production' &&
				process.env.NODE_ENV !== 'test'
			)
				console.log('Invalid new password.')
			return { status: 401, item: 'Invalid new password.' }
		}

		const user = await User.findOne({ id: req.user.id })
		if (!user) {
			if (
				process.env.NODE_ENV !== 'production' &&
				process.env.NODE_ENV !== 'test'
			)
				console.log('Invalid user. Please logout and try again.')
			return { status: 404, item: 'Invalid user. Please logout and try again.' }
		}

		if (await !compareHash(req.body.old_password, user.password)) {
			if (
				process.env.NODE_ENV !== 'production' &&
				process.env.NODE_ENV !== 'test'
			)
				console.log('Incorrect old password.')
			return { status: 401, item: 'Incorrect old password' }
		}

		if (req.body.new_password !== req.body.new_password_2) {
			if (
				process.env.NODE_ENV !== 'production' &&
				process.env.NODE_ENV !== 'test'
			)
				console.log(`Passwords don't match.`)
			return { status: 401, item: "Passwords don't match." }
		}
		return { status: 200, item: user }
	} catch (err) {
		return {
			status: 500,
			item: logError('validate input for changing password', err),
		}
	}
}
///////////////////////////////////

/**
 * Change user email
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {import('express').Response} - Express HTTP response
 */
export const changeEmail = async (req, res) => {
	try {
		if (!validateEmail(req.body.email)) {
			if (
				process.env.NODE_ENV !== 'production' &&
				process.env.NODE_ENV !== 'test'
			)
				console.log('Invalid email.')
			return { status: 401, item: 'Invalid email.' }
		}

		const user = await User.findOne({ id: req.user.id })

		if (!user)
			return {
				status: 404,
				item: logError(
					'change email',
					`User doesn't exist. Please logout and try again.`,
				),
			}
		const results = await validateInputEditEmail(req, res, user)

		if (results && results.status !== 200)
			return { status: results.status, item: results.item }

		user.email = req.body.email
		user.verified = false

		await user.save()
		const send_email_response = await sendVerificationEmail(user)

		return {
			status: send_email_response.status,
			item: send_email_response.item,
		}
	} catch (err) {
		return { status: 500, item: logError('change email', err) }
	}
}
///////////////////////////////////

/**
 * Validate input for changing user email
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {{ status: number, item: any }} The Express response or an error object.
 */
const validateInputEditEmail = async (req, res, user) => {
	try {
		if (!req.body.email) {
			if (
				process.env.NODE_ENV !== 'production' &&
				process.env.NODE_ENV !== 'test'
			)
				console.log(`Please enter your email.`)
			return { status: 401, item: `Please enter your email.` }
		}
		if (!req.body.email_retype) {
			if (
				process.env.NODE_ENV !== 'production' &&
				process.env.NODE_ENV !== 'test'
			)
				console.log(`Please retype your email.`)
			return { status: 401, item: `Please retype your email.` }
		}
		if (!req.body.password) {
			if (
				process.env.NODE_ENV !== 'production' &&
				process.env.NODE_ENV !== 'test'
			)
				console.log('Incorrect password.')
			return { status: 401, item: 'Incorrect password.' }
		}
		if (req.body.email !== req.body.email_retype) {
			if (
				process.env.NODE_ENV !== 'production' &&
				process.env.NODE_ENV !== 'test'
			)
				console.log(`Retype password doesn't match.`)
			return { status: 401, item: `Retype password doesn't match.` }
		}
		let duplicateMailUsers = await User.find({
			email: req.body.email,
		})
		if (duplicateMailUsers && duplicateMailUsers.length > 0)
			duplicateMailUsers = duplicateMailUsers.filter(
				(found_user) => found_user.id === req.user.id,
			)

		if (duplicateMailUsers && duplicateMailUsers.length > 0) {
			if (
				process.env.NODE_ENV !== 'production' &&
				process.env.NODE_ENV !== 'test'
			)
				console.log('Email taken.')
			return { status: 401, item: 'Email taken.' }
		}

		if (req.body.email === user.email) {
			if (
				process.env.NODE_ENV !== 'production' &&
				process.env.NODE_ENV !== 'test'
			)
				console.log('You cannot use your old email.')
			return { status: 401, item: 'You cannot use your old email.' }
		}
		const compare_hash = await compareHash(req.body.password, user.password)
		if (compare_hash && compare_hash.status != 200)
			return { status: compare_hash.status, item: compare_hash.item }

		return { status: 200, item: user }
	} catch (err) {
		return {
			status: 500,
			item: logError('validate input for changing email', err),
		}
	}
}
///////////////////////////////////

// Todo: Implement password recovery
