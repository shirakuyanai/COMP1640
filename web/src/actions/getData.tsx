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

export const getClassById = async (token: string, classId: string) => {
	const url = `${import.meta.env.VITE_HOST}/getClassById/${classId}`

	const options = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authentication: `Bearer ${token}`,
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
