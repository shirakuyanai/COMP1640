import { addClassSchema } from '@/schemas/class'
import { loginInfoSchema } from '@/schemas/login'

export const AddNewClass = async (unsafeData: any, token: string) => {
	try {
		const { success, data } = addClassSchema.safeParse(unsafeData)

		if (success) {
			const url = import.meta.env.VITE_HOST + '/addNewClass'
			const options = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authentication: `Bearer ${token}`,
					API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
				},

				body: JSON.stringify(data),
			}
			const response = await fetch(url, options)
			const returned_data = await response.json()

			if (response.status !== 200) {
				return { students: [], tutors: [] }
			}
			return returned_data
		} else {
			return null
		}
	} catch (err) {
		console.error(err)
		return null
	}
}

export const LoginAPI = async ({
	unsafeData,
	token,
	setAuthToken,
}: {
	unsafeData: unknown
	token: string
	setAuthToken: any
}) => {
	try {
		const { success, data } = loginInfoSchema.safeParse(unsafeData)
		const api_key = import.meta.env.VITE_APIKEY
		if (!api_key) return { error: true, message: 'No API key provided' }

		if (success) {
			const url = import.meta.env.VITE_HOST + '/login'
			const options = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...(token && { Authentication: `Bearer ${token}` }),
					API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
				},
				body: JSON.stringify(data),
			}
			const response = await fetch(url, options)
			const returned_data = await response.json()

			if (response.status === 200) {
				localStorage.setItem('auth_token', returned_data.jwt)
				setAuthToken(returned_data.jwt)
			}
			return { error: response.status !== 200, message: returned_data }
		}
		return {
			error: true,
			message: 'An error occurred. Please try again later.',
		}
	} catch (err) {
		console.error(err)
		return {
			error: true,
			message: 'An error occurred. Please try again later.',
		}
	}
}

export const LogoutAPI = async ({
	setAuthToken,
	setCurrentUser,
}: {
	setAuthToken: (token: string) => void
	setCurrentUser: (user: any) => void
}) => {
	try {
		// Clear auth token from localStorage
		localStorage.removeItem('auth_token')
		// Clear auth token from global state
		setAuthToken('')
		// Clear current user from global state
		setCurrentUser(null)
		
		return { error: false, message: 'Logged out successfully' }
	} catch (err) {
		console.error('Logout error:', err)
		return {
			error: true,
			message: 'An error occurred during logout. Please try again.',
		}
	}
}
