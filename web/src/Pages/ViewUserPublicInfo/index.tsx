import { getUserPublicInfoById } from '@/actions/getData'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { useGlobalState } from '@/misc/GlobalStateContext'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

function ViewUserPublicInfo() {
	const params = useParams()
	const { authToken } = useGlobalState()
	const { userId } = params
	const [viewingUser, setViewingUser] = useState(null)

	const getData = async () => {
		const response = await getUserPublicInfoById({ userId, token: authToken })
		if (response) setViewingUser(response)
	}
	useEffect(() => {
		if (userId && authToken) getData()
	}, [userId, authToken])
	return (
		<div className='flex flex-col'>
			<Card className='w-100 md:w-1/2 lg:w-1/3 mx-auto mt-10'>
				<CardHeader>
					<CardTitle>User public information</CardTitle>
				</CardHeader>
				<hr />
				<br />
				<CardContent className='flex flex-col gap-10'>
					<div className='grid grid-cols-6 border-b-1'>
						<p className='font-semibold col-span-2'>Username:</p>{' '}
						<p className='col-span-4'>
							{viewingUser ? viewingUser.username : 'N/A'}
						</p>
					</div>
					<div className='grid grid-cols-6 border-b-1'>
						<p className='font-semibold col-span-2'>Email:</p>{' '}
						<p className=''>{viewingUser ? viewingUser.email : 'N/A'}</p>
					</div>
					<div className='grid grid-cols-6'>
						<p className='font-semibold col-span-2'>Biography:</p>{' '}
						<p className='col-span-4 text-warp'>
							{viewingUser ? viewingUser.biography : 'N/A'}
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default ViewUserPublicInfo
