import React from 'react'
import { useGlobalState } from '@/misc/GlobalStateContext'
import StudentDashboard from './StudentDashboard.tsx'
import TutorDashboard from './TutorDashboard.tsx'
import { useParams, Navigate } from 'react-router-dom'
import StaffDashboardPage from '../Staff/StaffDashboardPage/index.tsx'

function OverViewPage() {
	const { currentUser } = useGlobalState()

	if (!currentUser) {
		return <div className='p-8'>Please log in to view your dashboard.</div>
	}
	// For staff viewing a student's dashboard, show the student view
	if (currentUser.role === 'staff') return <StaffDashboardPage />
	if (currentUser.role === 'tutor') return <TutorDashboard />
	return <StudentDashboard />
}

export default OverViewPage
