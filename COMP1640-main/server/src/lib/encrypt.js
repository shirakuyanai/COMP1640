import crypto from 'crypto'

export default function encrypt() {
	const hex = crypto.randomBytes(32).toString('hex')
	return hex
}
