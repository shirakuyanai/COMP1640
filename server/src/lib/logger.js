import encrypt from './encrypt.js'
import winston from 'winston'

/**
 * Write an error to the server's log file
 *
 * @param {string} message - The action that caused the error
 * @param {any} error - The error's detail
 * @returns {string} - A log with date and the error message
 */
export const logError = (context, error) => {
	console.error(new Date().toISOString(), `Error in ${context}:`, error)
}

/**
 * Write to the server's log file
 *
 * @param {string} message - A message to be written to log
 * @returns {string} - A message with date and the original message
 */
export const Log = (...args) => {
	console.log(new Date().toISOString(), ...args)
}
