import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/Components/ui/button'
import { Card } from '@/Components/ui/card'
import { Eye } from 'lucide-react'

interface StudentCardProps {
    username: string
    userId: string
    studentId: string
    status: string
}

function StudentCard({ username, userId, studentId, status }: StudentCardProps) {
    const navigate = useNavigate()

    return (
        <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-medium">{username}</h3>
                        <p className="text-sm text-gray-500">ID: {studentId}</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => navigate(`/dashboard/${userId}`)}
                    >
                        <Eye className="w-4 h-4" />
                        View Dashboard
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm">Status:</span>
                    <span className={`text-sm font-medium ${
                        status === 'Assigned' ? 'text-green-500' : 'text-red-500'
                    }`}>
                        {status}
                    </span>
                </div>
            </div>
        </Card>
    )
}

export default StudentCard 