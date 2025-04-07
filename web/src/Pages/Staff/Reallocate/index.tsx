import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import ReallocateForm from '../_components/forms/ReallocateForm'

function ReallocatePage() {
	return (
		<div className="p-6 bg-gray-50 min-h-screen">
			<div className="max-w-4xl mx-auto">
				<div className="mb-6">
					<h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
						Reallocate Class
					</h1>
					<p className="text-gray-600 mt-1">Reassign students to different tutors or classes</p>
				</div>
				
				<Card className="shadow-sm border border-gray-100 overflow-hidden">
					<div className="h-1.5 bg-gradient-to-r from-purple-500 to-indigo-600" />
					<CardHeader className="border-b pb-3">
						<CardTitle className="text-lg font-semibold">Reallocation Form</CardTitle>
					</CardHeader>
					<CardContent className="pt-4">
						<ReallocateForm />
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

export default ReallocatePage 