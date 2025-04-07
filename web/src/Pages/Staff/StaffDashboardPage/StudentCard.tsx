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
        <Card className="overflow-hidden hover:shadow-md transition-all border border-gray-100">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white h-10 w-10 rounded-full flex items-center justify-center">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-medium">{username}</h3>
                            <p className="text-xs text-gray-500">ID: {studentId}</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-xs border-gray-200 hover:bg-gray-50"
                        onClick={() => userId && navigate(`/dashboard/${userId}`)}
                        disabled={!userId}
                    >
                        <Eye className="w-3 h-3" />
                        View
                    </Button>
                </div>
                <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
                    <span className="text-sm mr-2">Status:</span>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        status === 'Assigned' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }`}>
                        {status}
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default StudentCard 