import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, isSameDay, subMonths, addMonths, parse, isWithinInterval, differenceInMinutes } from 'date-fns';
import { FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaVideo, FaCalendarAlt, FaClock, FaInfo } from 'react-icons/fa';
import { getClassesForUser, getMeetingsOfAClass } from '@/actions/getData';
import { useGlobalState } from '@/misc/GlobalStateContext';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';

interface Meeting {
  meetingId: string;
  meetingDate: string;
  meetingType: 'in-person' | 'online';
  meetingLink?: string;
  location?: string;
  meetingNotes?: string;
  studentAttended: number;
  className?: string;
}

interface ScheduleSlot {
  id: string;
  title: string;
  location?: string;
  meetingType: 'in-person' | 'online';
  startTime: string;
  endTime: string;
  date: Date;
  meetingLink?: string;
  notes?: string;
  duration: number; // in minutes
  studentAttended: number; // 0: not yet, 1: attended, 2: absent
}

interface MeetingsByDate {
  [key: string]: ScheduleSlot[];
}

const Schedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduleData, setScheduleData] = useState<ScheduleSlot[]>([]);
  const [meetingsByDate, setMeetingsByDate] = useState<MeetingsByDate>({});
  const [loading, setLoading] = useState(true);
  const { currentUser, authToken } = useGlobalState();

  const handlePreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  // Parse custom date format
  const parseMeetingDate = (dateString: string): Date => {
    try {
      // Format: "April 11, 2025 at 03:57:00 PM"
      return parse(dateString, 'MMMM d, yyyy \'at\' hh:mm:ss a', new Date());
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return new Date();
    }
  };

  // Format time for display (e.g., "09:00" to "9:00 AM")
  const formatTimeForDisplay = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!currentUser || !authToken) return;

      try {
        setLoading(true);
        // First get all classes
        const classes = await getClassesForUser({
          token: authToken,
          userId: currentUser.id,
          role: currentUser.role,
        });

        // Then get meetings for each class
        const allMeetings: Meeting[] = [];
        for (const classItem of classes) {
          try {
            const meetings = await getMeetingsOfAClass({
              classId: classItem.id,
              token: authToken,
            });
            
            // Add class name to each meeting
            meetings.forEach((meeting: Meeting) => {
              allMeetings.push({
                ...meeting,
                className: classItem.className,
              });
            });
          } catch (error) {
            console.error(`Error fetching meetings for class ${classItem.className}:`, error);
          }
        }

        // Transform meetings into schedule slots
        const slots: ScheduleSlot[] = allMeetings.map(meeting => {
          try {
            const meetingDate = parseMeetingDate(meeting.meetingDate);
            if (isNaN(meetingDate.getTime())) {
              console.error('Invalid meeting date:', meeting.meetingDate, 'for meeting:', meeting);
              return null;
            }

            // Calculate end time (1 hour after start time)
            const endDate = new Date(meetingDate);
            endDate.setHours(endDate.getHours() + 1);

            // Calculate duration in minutes
            const durationMinutes = differenceInMinutes(endDate, meetingDate);

            return {
              id: meeting.meetingId,
              title: meeting.className || 'Unknown Class',
              location: meeting.location,
              meetingType: meeting.meetingType,
              startTime: format(meetingDate, 'HH:mm'),
              endTime: format(endDate, 'HH:mm'),
              date: meetingDate,
              meetingLink: meeting.meetingLink,
              notes: meeting.meetingNotes,
              duration: durationMinutes,
              studentAttended: meeting.studentAttended
            };
          } catch (error) {
            console.error('Error transforming meeting:', meeting, error);
            return null;
          }
        }).filter(Boolean) as ScheduleSlot[];

        // Group meetings by date
        const byDate: MeetingsByDate = {};
        slots.forEach(slot => {
          const dateKey = format(slot.date, 'yyyy-MM-dd');
          if (!byDate[dateKey]) {
            byDate[dateKey] = [];
          }
          byDate[dateKey].push(slot);
        });

        // Sort meetings within each date by start time
        Object.keys(byDate).forEach(date => {
          byDate[date].sort((a, b) => {
            const timeA = a.startTime.split(':').map(Number);
            const timeB = b.startTime.split(':').map(Number);
            return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
          });
        });

        setScheduleData(slots);
        setMeetingsByDate(byDate);
      } catch (error) {
        console.error('Error in fetchMeetings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [currentUser, authToken]);

  // Filter meetings for the current month
  const currentMonthMeetings = Object.entries(meetingsByDate)
    .filter(([dateKey]) => {
      const date = new Date(dateKey);
      return date.getMonth() === currentDate.getMonth() && 
             date.getFullYear() === currentDate.getFullYear();
    })
    .sort(([dateKeyA], [dateKeyB]) => {
      return new Date(dateKeyA).getTime() - new Date(dateKeyB).getTime();
    });

  const hasMeetings = currentMonthMeetings.length > 0;

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-60">
          <div className="w-12 h-12 border-4 border-t-indigo-600 border-indigo-200 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading your schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6 text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <FaCalendarAlt className="h-5 w-5" />
              <span>Meeting Schedule</span>
            </h1>
            <div className="flex items-center gap-4">
              <Button 
                onClick={handlePreviousMonth}
                variant="outline"
                size="sm"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                <FaChevronLeft className="w-4 h-4 mr-1" />
                Prev
              </Button>
              <h2 className="text-lg font-semibold">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <Button 
                onClick={handleNextMonth}
                variant="outline"
                size="sm"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                Next
                <FaChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
          <p className="text-white/80 mt-2">Your schedule</p>
        </div>
      </div>

      {!hasMeetings ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCalendarAlt className="h-7 w-7 text-indigo-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No meetings this month</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            You don't have any scheduled meetings for {format(currentDate, 'MMMM yyyy')}. 
            Try another month or check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {currentMonthMeetings.map(([dateKey, meetings]) => (
            <div key={dateKey} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                  {format(new Date(dateKey), 'd')}
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
                </h3>
              </div>

              <div className="grid gap-4 pl-10">
                {meetings.map((meeting) => (
                  <Card key={meeting.id} className="border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                    <div className={`h-1 ${
                      meeting.meetingType === 'online' 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
                        : 'bg-gradient-to-r from-emerald-500 to-green-500'
                    }`}></div>
                    <div className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              meeting.meetingType === 'online' 
                                ? 'bg-blue-50 text-blue-600' 
                                : 'bg-green-50 text-green-600'
                            }`}>
                              {meeting.meetingType === 'online' 
                                ? <FaVideo className="h-5 w-5" />
                                : <FaMapMarkerAlt className="h-5 w-5" />
                              }
                            </div>
                            <div className="w-full">
                              <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-gray-800">{meeting.title}</h4>
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                <FaClock className="h-3.5 w-3.5 text-gray-400" />
                                <span>
                                  {formatTimeForDisplay(meeting.startTime)} - {formatTimeForDisplay(meeting.endTime)}
                                </span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                  {meeting.duration} mins
                                </span>
                              </div>
                              {meeting.location && (
                                <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                                  <FaMapMarkerAlt className="h-3.5 w-3.5 text-gray-400" />
                                  <span>{meeting.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {meeting.notes && (
                            <div className="mt-3 pl-10">
                              <div className="text-xs text-gray-500 flex items-start gap-2 bg-gray-50 p-2 rounded-md border border-gray-100">
                                <FaInfo className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
                                <div>{meeting.notes}</div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="pl-10 md:pl-0 flex items-center gap-3">
                          {meeting.meetingType === 'online' && meeting.meetingLink && (
                            <a
                              href={meeting.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                            >
                              Join Meeting
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Schedule; 