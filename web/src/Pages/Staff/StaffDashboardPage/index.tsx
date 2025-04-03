import React, { useEffect, useState } from 'react'
import io from 'socket.io-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { getAllClasses, getDataForCreatingClass } from '@/actions/getData'
import { FaUserGraduate, FaChalkboardTeacher, FaCalendarCheck, FaArrowUp, FaArrowDown, FaUsers, FaPersonChalkboard } from 'react-icons/fa6'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

type DetailViewType = 'overview' | 'classes' | 'students' | 'tutors' | 'performance' | null;

type TutorWorkload = {
  name: string;
  classes: number;
  students: number;
}

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#6366F1', '#3B82F6'];

function StaffDashboardPage() {
  const navigate = useNavigate()
  const { currentUser, authToken } = useGlobalState()
  const [selectedView, setSelectedView] = useState<DetailViewType>('overview')
  const [rawData, setRawData] = useState({
    classes: [],
    students: [],
    tutors: []
  })
  const [dashboardData, setDashboardData] = useState({
    totalClasses: 0,
    activeClasses: 0,
    studentsWithoutClass: 0,
    totalStudents: 0,
    totalTutors: 0,
    recentActivities: [],
    classTrends: {
      total: 0,
      active: 0,
      inactive: 0
    },
    studentTrends: {
      assigned: 0,
      unassigned: 0
    },
    tutorWorkload: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const socket = io(import.meta.env.VITE_HOST)

    socket.on('connect', () => {
    })

    socket.on('dashboardUpdate', (data: typeof dashboardData) => {
      setDashboardData(data)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const [classesData, studentsAndTutorsData] = await Promise.all([
          getAllClasses(authToken),
          getDataForCreatingClass(authToken)
        ])

        if (classesData && studentsAndTutorsData?.students && studentsAndTutorsData?.tutors) {
          setRawData({
            classes: classesData,
            students: studentsAndTutorsData.students,
            tutors: studentsAndTutorsData.tutors
          })

          const assignedStudentIds = new Set(classesData.map((c: any) => c.studentId))
          const studentsWithoutClass = studentsAndTutorsData.students.filter(
            (student: any) => !assignedStudentIds.has(student.studentId)
          )

          const tutorWorkload = studentsAndTutorsData.tutors.map((tutor: any) => ({
            name: tutor.username,
            classes: classesData.filter((c: any) => c.tutorId === tutor.tutorId).length,
            students: classesData.filter((c: any) => c.tutorId === tutor.tutorId).length
          }))

          setDashboardData({
            totalClasses: classesData.length,
            activeClasses: classesData.filter((c: any) => c.status === 'active').length,
            studentsWithoutClass: studentsWithoutClass.length,
            totalStudents: studentsAndTutorsData.students.length,
            totalTutors: studentsAndTutorsData.tutors.length,
            recentActivities: classesData.slice(0, 5),
            classTrends: {
              total: classesData.length,
              active: classesData.filter((c: any) => c.status === 'active').length,
              inactive: classesData.filter((c: any) => c.status !== 'active').length
            },
            studentTrends: {
              assigned: studentsAndTutorsData.students.length - studentsWithoutClass.length,
              unassigned: studentsWithoutClass.length
            },
            tutorWorkload
          })
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (authToken) {
      fetchDashboardData()
    }
  }, [authToken])

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {currentUser?.username}!</h1>
        <p className="text-gray-500">Here's your teaching management overview</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dashboardData.totalClasses}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dashboardData.activeClasses}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dashboardData.totalStudents}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unassigned Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dashboardData.studentsWithoutClass}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Tutors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dashboardData.totalTutors}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default StaffDashboardPage
