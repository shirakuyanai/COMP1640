import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { useGlobalState } from '@/misc/GlobalStateContext';
import { getAllClasses } from '@/actions/getData';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from '@/Components/ui/use-toast';

interface ClassType {
  id: string;
  className: string;
  studentUsername: string;
  tutorUsername: string;
  studentId: string;
  tutorId: string;
  startDate?: string;
  endDate?: string;
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

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-4">
          <CardTitle className="text-xl font-bold">
            {isEditing ? (
              <Input
                value={editedData.className}
                onChange={(e) => setEditedData({ ...editedData, className: e.target.value })}
                className="max-w-sm"
              />
            ) : (
              <span className="text-blue-600">{classData.className || `Class #${classData.id}`}</span>
            )}
          </CardTitle>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
              >
                <FaSave className="h-4 w-4" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-700 flex items-center gap-2"
              >
                <FaTimes className="h-4 w-4" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleEdit}
                className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 flex items-center gap-2"
              >
                <FaEdit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 flex items-center gap-2"
              >
                <FaTrash className="h-4 w-4" />
                Delete
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex flex-col">
              <span className="text-gray-500 text-sm">Student</span>
              <span className="font-medium">{classData.studentUsername}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 text-sm">Tutor</span>
              <span className="font-medium">{classData.tutorUsername}</span>
            </div>
          </div>
          <div className="space-y-2">
            {isEditing ? (
              <>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Start Date</span>
                  <Input
                    type="datetime-local"
                    value={editedData.startDate}
                    onChange={(e) => setEditedData({ ...editedData, startDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">End Date</span>
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
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">Start Date</span>
                  <span className="font-medium">
                    {classData.startDate ? new Date(classData.startDate).toLocaleString() : 'Not set'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-sm">End Date</span>
                  <span className="font-medium">
                    {classData.endDate ? new Date(classData.endDate).toLocaleString() : 'Not set'}
                  </span>
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

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await getAllClasses(authToken);
      if (response.status === 200) {
        setClasses(response.item);
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

  if (loading) {
    return <div className="text-center py-4">Loading classes...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">All Classes</h2>
      {classes.length === 0 ? (
        <p className="text-center text-gray-500">No classes found</p>
      ) : (
        classes.map((classItem) => (
          <ClassCard
            key={classItem.id}
            classData={classItem}
            onUpdate={fetchClasses}
          />
        ))
      )}
    </div>
  );
};

export default ClassList; 