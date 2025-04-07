import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, subWeeks, addWeeks, subYears, addYears, parse } from 'date-fns';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { getClassesForUser, getMeetingsOfAClass } from '@/actions/getData';
import { useGlobalState } from '@/misc/GlobalStateContext';

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
  day: number;
  meetingLink?: string;
  notes?: string;
}

const Schedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedWeek, setSelectedWeek] = useState(startOfWeek(currentDate));
  const [scheduleData, setScheduleData] = useState<ScheduleSlot[]>([]);
  const { currentUser, authToken } = useGlobalState();
  const [loading, setLoading] = useState(true);

  const handlePreviousWeek = () => {
    setSelectedWeek(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setSelectedWeek(prev => addWeeks(prev, 1));
  };

  const handlePreviousYear = () => {
    const newDate = subYears(selectedWeek, 1);
    setSelectedWeek(newDate);
    setCurrentDate(newDate);
  };

  const handleNextYear = () => {
    const newDate = addYears(selectedWeek, 1);
    setSelectedWeek(newDate);
    setCurrentDate(newDate);
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

        console.log('Fetched classes:', classes);

        // Then get meetings for each class
        const allMeetings: Meeting[] = [];
        for (const classItem of classes) {
          try {
            const meetings = await getMeetingsOfAClass({
              classId: classItem.id,
              token: authToken,
            });
            console.log(`Meetings for class ${classItem.className}:`, meetings);
            
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

        console.log('All meetings before transformation:', allMeetings);

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

            return {
              id: meeting.meetingId,
              title: meeting.className || 'Unknown Class',
              location: meeting.location,
              meetingType: meeting.meetingType,
              startTime: format(meetingDate, 'HH:mm'),
              endTime: format(endDate, 'HH:mm'),
              day: meetingDate.getDay(),
              meetingLink: meeting.meetingLink,
              notes: meeting.meetingNotes,
            };
          } catch (error) {
            console.error('Error transforming meeting:', meeting, error);
            return null;
          }
        }).filter(Boolean) as ScheduleSlot[];

        console.log('Transformed schedule slots:', slots);
        setScheduleData(slots);
      } catch (error) {
        console.error('Error in fetchMeetings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [currentUser, authToken]);

  // Generate time slots from 7:00 AM to 5:30 PM
  const timeSlots = Array.from({ length: 21 }, (_, i) => {
    const hour = Math.floor(i / 2) + 7;
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(selectedWeek, i);
    return {
      date: day,
      name: format(day, 'EEE'),
      fullDate: format(day, 'MMM dd'),
    };
  });

  const getScheduleForTimeAndDay = (time: string, dayIndex: number) => {
    return scheduleData.find(
      slot => {
        // Parse the time slot and meeting times for comparison
        const [slotHour, slotMinute] = time.split(':').map(Number);
        const [startHour, startMinute] = slot.startTime.split(':').map(Number);
        const [endHour, endMinute] = slot.endTime.split(':').map(Number);
        
        // Convert to minutes for easier comparison
        const slotTimeInMinutes = slotHour * 60 + slotMinute;
        const startTimeInMinutes = startHour * 60 + startMinute;
        const endTimeInMinutes = endHour * 60 + endMinute;
        
        // Check if this time slot falls within the meeting duration
        // For a meeting from 9:30-10:30, this should return true for 9:30, 10:00, and 10:30
        return (
          slot.day === dayIndex && 
          slotTimeInMinutes >= startTimeInMinutes && 
          slotTimeInMinutes <= endTimeInMinutes
        );
      }
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Loading schedule...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Meeting Schedule</h1>
          <div className="flex gap-4">
            {/* Year Navigation */}
            <div className="flex items-center gap-3 bg-white rounded-lg shadow px-3 py-2">
              <button
                onClick={handlePreviousYear}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FaChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-medium text-gray-900">
                {format(selectedWeek, 'yyyy')}
              </span>
              <button
                onClick={handleNextYear}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FaChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            {/* Week Navigation */}
            <div className="flex items-center gap-3 bg-white rounded-lg shadow px-3 py-2">
              <button
                onClick={handlePreviousWeek}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FaChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-medium text-gray-900">
                {format(selectedWeek, 'MMM dd')} - {format(addDays(selectedWeek, 6), 'MMM dd')}
              </span>
              <button
                onClick={handleNextWeek}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FaChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <p className="text-gray-600">View your weekly meeting schedule</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header with days */}
        <div className="grid grid-cols-8 border-b">
          <div className="p-4 text-sm font-medium text-gray-500">Time</div>
          {weekDays.map((day, index) => (
            <div key={index} className="p-4 text-center border-l">
              <div className="font-medium text-gray-900">{day.name}</div>
              <div className="text-sm text-gray-500">{day.fullDate}</div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="divide-y">
          {timeSlots.map((time, timeIndex) => (
            <div key={timeIndex} className="grid grid-cols-8">
              <div className="p-2 text-sm font-medium text-gray-500 border-r bg-gray-50">
                {formatTimeForDisplay(time)}
              </div>
              {weekDays.map((_, dayIndex) => {
                const scheduleItem = getScheduleForTimeAndDay(time, dayIndex);
                return (
                  <div
                    key={dayIndex}
                    className={`p-2 border-l min-h-[3rem] ${
                      scheduleItem
                        ? scheduleItem.meetingType === 'online' 
                          ? 'bg-blue-50' 
                          : 'bg-green-50'
                        : timeIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    {scheduleItem && (
                      <div className="text-sm">
                        <div className="font-medium text-blue-600">
                          {scheduleItem.title}
                        </div>
                        <div className="text-gray-500">
                          {scheduleItem.meetingType === 'online' 
                            ? 'Online Meeting'
                            : scheduleItem.location || 'Location TBD'
                          }
                        </div>
                        <div className="text-gray-400">
                          {`${formatTimeForDisplay(scheduleItem.startTime)} - ${formatTimeForDisplay(scheduleItem.endTime)}`}
                        </div>
                        {scheduleItem.meetingType === 'online' && scheduleItem.meetingLink && (
                          <a
                            href={scheduleItem.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 text-xs mt-1 block"
                          >
                            Join Meeting
                          </a>
                        )}
                        {scheduleItem.notes && (
                          <div className="text-gray-500 text-xs mt-1 italic">
                            {scheduleItem.notes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Schedule; 