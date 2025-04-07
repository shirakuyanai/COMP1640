import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { useGlobalState } from '@/misc/GlobalStateContext';
import { getAllClasses } from '@/actions/getData';
import { FaEdit, FaTrash, FaSave, FaTimes, FaUserGraduate, FaChalkboardTeacher, FaCalendarAlt } from 'react-icons/fa';
import { toast } from '@/Components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface ClassType {
  id: string;
  className: string;
  studentUsername: string;
  tutorUsername: string;
  studentId: string;
  tutorId: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

interface ClassCardProps {
  classData: ClassType;
  onUpdate: () => void;
}

const ClassCard = ({ classData, onUpdate }: ClassCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(classData);
  const { authToken } = useGlobalState();

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedData(classData);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_HOST}/updateClass`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authentication: `Bearer ${authToken}`,
          API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
        },
        body: JSON.stringify({
          classId: classData.id,
          className: editedData.className,
          startDate: editedData.startDate,
          endDate: editedData.endDate,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Class updated successfully",
        });
        setIsEditing(false);
        onUpdate();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update class');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update class",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_HOST}/deleteClass`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authentication: `Bearer ${authToken}`,
          API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
        },
        body: JSON.stringify({
          classId: classData.id,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Class deleted successfully",
        });
        onUpdate();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete class');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete class",
        variant: "destructive",
      });
    }
  };

  // Determine class status color
  const getStatusColorClass = () => {
    if (!classData.status) return "from-gray-500 to-gray-600";
    
    switch(classData.status.toLowerCase()) {
      case 'active':
        return "from-green-500 to-emerald-600";
      case 'upcoming':
        return "from-blue-500 to-indigo-600";
      case 'completed':
        return "from-gray-500 to-gray-600";
      default:
        return "from-purple-500 to-indigo-600";
    }
  };

  return (
    <Card className="mb-4 overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100">
      <div className={`h-1.5 bg-gradient-to-r ${getStatusColorClass()}`} />
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
        <div className="flex items-center gap-4">
          <CardTitle className="text-xl font-semibold">
            {isEditing ? (
              <Input
                value={editedData.className}
                onChange={(e) => setEditedData({ ...editedData, className: e.target.value })}
                className="max-w-sm"
              />
            ) : (
              <span className="text-gray-800">{classData.className || `Class #${classData.id}`}</span>
            )}
          </CardTitle>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white flex items-center gap-1.5"
              >
                <FaSave className="h-3.5 w-3.5" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-700 border-gray-200 flex items-center gap-1.5"
              >
                <FaTimes className="h-3.5 w-3.5" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleEdit}
                className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 flex items-center gap-1.5"
              >
                <FaEdit className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 flex items-center gap-1.5"
              >
                <FaTrash className="h-3.5 w-3.5" />
                Delete
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white h-8 w-8 rounded-full flex items-center justify-center">
                <FaUserGraduate className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs">Student</span>
                <span className="font-medium text-gray-800">{classData.studentUsername}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-violet-600 text-white h-8 w-8 rounded-full flex items-center justify-center">
                <FaChalkboardTeacher className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs">Tutor</span>
                <span className="font-medium text-gray-800">{classData.tutorUsername}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {isEditing ? (
              <>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs mb-1">Start Date</span>
                  <Input
                    type="datetime-local"
                    value={editedData.startDate}
                    onChange={(e) => setEditedData({ ...editedData, startDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs mb-1">End Date</span>
                  <Input
                    type="datetime-local"
                    value={editedData.endDate}
                    onChange={(e) => setEditedData({ ...editedData, endDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white h-8 w-8 rounded-full flex items-center justify-center">
                    <FaCalendarAlt className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs">Start Date</span>
                    <span className="font-medium text-gray-800">
                      {classData.startDate ? new Date(classData.startDate).toLocaleString() : 'Not set'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white h-8 w-8 rounded-full flex items-center justify-center">
                    <FaCalendarAlt className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs">End Date</span>
                    <span className="font-medium text-gray-800">
                      {classData.endDate ? new Date(classData.endDate).toLocaleString() : 'Not set'}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ClassList = () => {
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [loading, setLoading] = useState(true);
  const { authToken } = useGlobalState();
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await getAllClasses(authToken);
      if (response) {
        setClasses(response);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch classes",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch classes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [authToken]);

  const filteredClasses = classes.filter(
    classItem =>
      classItem.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.studentUsername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.tutorUsername?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-2" />
        <p className="text-gray-600">Loading classes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            All Classes
          </h2>
          <p className="text-gray-600">Manage and edit your classes</p>
        </div>
        <div className="w-full md:w-1/3">
          <Input
            type="text"
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredClasses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
            <p className="text-gray-500">No classes found</p>
          </div>
        ) : (
          filteredClasses.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classData={classItem}
              onUpdate={fetchClasses}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ClassList; 