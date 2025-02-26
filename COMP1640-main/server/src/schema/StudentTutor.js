import { pgTable, uuid } from 'drizzle-orm/pg-core';
import Student from './Student.js';
import Tutor from './Tutor.js';

const StudentTutor = pgTable('student_tutor', {
  studentId: uuid('studentId')
    .references(() => Student.studentId)
    .notNull(),
  tutorId: uuid('tutorId')
    .references(() => Tutor.tutorId)
    .notNull(),
});

export default StudentTutor;
