export const getDataForCreatingClass = async (token: string) => {
	const url = import.meta.env.VITE_HOST + '/getDataForCreatingClass'
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
	const url = import.meta.env.VITE_HOST + '/getCurrentUser'
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
