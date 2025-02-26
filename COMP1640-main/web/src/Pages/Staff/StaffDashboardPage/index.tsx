import { useState, useEffect } from "react";
import { SidebarLayout } from "../../../Components/sidebar-layout";
import { Button } from "../../../Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../Components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../Components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../Components/ui/table";
import { toast } from "../../../Components/ui/use-toast";
import { Users, UserCheck, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../../Components/ui/alert";

interface Student {
  studentId: string;
  userId: string;
  name?: string;
}

interface Tutor {
  tutorId: string;
  userId: string;
  name?: string;
}

interface Assignment {
  studentId: string;
  tutorId: string;
}

export default function StaffDashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch students
        const studentsResponse = await fetch("/studentTutor/students");
        if (!studentsResponse.ok) throw new Error("Failed to fetch students");
        const studentsData = await studentsResponse.json();
        
        // Fetch tutors
        const tutorsResponse = await fetch("/studentTutor/tutors");
        if (!tutorsResponse.ok) throw new Error("Failed to fetch tutors");
        const tutorsData = await tutorsResponse.json();
        
        // Fetch assignments
        const assignmentsResponse = await fetch("/studentTutor/assignments");
        if (!assignmentsResponse.ok) throw new Error("Failed to fetch assignments");
        const assignmentsData = await assignmentsResponse.json();

        // Use the data as is, without trying to fetch user details
        setStudents(studentsData);
        setTutors(tutorsData);
        setAssignments(assignmentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAssignStudentToTutor = async () => {
    if (selectedStudent && selectedTutor) {
      try {
        setLoading(true);
        const response = await fetch("/studentTutor/assign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId: selectedStudent,
            tutorId: selectedTutor,
          }),
        });

        if (!response.ok) throw new Error("Failed to assign student to tutor");

        // Refresh assignments after successful assignment
        const assignmentsResponse = await fetch("/studentTutor/assignments");
        if (!assignmentsResponse.ok) throw new Error("Failed to fetch updated assignments");
        const assignmentsData = await assignmentsResponse.json();
        setAssignments(assignmentsData);

        toast({
          title: "Success",
          description: "Student assigned to tutor successfully!",
          variant: "success",
        });
      } catch (error) {
        console.error("Error assigning student to tutor:", error);
        toast({
          title: "Error",
          description: "Failed to assign student to tutor. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    } else {
      toast({
        title: "Warning",
        description: "Please select both a student and a tutor.",
        variant: "warning",
      });
    }
  };

  const handleUnassignStudentFromTutor = async (studentId: string, tutorId: string) => {
    try {
      setLoading(true);
      const response = await fetch("/studentTutor/unassign", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          tutorId,
        }),
      });

      if (!response.ok) throw new Error("Failed to unassign student from tutor");

      // Refresh assignments after successful unassignment
      const assignmentsResponse = await fetch("/studentTutor/assignments");
      if (!assignmentsResponse.ok) throw new Error("Failed to fetch updated assignments");
      const assignmentsData = await assignmentsResponse.json();
      setAssignments(assignmentsData);

      toast({
        title: "Success",
        description: "Student unassigned from tutor successfully!",
        variant: "success",
      });
    } catch (error) {
      console.error("Error unassigning student from tutor:", error);
      toast({
        title: "Error",
        description: "Failed to unassign student from tutor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get student display name by ID
  const getStudentName = (studentId: string) => {
    const student = students.find((s) => s.studentId === studentId);
    return student ? `Student (ID: ${studentId.substring(0, 8)})` : `Student ${studentId.substring(0, 8)}`;
  };

  // Helper function to get tutor display name by ID
  const getTutorName = (tutorId: string) => {
    const tutor = tutors.find((t) => t.tutorId === tutorId);
    return tutor ? `Tutor (ID: ${tutorId.substring(0, 8)})` : `Tutor ${tutorId.substring(0, 8)}`;
  };

  if (error) {
    return (
      <SidebarLayout>
        <div className="container mx-auto p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}. Please try refreshing the page or contact support if the problem persists.
            </AlertDescription>
          </Alert>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Staff Dashboard</h1>

        {loading && (
          <Alert className="mb-4">
            <AlertTitle>Loading</AlertTitle>
            <AlertDescription>Please wait while we fetch the data...</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2" />
                Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.studentId} value={student.studentId}>
                      {`Student (ID: ${student.studentId.substring(0, 8)})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="mr-2" />
                Tutors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={setSelectedTutor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tutor" />
                </SelectTrigger>
                <SelectContent>
                  {tutors.map((tutor) => (
                    <SelectItem key={tutor.tutorId} value={tutor.tutorId}>
                      {`Tutor (ID: ${tutor.tutorId.substring(0, 8)})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assign Students to Tutors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">Select a student and a tutor to make an assignment</p>
              <Button 
                onClick={handleAssignStudentToTutor}
                disabled={loading || !selectedStudent || !selectedTutor}
              >
                Assign Student to Tutor
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Tutor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    {selectedStudent 
                      ? `Student (ID: ${selectedStudent.substring(0, 8)})` 
                      : "Not selected"}
                  </TableCell>
                  <TableCell>
                    {selectedTutor 
                      ? `Tutor (ID: ${selectedTutor.substring(0, 8)})` 
                      : "Not selected"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Current Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {assignments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Tutor</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment, index) => (
                    <TableRow key={index}>
                      <TableCell>{getStudentName(assignment.studentId)}</TableCell>
                      <TableCell>{getTutorName(assignment.tutorId)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleUnassignStudentFromTutor(assignment.studentId, assignment.tutorId)}
                          disabled={loading}
                        >
                          Unassign
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-4 text-gray-500">No assignments found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
