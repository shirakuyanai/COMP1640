import { db } from '../config/db_config.js'
import Class from '../schema/Class.js'
import Student from '../schema/Student.js'
import Tutor from '../schema/Tutor.js'

export const getUpdatedDashboardData = async () => {
  try {
    const [classes, students, tutors] = await Promise.all([
      db.select().from(Class),
      db.select().from(Student),
      db.select().from(Tutor),
    ])

    const assignedStudentIds = new Set(classes.map((c) => c.studentId))
    const studentsWithoutClass = students.filter(
      (student) => !assignedStudentIds.has(student.studentId)
    )

    const tutorWorkload = tutors.map((tutor) => {
      const tutorClasses = classes.filter((c) => c.tutorId === tutor.tutorId)
      return {
        name: tutor.username,
        classes: tutorClasses.length,
        students: tutorClasses.length 
      }
    })

    return {
      totalClasses: classes.length,
      activeClasses: classes.filter((c) => c.status === 'active').length,
      studentsWithoutClass: studentsWithoutClass.length,
      totalStudents: students.length,
      totalTutors: tutors.length,
      recentActivities: classes.slice(0, 5), // Or sort by date if available
      classTrends: {
        total: classes.length,
        active: classes.filter((c) => c.status === 'active').length,
        inactive: classes.filter((c) => c.status !== 'active').length,
      },
      studentTrends: {
        assigned: students.length - studentsWithoutClass.length,
        unassigned: studentsWithoutClass.length
      },
      tutorWorkload
    }
  } catch (error) {
    console.error('Failed to build dashboard data:', error)
    return null
  }
}
