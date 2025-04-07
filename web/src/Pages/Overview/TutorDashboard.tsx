import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Progress } from '@/Components/ui/progress'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { getClassesForUser, getMeetingsOfAClass } from '@/actions/getData'
import { FaCalendarCheck, FaChalkboardTeacher, FaGraduationCap } from 'react-icons/fa'
import { FaCalendarDays, FaComments } from 'react-icons/fa6'
import { format, isValid, parse } from 'date-fns'
import { Input } from '@/Components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select'

interface MeetingType {
  meetingId: string
  meetingDate: string
  meetingType: string
  meetingLink: string
  location: string
  meetingNotes: string
  studentAttended: number
  className?: string
}

interface ClassType {
  id: string
  className: string
  description: string
  startDate: string
  endDate: string
  schedule: string
  meetingLink: string
  studentUsername: string
  tutorUsername: string
}

function TutorDashboard() {
  const { currentUser, authToken } = useGlobalState()
  const [classes, setClasses] = useState<ClassType[]>([])
  const [meetings, setMeetings] = useState<MeetingType[]>([])
  const [loading, setLoading] = useState(true)
  const [classSearchTerm, setClassSearchTerm] = useState('')
  const [studentSearchTerm, setStudentSearchTerm] = useState('')
  const [classSortBy, setClassSortBy] = useState('name')
  const [studentSortBy, setStudentSortBy] = useState('name')
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalMeetings: 0,
    upcomingMeetings: 0,
    completedMeetings: 0
  })

  // Helper function to safely format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    try {
      // First try parsing with the expected format
      let date = parse(dateString, 'MMMM d, yyyy \'at\' hh:mm:ss aa', new Date())
      
      // If that fails, try parsing as an ISO string
      if (!isValid(date)) {
        date = new Date(dateString)
      }
      
      if (!isValid(date)) {
        console.log('Invalid date string:', dateString)
        return 'Not set'
      }
      
      return format(date, 'MMM d, yyyy')
    } catch (error) {
      console.error('Error formatting date:', error, 'for string:', dateString)
      return 'Not set'
    }
  }

  // Helper function to safely format date and time
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    try {
      // First try parsing with the expected format
      let date = parse(dateString, 'MMMM d, yyyy \'at\' hh:mm:ss aa', new Date())
      
      // If that fails, try parsing as an ISO string
      if (!isValid(date)) {
        date = new Date(dateString)
      }
      
      if (!isValid(date)) {
        console.log('Invalid datetime string:', dateString)
        return 'Not set'
      }
      
      return format(date, 'MMM d, yyyy h:mm aa')
    } catch (error) {
      console.error('Error formatting datetime:', error, 'for string:', dateString)
      return 'Not set'
    }
  }

  // Helper function to calculate class progress
  const calculateProgress = (startDate: string | null, endDate: string | null) => {
    if (!startDate || !endDate) return 0
    try {
      // First try parsing with the expected format
      let start = parse(startDate, 'MMMM d, yyyy \'at\' hh:mm:ss aa', new Date())
      let end = parse(endDate, 'MMMM d, yyyy \'at\' hh:mm:ss aa', new Date())
      
      // If that fails, try parsing as ISO strings
      if (!isValid(start)) start = new Date(startDate)
      if (!isValid(end)) end = new Date(endDate)
      
      if (!isValid(start) || !isValid(end)) {
        console.log('Invalid date range:', { startDate, endDate })
        return 0
      }

      const now = new Date()

      if (now < start) return 0
      if (now > end) return 100

      const total = end.getTime() - start.getTime()
      const current = now.getTime() - start.getTime()
      const progress = Math.round((current / total) * 100)

      return Math.min(Math.max(progress, 0), 100)
    } catch (error) {
      console.error('Error calculating progress:', error, 'for dates:', { startDate, endDate })
      return 0
    }
  }

  // Helper function to normalize strings for comparison
  const normalizeString = (str: string) => {
    return str.toLowerCase().trim()
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || !authToken) return

      try {
        setLoading(true)
        // Fetch classes
        const classesData = await getClassesForUser({
          token: authToken,
          userId: currentUser.id,
          role: currentUser.role,
        })

        if (classesData) {
          setClasses(classesData)

          // Fetch meetings for each class
          const allMeetings: MeetingType[] = []
          for (const classItem of classesData) {
            const meetingsData = await getMeetingsOfAClass({
              classId: classItem.id,
              token: authToken,
            })
            
            if (meetingsData) {
              meetingsData.forEach((meeting: MeetingType) => {
                allMeetings.push({
                  ...meeting,
                  className: classItem.className
                })
              })
            }
          }

          setMeetings(allMeetings)

          // Calculate statistics
          const uniqueStudents = new Set(classesData.map((c: ClassType) => c.studentUsername))
          const now = new Date()
          
          setStats({
            totalClasses: classesData.length,
            totalStudents: uniqueStudents.size,
            totalMeetings: allMeetings.length,
            upcomingMeetings: allMeetings.filter(m => {
              if (!m.meetingDate) return false
              try {
                let meetingDate = parse(m.meetingDate, 'MMMM d, yyyy \'at\' hh:mm:ss aa', new Date())
                if (!isValid(meetingDate)) meetingDate = new Date(m.meetingDate)
                return isValid(meetingDate) && meetingDate > now
              } catch {
                return false
              }
            }).length,
            completedMeetings: allMeetings.filter(m => {
              if (!m.meetingDate) return false
              try {
                let meetingDate = parse(m.meetingDate, 'MMMM d, yyyy \'at\' hh:mm:ss aa', new Date())
                if (!isValid(meetingDate)) meetingDate = new Date(m.meetingDate)
                return isValid(meetingDate) && meetingDate < now
              } catch {
                return false
              }
            }).length
          })
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentUser, authToken])

  const StatCard = ({ icon, title, value, description }: any) => (
    <Card>
      <CardContent className="flex items-center p-6">
        <div className="bg-purple-100 p-3 rounded-lg">
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h4 className="text-2xl font-bold">{value}</h4>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  )

  // Filter and sort classes
  const filteredClasses = classes
    .filter(classItem => {
      if (!classSearchTerm.trim()) return true
      const search = normalizeString(classSearchTerm)
      const className = normalizeString(classItem.className)
      return className.includes(search)
    })
    .sort((a, b) => {
      const aClassName = normalizeString(a.className)
      const bClassName = normalizeString(b.className)
      return aClassName.localeCompare(bClassName)
    })

  // Get unique students with their classes
  const students = Array.from(
    classes.reduce((map, classItem) => {
      const student = map.get(classItem.studentUsername) || {
        username: classItem.studentUsername,
        classes: []
      }
      student.classes.push(classItem)
      map.set(classItem.studentUsername, student)
      return map
    }, new Map())
  ).map(([_, student]) => student)

  // Filter and sort students
  const filteredStudents = students
    .filter(student => {
      if (!studentSearchTerm.trim()) return true
      const search = normalizeString(studentSearchTerm)
      const studentName = normalizeString(student.username)
      return studentName.includes(search)
    })
    .sort((a, b) => {
      const aStudentName = normalizeString(a.username)
      const bStudentName = normalizeString(b.username)
      return aStudentName.localeCompare(bStudentName)
    })

  if (loading) {
    return <div className="p-8">Loading dashboard data...</div>
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome, {currentUser?.username}!</h1>
        <p className="text-gray-500">Here's a summary of your tutoring activities</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard
          icon={<FaChalkboardTeacher className="text-purple-600 h-6 w-6" />}
          title="Total Classes"
          value={stats.totalClasses}
          description="Active classes"
        />
        <StatCard
          icon={<FaGraduationCap className="text-blue-600 h-6 w-6" />}
          title="Total Students"
          value={stats.totalStudents}
          description="Assigned students"
        />
        <StatCard
          icon={<FaCalendarDays className="text-green-600 h-6 w-6" />}
          title="Total Meetings"
          value={stats.totalMeetings}
          description="Scheduled meetings"
        />
        <StatCard
          icon={<FaCalendarCheck className="text-yellow-600 h-6 w-6" />}
          title="Upcoming"
          value={stats.upcomingMeetings}
          description="Future meetings"
        />
        <StatCard
          icon={<FaComments className="text-indigo-600 h-6 w-6" />}
          title="Completed"
          value={stats.completedMeetings}
          description="Past meetings"
        />
      </div>

      {/* Classes Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Classes</CardTitle>
          <div className="flex gap-4">
            <Input
              placeholder="Search by class name..."
              value={classSearchTerm}
              onChange={(e) => setClassSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredClasses.map((classItem) => (
              <div key={classItem.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{classItem.className}</h3>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>{formatDate(classItem.startDate)} - {formatDate(classItem.endDate)}</p>
                  </div>
                </div>
                
                {/* Progress bar for class completion */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span>{calculateProgress(classItem.startDate, classItem.endDate)}%</span>
                  </div>
                  <Progress 
                    value={calculateProgress(classItem.startDate, classItem.endDate)}
                    className="h-2"
                  />
                </div>
              </div>
            ))}
            {filteredClasses.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                {classSearchTerm.trim() ? 'No classes found matching your search' : 'No classes available'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Students Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Students</CardTitle>
          <div className="flex gap-4">
            <Input
              placeholder="Search by student name..."
              value={studentSearchTerm}
              onChange={(e) => setStudentSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <div key={student.username} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{student.username}</h3>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Classes:</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {student.classes.map((classItem: ClassType) => (
                      <span key={classItem.id} className="px-2 py-1 bg-gray-200 rounded-full text-sm">
                        {classItem.className}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {filteredStudents.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                {studentSearchTerm.trim() ? 'No students found matching your search' : 'No students available'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Meetings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {meetings.slice(0, 5).map((meeting) => (
              <div key={meeting.meetingId} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{meeting.className}</h3>
                    <p className="text-sm text-gray-500">
                      Type: <span className="capitalize">{meeting.meetingType}</span>
                    </p>
                    {meeting.meetingNotes && (
                      <p className="text-sm text-gray-500 mt-2">Notes: {meeting.meetingNotes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      {meeting.meetingDate ? formatDateTime(meeting.meetingDate) : 'Date not set'}
                    </p>
                    <p className={`text-sm font-medium ${
                      meeting.studentAttended === 1 ? 'text-green-600' : 
                      meeting.studentAttended === 2 ? 'text-red-600' : 'text-orange-500'
                    }`}>
                      {meeting.studentAttended === 1 ? 'Attended' : 
                       meeting.studentAttended === 2 ? 'Absent' : 'Not Yet'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {meetings.length === 0 && (
              <p className="text-gray-500 text-center py-4">No meetings found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TutorDashboard 