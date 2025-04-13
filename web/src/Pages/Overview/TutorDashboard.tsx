import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Progress } from '@/Components/ui/progress'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { getClassesForUser, getMeetingsOfAClass } from '@/actions/getData'
import { FaCalendarCheck, FaChalkboardTeacher, FaGraduationCap } from 'react-icons/fa'
import { FaCalendarDays, FaComments, FaUsers } from 'react-icons/fa6'
import { format, isValid, parse } from 'date-fns'
import { Input } from '@/Components/ui/input'

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
      // Try multiple date parsing approaches
      let date;
      
      // First try direct Date constructor (for ISO strings)
      date = new Date(dateString);
      
      // Check if that worked
      if (isValid(date)) {
        return format(date, 'MMM d, yyyy')
      }
      
      // Try parsing with the expected format
      date = parse(dateString, 'MMMM d, yyyy \'at\' hh:mm:ss aa', new Date())
      
      // If that worked, return formatted date
      if (isValid(date)) {
        return format(date, 'MMM d, yyyy')
      }
      
      // If we got here, neither approach worked
      console.error('Could not parse date string:', dateString)
      return 'Not set'
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

  // Helper function to calculate class progress percentage
  const calculateProgress = (startDate: string | null, endDate: string | null) => {
    if (!startDate || !endDate) return 0;
    
    try {
      // Try multiple parsing approaches
      let start, end;
      
      // First try direct Date constructor
      start = new Date(startDate);
      end = new Date(endDate);
      
      // If that didn't work, try the specific format
      if (!isValid(start) || !isValid(end)) {
        start = parse(startDate, 'MMMM d, yyyy \'at\' hh:mm:ss aa', new Date());
        end = parse(endDate, 'MMMM d, yyyy \'at\' hh:mm:ss aa', new Date());
      }
      
      // If still not valid dates, return 0
      if (!isValid(start) || !isValid(end)) {
        console.error('Invalid dates for progress calculation:', { startDate, endDate });
        return 0;
      }
      
      const now = new Date();
      
      if (now < start) return 0;
      if (now > end) return 100;
      
      const total = end.getTime() - start.getTime();
      const current = now.getTime() - start.getTime();
      const progress = Math.round((current / total) * 100);
      
      return Math.min(Math.max(progress, 0), 100);
    } catch (error) {
      console.error('Error calculating progress:', error);
      return 0;
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

  const StatCard = ({ icon, title, value, description, color }: any) => (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardContent className="flex items-center p-4 md:p-6">
        <div className={`${color} p-3 md:p-4 rounded-xl shadow-sm`}>
          {icon}
        </div>
        <div className="ml-3 md:ml-4">
          <p className="text-xs md:text-sm font-medium text-slate-500">{title}</p>
          <h4 className="text-lg md:text-2xl font-bold text-slate-800">{value}</h4>
          <p className="text-xs md:text-sm text-slate-500">{description}</p>
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
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 md:p-8 space-y-4 md:space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-slate-100">
        <h1 className="text-xl md:text-3xl font-bold text-slate-800 mb-1">Welcome, {currentUser?.username}!</h1>
        <p className="text-sm md:text-base text-slate-500">Here's a summary of your tutoring activities</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
        <StatCard
          icon={<FaChalkboardTeacher className="text-indigo-600 h-5 w-5 md:h-6 md:w-6" />}
          title="Total Classes"
          value={stats.totalClasses}
          description="Active classes"
          color="bg-indigo-100"
        />
        <StatCard
          icon={<FaUsers className="text-blue-600 h-5 w-5 md:h-6 md:w-6" />}
          title="Total Students"
          value={stats.totalStudents}
          description="Assigned students"
          color="bg-blue-100"
        />
        <StatCard
          icon={<FaCalendarDays className="text-green-600 h-5 w-5 md:h-6 md:w-6" />}
          title="Total Meetings"
          value={stats.totalMeetings}
          description="Scheduled meetings"
          color="bg-green-100"
        />
        <StatCard
          icon={<FaCalendarCheck className="text-amber-600 h-5 w-5 md:h-6 md:w-6" />}
          title="Upcoming"
          value={stats.upcomingMeetings}
          description="Future meetings"
          color="bg-amber-100"
        />
        <StatCard
          icon={<FaComments className="text-purple-600 h-5 w-5 md:h-6 md:w-6" />}
          title="Completed"
          value={stats.completedMeetings}
          description="Past meetings"
          color="bg-purple-100"
        />
      </div>

      {/* Classes Overview */}
      <Card className="border-none shadow-md">
        <CardHeader className="border-b border-slate-100 bg-white rounded-t-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
          <CardTitle className="text-slate-800 text-lg md:text-xl">My Classes</CardTitle>
          <div className="flex gap-4 w-full md:w-auto">
            <Input
              placeholder="Search by class name..."
              value={classSearchTerm}
              onChange={(e) => setClassSearchTerm(e.target.value)}
              className="w-full md:w-64 border-slate-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="bg-white rounded-b-xl p-3 md:p-6">
          <div className="space-y-3 md:space-y-4">
            {filteredClasses.map((classItem) => (
              <div key={classItem.id} className="p-4 md:p-6 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
                  <div>
                    <h3 className="font-semibold text-base md:text-lg text-slate-800">{classItem.className}</h3>
                  </div>
                  <div className="text-xs md:text-sm text-slate-500 bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg shadow-sm border border-slate-100">
                    <p>{formatDate(classItem.startDate)} - {formatDate(classItem.endDate)}</p>
                  </div>
                </div>
                
                {/* Progress bar for class completion */}
                <div className="mt-4 md:mt-6">
                  <div className="flex justify-between text-xs md:text-sm mb-2">
                    <span className="text-slate-600 font-medium">Progress</span>
                    <span className="text-blue-600 font-semibold">{calculateProgress(classItem.startDate, classItem.endDate)}%</span>
                  </div>
                  <Progress 
                    value={calculateProgress(classItem.startDate, classItem.endDate)}
                    className="h-2 md:h-2.5 bg-slate-200"
                  />
                </div>
              </div>
            ))}
            {filteredClasses.length === 0 && (
              <p className="text-slate-500 text-center py-4 md:py-8 text-sm md:text-base">
                {classSearchTerm.trim() ? 'No classes found matching your search' : 'No classes available'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Students Overview */}
      <Card className="border-none shadow-md">
        <CardHeader className="border-b border-slate-100 bg-white rounded-t-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
          <CardTitle className="text-slate-800 text-lg md:text-xl">My Students</CardTitle>
          <div className="flex gap-4 w-full md:w-auto">
            <Input
              placeholder="Search by student name..."
              value={studentSearchTerm}
              onChange={(e) => setStudentSearchTerm(e.target.value)}
              className="w-full md:w-64 border-slate-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="bg-white rounded-b-xl p-3 md:p-6">
          <div className="space-y-3 md:space-y-4">
            {filteredStudents.map((student) => (
              <div key={student.username} className="p-4 md:p-6 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50 transition-colors">
                <div>
                  <h3 className="font-semibold text-base md:text-lg text-slate-800 flex items-center gap-2">
                    <div className="bg-blue-500 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-semibold">
                      {student.username.substring(0, 1).toUpperCase()}
                    </div>
                    {student.username}
                  </h3>
                </div>
                <div className="mt-3 md:mt-4">
                  <p className="text-xs md:text-sm text-slate-500 mb-2 font-medium">Classes:</p>
                  <div className="flex flex-wrap gap-2">
                    {student.classes.map((classItem: ClassType) => (
                      <span key={classItem.id} className="px-2 md:px-3 py-1 md:py-1.5 bg-white text-slate-700 rounded-md text-xs md:text-sm border border-slate-200 shadow-sm">
                        {classItem.className}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {filteredStudents.length === 0 && (
              <p className="text-slate-500 text-center py-4 md:py-8 text-sm md:text-base">
                {studentSearchTerm.trim() ? 'No students found matching your search' : 'No students available'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Meetings */}
      <Card className="border-none shadow-md">
        <CardHeader className="border-b border-slate-100 bg-white rounded-t-xl">
          <CardTitle className="text-slate-800 text-lg md:text-xl">Recent Meetings</CardTitle>
        </CardHeader>
        <CardContent className="bg-white rounded-b-xl p-3 md:p-6">
          <div className="space-y-3 md:space-y-4">
            {meetings.length === 0 ? (
              <p className="text-slate-500 text-center py-4 md:py-8 text-sm md:text-base">No meetings found</p>
            ) : (
              meetings.slice(0, 5).map((meeting) => (
                <div key={meeting.meetingId} className="p-4 md:p-6 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-100 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
                    <div>
                      <h3 className="font-semibold text-base md:text-lg text-slate-800">{meeting.className}</h3>
                      <p className="text-xs md:text-sm text-slate-500 mt-1">
                        Type: <span className="capitalize">{meeting.meetingType}</span>
                      </p>
                      {meeting.meetingNotes && (
                        <p className="text-xs md:text-sm text-slate-600 mt-2 md:mt-3 bg-white p-2 md:p-3 rounded-lg border border-slate-100">
                          {meeting.meetingNotes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs md:text-sm bg-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg shadow-sm border border-slate-100">
                        {meeting.meetingDate ? formatDateTime(meeting.meetingDate) : 'Date not set'}
                      </p>
                      <p className={`text-xs md:text-sm font-medium mt-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg ${
                        meeting.studentAttended === 1 
                          ? 'text-green-600 bg-green-50 border border-green-100' 
                          : meeting.studentAttended === 2 
                            ? 'text-red-600 bg-red-50 border border-red-100' 
                            : 'text-amber-600 bg-amber-50 border border-amber-100'
                      }`}>
                        {meeting.studentAttended === 1 ? 'Attended' : 
                         meeting.studentAttended === 2 ? 'Absent' : 'Not Yet'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TutorDashboard 