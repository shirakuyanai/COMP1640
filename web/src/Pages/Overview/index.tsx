import React from 'react'
import { useGlobalState } from '@/misc/GlobalStateContext'
import StudentDashboard from './StudentDashboard.tsx'
import TutorDashboard from './TutorDashboard.tsx'
import { useParams, Navigate } from 'react-router-dom'

function OverViewPage() {
	const { currentUser } = useGlobalState()
	const { userId } = useParams()

	if (!currentUser) {
		return <div className="p-8">Please log in to view your dashboard.</div>
	}

	// Allow staff to view any dashboard, but regular users can only view their own
	if (currentUser.role !== 'staff' && userId !== currentUser.id) {
		return <Navigate to={`/dashboard/${currentUser.id}`} replace />
	}

	// For staff viewing a student's dashboard, show the student view
	if (currentUser.role === 'staff' && userId !== currentUser.id) {
		return <StudentDashboard viewingUserId={userId} />
	}

	// For users viewing their own dashboard or staff viewing their own dashboard
	return currentUser.role === 'tutor' ? <TutorDashboard /> : <StudentDashboard viewingUserId={userId} />
}

export default OverViewPage
