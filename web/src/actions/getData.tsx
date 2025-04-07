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
		const url = `${
			import.meta.env.VITE_HOST
		}/getClassesForUser/${userId}/${role}`

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
		
		if (!response.ok) {
			console.error('Failed to fetch classes:', response.status)
			return []
		}

		let data
		try {
			data = await response.json()
		} catch (error) {
			console.error('Failed to parse response as JSON:', error)
			return []
		}

		console.log('Classes response:', data)

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
		
		if (!response.ok) {
			console.error('Failed to fetch classes:', response.status)
			return []
		}

		let data
		try {
			data = await response.json()
		} catch (error) {
			console.error('Failed to parse response as JSON:', error)
			return []
		}

		console.log('Classes response:', data)

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

		// Return the array of classes
		return Array.isArray(data) ? data : []
	} catch (error) {
		console.error('Error fetching classes:', error)
		return []
	}
}

export const getMeetingsOfAClass = async ({
	classId,
	token,
}: {
	classId: string
	token: string
}) => {
	try {
		const url = `${import.meta.env.VITE_HOST}/getMeetingsOfAClass/${classId}`
		const options = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authentication: `Bearer ${token}`,
				API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
			},
		}

		const response = await fetch(url, options)
		
		if (!response.ok) {
			console.error('Failed to fetch meetings:', response.status)
			return []
		}

		const data = await response.json()

		// If data is null/undefined or has error, return empty array
		if (!data || data.error) {
			console.log('No data or error in response:', data)
			return []
		}

		// Return the meetings array or empty array if no meetings
		return Array.isArray(data) ? data : []
	} catch (error) {
		console.error('Error fetching meetings:', error)
		return []
	}
}

export const createPost = async ({
	token,
	userId,
	classId,
	title,
	postContent,
}: {
	token: string
	userId: string
	classId: string
	title: string
	postContent: string
}) => {
	try {
		const url = `${import.meta.env.VITE_HOST}/createPost`
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authentication: `Bearer ${token}`,
				API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
			},
			body: JSON.stringify({
				userId,
				classId,
				title,
				postContent,
			}),
		}

		const response = await fetch(url, options)
		if (!response.ok) {
			throw new Error('Failed to create post')
		}
		return await response.json()
	} catch (error) {
		console.error('Error creating post:', error)
		return null
	}
}

export const getPostsByClassId = async ({
	token,
	classId,
}: {
	token: string
	classId: string
}) => {
	try {
		const url = `${import.meta.env.VITE_HOST}/getPostsByClassId/${classId}`
		const options = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authentication: `Bearer ${token}`,
				API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
			},
		}

		const response = await fetch(url, options)
		if (!response.ok) {
			throw new Error('Failed to fetch posts')
		}
		return await response.json()
	} catch (error) {
		console.error('Error fetching posts:', error)
		return []
	}
}

export const getPostById = async ({
	token,
	postId,
}: {
	token: string
	postId: string
}) => {
	try {
		const url = `${import.meta.env.VITE_HOST}/getPostById/${postId}`
		const options = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authentication: `Bearer ${token}`,
				API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
			},
		}

		const response = await fetch(url, options)
		if (!response.ok) {
			throw new Error('Failed to fetch post')
		}
		return await response.json()
	} catch (error) {
		console.error('Error fetching post:', error)
		return null
	}
}

export const updatePost = async ({
	token,
	postId,
	userId,
	title,
	postContent,
}: {
	token: string
	postId: string
	userId: string
	title: string
	postContent: string
}) => {
	try {
		const url = `${import.meta.env.VITE_HOST}/updatePost`
		const options = {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authentication: `Bearer ${token}`,
				API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
			},
			body: JSON.stringify({
				postId,
				userId,
				title,
				postContent,
			}),
		}

		const response = await fetch(url, options)
		if (!response.ok) {
			throw new Error('Failed to update post')
		}
		return await response.json()
	} catch (error) {
		console.error('Error updating post:', error)
		return null
	}
}

export const deletePost = async ({
	token,
	postId,
	userId,
}: {
	token: string
	postId: string
	userId: string
}) => {
	try {
		const url = `${import.meta.env.VITE_HOST}/deletePost/${postId}/${userId}`
		const options = {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authentication: `Bearer ${token}`,
				API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
			},
		}

		const response = await fetch(url, options)
		if (!response.ok) {
			throw new Error('Failed to delete post')
		}
		return await response.json()
	} catch (error) {
		console.error('Error deleting post:', error)
		return null
	}
}

export const createComment = async ({
	token,
	postId,
	userId,
	commentContent,
}: {
	token: string
	postId: string
	userId: string
	commentContent: string
}) => {
	try {
		const url = `${import.meta.env.VITE_HOST}/createComment`
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authentication: `Bearer ${token}`,
				API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
			},
			body: JSON.stringify({
				postId,
				userId,
				commentContent,
			}),
		}

		const response = await fetch(url, options)
		if (!response.ok) {
			throw new Error('Failed to create comment')
		}
		return await response.json()
	} catch (error) {
		console.error('Error creating comment:', error)
		return null
	}
}

export const getCommentsByPostId = async ({
	token,
	postId,
}: {
	token: string
	postId: string
}) => {
	try {
		const url = `${import.meta.env.VITE_HOST}/getCommentsByPostId/${postId}`
		const options = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authentication: `Bearer ${token}`,
				API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
			},
		}

		const response = await fetch(url, options)
		if (!response.ok) {
			throw new Error('Failed to fetch comments')
		}
		return await response.json()
	} catch (error) {
		console.error('Error fetching comments:', error)
		return []
	}
}

export const updateComment = async ({
	token,
	commentId,
	userId,
	commentContent,
}: {
	token: string
	commentId: string
	userId: string
	commentContent: string
}) => {
	try {
		const url = `${import.meta.env.VITE_HOST}/updateComment`
		const options = {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authentication: `Bearer ${token}`,
				API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
			},
			body: JSON.stringify({
				commentId,
				userId,
				commentContent,
			}),
		}

		const response = await fetch(url, options)
		if (!response.ok) {
			throw new Error('Failed to update comment')
		}
		return await response.json()
	} catch (error) {
		console.error('Error updating comment:', error)
		return null
	}
}

export const deleteComment = async ({
	token,
	commentId,
	userId,
}: {
	token: string
	commentId: string
	userId: string
}) => {
	try {
		const url = `${import.meta.env.VITE_HOST}/deleteComment/${commentId}/${userId}`
		const options = {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authentication: `Bearer ${token}`,
				API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
			},
		}

		const response = await fetch(url, options)
		if (!response.ok) {
			throw new Error('Failed to delete comment')
		}
		return await response.json()
	} catch (error) {
		console.error('Error deleting comment:', error)
		return null
	}
}
