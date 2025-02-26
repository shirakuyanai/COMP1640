import express from 'express';
import { db } from '../config/db_config.js';
import StudentTutor from '../schema/StudentTutor.js';
import Student from '../schema/Student.js';
import Tutor from '../schema/Tutor.js';
import { eq, and } from 'drizzle-orm';

import { v4 as uuidv4 } from 'uuid';
import User from '../schema/User.js';

const router = express.Router();

// Add some dummy data to the database
const dummyUsers = [
  { userId: uuidv4(), name: 'Alice', role: 'student' },
  { userId: uuidv4(), name: 'Bob', role: 'student' },
  { userId: uuidv4(), name: 'Charlie', role: 'student' },
  { userId: uuidv4(), name: 'Diana', role: 'student' },
  { userId: uuidv4(), name: 'Ethan', role: 'student' },
  { userId: uuidv4(), name: 'David', role: 'tutor' },
  { userId: uuidv4(), name: 'Eve', role: 'tutor' },
  { userId: uuidv4(), name: 'Frank', role: 'tutor' },
  { userId: uuidv4(), name: 'Grace', role: 'tutor' },
  { userId: uuidv4(), name: 'Henry', role: 'tutor' },
];

const dummyStudents = dummyUsers.slice(0, 5).map(user => ({
  studentId: uuidv4(),
  userId: user.userId,
  name: user.name,
}));

const dummyTutors = dummyUsers.slice(5).map(user => ({
  tutorId: uuidv4(),
  userId: user.userId,
  name: user.name,
}));

async function insertDummyData() {
  try {
    // Insert dummy users
    await Promise.all(dummyUsers.map(async (user) => {
      try {
        await db.insert(User).values({
          userId: user.userId,
          username: user.name, // Assuming username is the name
          password: 'password', // Dummy password
          email: `${user.name}@example.com`, // Dummy email
          biography: `Biography for ${user.name}`, // Adding required biography field
        }).onConflictDoNothing();
        console.log('Inserted user:', user);
      } catch (error) {
        console.error('Error inserting user:', user, error);
      }
    }));

    // Insert dummy students
    await Promise.all(dummyStudents.map(async (student) => {
      try {
        await db.insert(Student).values({
          studentId: student.studentId,
          userId: student.userId,
        }).onConflictDoNothing();
        console.log('Inserted student:', student);
      } catch (error) {
        console.error('Error inserting student:', student, error);
      }
    }));

    // Insert dummy tutors
    await Promise.all(dummyTutors.map(async (tutor) => {
      try {
        await db.insert(Tutor).values({
          tutorId: tutor.tutorId,
          userId: tutor.userId,
        }).onConflictDoNothing();
        console.log('Inserted tutor:', tutor);
      } catch (error) {
        console.error('Error inserting tutor:', tutor, error);
      }
    }));

    console.log('Dummy data inserted successfully');
  } catch (error) {
    console.error('Error inserting dummy data:', error);
  }
}

insertDummyData();

// Get all students
router.get('/students', async (req, res) => {
  try {
    const students = await db.select().from(Student);
    console.log("Students:", students)
    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get students' });
  }
});

// Get all tutors
router.get('/tutors', async (req, res) => {
  try {
    const tutors = await db.select().from(Tutor);
    res.status(200).json(tutors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get tutors' });
  }
});

// Assign a student to a tutor
router.post('/assign', async (req, res) => {
  try {
    const { studentId, tutorId } = req.body;

    // Check if the student and tutor exist
    const student = await db.select().from(Student).where(eq(Student.studentId, studentId));
    const tutor = await db.select().from(Tutor).where(eq(Tutor.tutorId, tutorId));

    // Skip check for student and tutor existence when using dummy data
    //if (!student.length || !tutor.length) {
    //  return res.status(400).json({ error: 'Invalid student or tutor ID' });
    //}

    // Create the student-tutor relationship
    await db.insert(StudentTutor).values({
      studentId,
      tutorId,
    });

    res.status(201).json({ message: 'Student assigned to tutor successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to assign student to tutor' });
  }
});

// Get all tutors for a student
router.get('/student/:studentId/tutors', async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Join StudentTutor with Tutor to get tutor details
    const tutors = await db
      .select({
        tutorId: Tutor.tutorId,
        userId: Tutor.userId
      })
      .from(StudentTutor)
      .innerJoin(Tutor, eq(StudentTutor.tutorId, Tutor.tutorId))
      .where(eq(StudentTutor.studentId, studentId));

    res.status(200).json(tutors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get tutors for student' });
  }
});

// Get all students for a tutor
router.get('/tutor/:tutorId/students', async (req, res) => {
  try {
    const tutorId = req.params.tutorId;

    // Join StudentTutor with Student to get student details
    const students = await db
      .select({
        studentId: Student.studentId,
        userId: Student.userId
      })
      .from(StudentTutor)
      .innerJoin(Student, eq(StudentTutor.studentId, Student.studentId))
      .where(eq(StudentTutor.tutorId, tutorId));

    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get students for tutor' });
  }
});

// Assign multiple students to a tutor
router.post('/assign-multiple', async (req, res) => {
  try {
    const { studentIds, tutorId } = req.body;

    if (!Array.isArray(studentIds) || !tutorId) {
      return res.status(400).json({ error: 'Invalid request format. Expected studentIds array and tutorId' });
    }

    // Create the student-tutor relationships
    const values = studentIds.map(studentId => ({
      studentId,
      tutorId
    }));

    await db.insert(StudentTutor).values(values).onConflictDoNothing();

    res.status(201).json({ message: 'Students assigned to tutor successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to assign students to tutor' });
  }
});

// Remove a student-tutor assignment
router.delete('/unassign', async (req, res) => {
  try {
    const { studentId, tutorId } = req.body;

    if (!studentId || !tutorId) {
      return res.status(400).json({ error: 'Both studentId and tutorId are required' });
    }

    await db
      .delete(StudentTutor)
      .where(
        and(
          eq(StudentTutor.studentId, studentId),
          eq(StudentTutor.tutorId, tutorId)
        )
      );

    res.status(200).json({ message: 'Student unassigned from tutor successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to unassign student from tutor' });
  }
});

// Get all student-tutor assignments
router.get('/assignments', async (req, res) => {
  try {
    const assignments = await db
      .select({
        studentId: StudentTutor.studentId,
        tutorId: StudentTutor.tutorId
      })
      .from(StudentTutor);

    res.status(200).json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get assignments' });
  }
});

export default router;
