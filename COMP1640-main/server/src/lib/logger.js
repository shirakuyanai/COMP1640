import encrypt from './encrypt.js'
import winston from 'winston'

/**
 * Write an error to the server's log file
 *
 * @param {string} message - The action that caused the error
 * @param {any} error - The error's detail
 * @returns {string} - A log with date and the error message
 */
export const logError = (message, error) => {
	let errorMessage = `${new Date().toISOString()} - [ERROR]:`
	if (!message) return `${errorMessage} No error specified.`
	const error_code = encrypt()
	errorMessage += ` ${error_code} - An error occurred while trying to ${message}.`
	const logger = winston.createLogger({
		level: 'error',
		format: winston.format.simple(),
		transports: [
			new winston.transports.Console(),
			new winston.transports.File({ filename: './logs/errors.log' }),
		],
	})
	if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test')
		logger.error(`${errorMessage} ${error}`)

	return `An error occurred. Please contact customer support with this error code: ${error_code}`
}

/**
 * Write to the server's log file
 *
 * @param {string} message - A message to be written to log
 * @returns {string} - A message with date and the original message
 */
export const Log = (message) => {
	try {
		let logMessage = `${new Date().toISOString()} -`
		if (!message) return `${logMessage} No message specified`
		logMessage = `${logMessage} ${message}`
		const logger = winston.createLogger({
			level: 'info',
			format: winston.format.simple(),
			transports: [
				new winston.transports.Console(),
				new winston.transports.File({ filename: './logs/app.log' }),
			],
		})
		if (
			process.env.NODE_ENV !== 'production' &&
			process.env.NODE_ENV !== 'test'
		)
			logger.info(`${logMessage}`)

		return logMessage
	} catch (err) {
		return logError(
			'write a log',
			'Message: ' + message ? message : 'No message specified.',
		)
	}
}
