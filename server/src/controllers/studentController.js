import db from '../db';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.EMAIL_SECURE === 'true', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmailNotification = async (studentEmail, tutorEmail) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: [studentEmail, tutorEmail],
            subject: 'Student Tutor Reassignment',
            text: `Hello,\n\nA student has been reassigned to a new tutor.\n\nBest regards,\nYour Team`,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${studentEmail} and ${tutorEmail}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

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
                await sendEmailNotification(student.email, tutor.email);
            }
        }

        res.status(200).json({ message: 'Students reassigned successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
