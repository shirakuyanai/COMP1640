import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import ReallocateForm from '../_components/forms/ReallocateForm'

function ReallocatePage() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className='text-xl'>Reallocate Class</CardTitle>
			</CardHeader>
			<CardContent>
				<ReallocateForm />
			</CardContent>
		</Card>
	)
}

export default ReallocatePage 