export const getDataForCreatingClass = async (token: string) => {
	const url = `${import.meta.env.VITE_HOST}/getDataForCreatingClass`
	const options = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			...(token && { Authentication: `Bearer ${token}` }),
			API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
		},
	}
	const response = await fetch(url, options)
	const data = await response.json()

	if (response.status !== 200) {
		return { students: [], tutors: [] }
	}
	return data
}

export const getCurrentUser = async (token: string) => {
	const url = `${import.meta.env.VITE_HOST}/getCurrentUser`
	const options = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			...(token && { Authentication: `Bearer ${token}` }),
			API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
		},
	}

	const response = await fetch(url, options)
	const data = await response.json()

	if (response.status !== 200) {
		return null
	}
	return data
}

export const getConversation = async ({
	token,
	conversationId,
	classId,
}: {
	token: string
	conversationId?: string | null
	classId: string
}) => {
	const url = `${import.meta.env.VITE_HOST}/getConversation`

	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authentication: `Bearer ${token}`,
			API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
		},
		body: JSON.stringify({ conversationId: conversationId ?? '', classId }),
	}

	const response = await fetch(url, options)
	const data = await response.json()

	if (response.status !== 200) {
		return null
	}
	return data
}

export const getMessages = async ({
	token,
	conversationId,
}: {
	token: string
	conversationId?: string | null
}) => {
	const url = `${import.meta.env.VITE_HOST}/getMessages`

	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authentication: `Bearer ${token}`,
			API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
		},
		body: JSON.stringify({ conversationId }),
	}

	const response = await fetch(url, options)
	const data = await response.json()

	if (response.status !== 200) {
		return null
	}
	return data
}

export const getClassById = async ({
	token,
	classId,
	userId,
	role,
}: {
	token: string
	classId: string
	userId: string
	role: string
}) => {
	const url = `${
		import.meta.env.VITE_HOST
	}/getClassById/${classId}/${userId}/${role}`

	const options = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authentication: `Bearer ${token}`,
			API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
		},
	}

	const response = await fetch(url, options)

	if (response.status !== 200) {
		return null
	}
	const data = await response.json()
	return data
}

export const getClassesForUser = async ({
	token,
	userId,
	role,
}: {
	token: string
	userId: string
	role: string
}) => {
	try {
		const url = `${import.meta.env.VITE_HOST}/getClassesForUser/${userId}/${role}`

		const options = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authentication: `Bearer ${token}`,
				API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
			},
		}

		console.log('Fetching classes with options:', options)
		const response = await fetch(url, options)
		const data = await response.json()
		console.log('Classes response:', data)

		if (!response.ok) {
			console.error('Failed to fetch classes:', data)
			return []
		}

		// If data is an error object, return empty array
		if (data && data.error) {
			console.error('Error in response:', data.error)
			return []
		}

		// Handle both response formats - array or {item: array}
		if (Array.isArray(data)) {
			return data
		}

		// If data has item property, return it
		if (data && data.item) {
			return data.item
		}

		// If no valid data format is found, return empty array
		console.log('No valid data format found')
		return []
	} catch (error) {
		console.error('Error fetching classes:', error)
		return []
	}
}

export const getAllClasses = async (token: string) => {
	try {
		const url = `${import.meta.env.VITE_HOST}/getAllClasses`
		const options = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authentication: `Bearer ${token}`,
				API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
			},
		}

		console.log('Fetching classes with options:', options)
		const response = await fetch(url, options)
		const data = await response.json()
		console.log('Classes response:', data)

		if (!response.ok) {
			console.error('Failed to fetch classes:', data)
			return []
		}

		// If data is an error object, return empty array
		if (data && data.error) {
			console.error('Error in response:', data.error)
			return []
		}

		// If data is null/undefined, return empty array
		if (!data) {
			console.log('No data returned')
			return []
		}

		return data
	} catch (error) {
		console.error('Error fetching classes:', error)
		return []
	}
}
