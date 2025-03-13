import db from '../db';
import { sendMail } from '../lib/mailer';

export const reassignStudents = async (req, res) => {
    try {
        const { studentIds, newTutorId } = req.body;
        if (!studentIds || !newTutorId) {
            return res.status(400).json({ message: 'Invalid input' });
        }

        for (const studentId of studentIds) {
            await db.Class.update({
                where: { studentId },
                data: { tutorId: newTutorId },
            });

            const student = await db.Student.findUnique({ where: { studentId } });
            const tutor = await db.Tutor.findUnique({ where: { tutorId: newTutorId } });
            
            if (student && tutor) {
                const subject = 'Student Tutor Reassignment';
                const text = `Hello,\n\nA student has been reassigned to a new tutor.\n\nBest regards,\nYour Team`;
                await sendMail(tutor.email, subject, text);
            }
        }

        res.status(200).json({ message: 'Students reassigned successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
