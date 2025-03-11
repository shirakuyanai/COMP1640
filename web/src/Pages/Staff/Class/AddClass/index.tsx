import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import ClassUpdateForm from '../../_components/forms/ClassUpdateForm'

function AddClass() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className='text-xl'>Add a new class</CardTitle>
			</CardHeader>
			<CardContent>
				<ClassUpdateForm />
			</CardContent>
		</Card>
	)
}

export default AddClass
