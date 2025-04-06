import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import React, { useEffect, useState } from 'react'
import LoginForm from '../_components/forms/LoginForm'
import { redirect, useNavigate } from 'react-router-dom'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { getCurrentUser } from '@/actions/getData'

function LoginPage() {
	const { isLoading, currentUser, authToken, setIsLoading } = useGlobalState()
	const navigate = useNavigate()

	useEffect(() => {
		try {
			if (!isLoading && currentUser && authToken) {
				if (currentUser.role === 'staff') {
					navigate('/staff')
				} else {
					navigate('/')
				}
			}
		} catch (err) {
			console.error('Error navigating:', err)
		} finally {
			setIsLoading(false)
		}
	}, [isLoading, currentUser, authToken])

	if (isLoading) return <div>{JSON.stringify(isLoading)}</div>
	return (
		<div className='flex justify-center items-center h-screen bg-purple-50'>
			<Card>
				<CardHeader>
					<CardTitle className='text-3xl font-bold text-center'>
						eTutoring Login
					</CardTitle>
				</CardHeader>
				<CardContent>
					<LoginForm />
				</CardContent>
			</Card>
		</div>
	)
}

export default LoginPage
