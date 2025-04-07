import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import React, { useEffect, useState } from 'react'
import LoginForm from '../_components/forms/LoginForm'
import { redirect, useNavigate } from 'react-router-dom'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { getCurrentUser } from '@/actions/getData'

function LoginPage() {
	const { currentUser } = useGlobalState()
	const navigate = useNavigate()

	useEffect(() => {
		if (currentUser) {
			if (currentUser.role === 'staff') {
				navigate('/staff')
			} else {
				navigate('/')
			}
		}
	}, [currentUser])

	return (
		<div className='flex justify-center items-center min-h-screen bg-purple-50 p-4'>
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className='text-xl md:text-3xl font-bold text-center'>
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
