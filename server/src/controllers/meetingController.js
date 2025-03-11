import db from '../db';

export const createMeeting = async (req, res) => {
    try {
        const { userId, tutorId, meetingDate, meetingType, meetingNotes, meetingLink } = req.body;
        const newMeeting = await db.Meeting.create({
            data: { userId, tutorId, meetingDate, meetingType, meetingNotes, meetingLink }
        });
        res.status(201).json(newMeeting);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getMeetings = async (req, res) => {
    try {
        const meetings = await db.Meeting.findMany();
        res.status(200).json(meetings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedMeeting = await db.Meeting.update({
            where: { meetingId: id },
            data: updateData
        });
        res.status(200).json(updatedMeeting);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        await db.Meeting.delete({ where: { meetingId: id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
