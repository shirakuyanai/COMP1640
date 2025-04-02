import { addClassSchema } from '@/schemas/class'
import { loginInfoSchema } from '@/schemas/login'
import { meetingAttendanceSchema, newMeetingSchema } from '@/schemas/meeting'
import { z } from 'zod'

export async function AddNewClass(
	formData: z.infer<typeof addClassSchema>,
	authToken: string,
) {
	try {
		console.log('Sending class data:', formData)

		const response = await fetch(`${import.meta.env.VITE_HOST}/addNewClass`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authentication: `Bearer ${authToken}`,
				API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
			},
			body: JSON.stringify(formData),
		})

		const data = await response.json()
		console.log('Response:', response.status, data)

		if (!response.ok) {
			throw new Error(data.error || 'Failed to create class')
		}

		return data
	} catch (error) {
		console.error('Fetch error:', error)
		throw error
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

export async function reallocateClass(
	authToken: string,
	{
		classId,
		newStudentId,
		newTutorId,
	}: { classId: string; newStudentId?: string; newTutorId?: string },
) {
	try {
		console.log('Sending reallocation request:', {
			classId,
			newStudentId,
			newTutorId,
		})

		const response = await fetch(
			`${import.meta.env.VITE_HOST}/class/reallocate`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authentication: `Bearer ${authToken}`,
					API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
				},
				body: JSON.stringify({ classId, newStudentId, newTutorId }),
			},
		)

		const data = await response.json()
		console.log('Reallocation response:', data)

		if (!response.ok) {
			throw new Error(data.item?.error || 'Failed to reallocate class')
		}

		return data.item
	} catch (error) {
		console.error('Error in reallocateClass:', error)
		throw error
	}
}

export async function AddNewMeeting(
	formData: z.infer<typeof newMeetingSchema>,
	authToken: string,
) {
	try {
		const response = await fetch(`${import.meta.env.VITE_HOST}/newMeeting`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authentication: `Bearer ${authToken}`,
				API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
			},
			body: JSON.stringify(formData),
		})

		const data = await response.json()

		if (!response.ok) {
			throw new Error(data.error || 'Failed to create class')
		}

		return data
	} catch (error) {
		console.error('Fetch error:', error)
		throw error
	}
}

export async function updateMeetingAttendance(
	formData: z.infer<typeof meetingAttendanceSchema>,
	authToken: string,
) {
	try {
		const response = await fetch(
			`${import.meta.env.VITE_HOST}/changeMeetingAttendance`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authentication: `Bearer ${authToken}`,
					API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
				},
				body: JSON.stringify(formData),
			},
		)

		const data = await response.json()

		if (!response.ok) {
			throw new Error(data.error || 'Failed to create class')
		}

		return data
	} catch (error) {
		console.error('Fetch error:', error)
		throw error
	}
}
