import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import React, { useEffect, useState } from 'react'
import LoginForm from '../_components/forms/LoginForm'
import { redirect, useNavigate } from 'react-router-dom'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { getCurrentUser } from '@/actions/getData'

function LoginPage() {
	const { isLoading, currentUser } = useGlobalState()
	const navigate = useNavigate()

	useEffect(() => {
		if (!isLoading && currentUser) {
			if (currentUser.role === 'staff') {
				navigate('/staff')
			} else {
				navigate('/')
			}
		}
	}, [isLoading, currentUser])

	if (isLoading) return <div>Loading...</div>
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
