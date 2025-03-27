import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import { IoBookOutline } from 'react-icons/io5'
import { FaVideo, FaFile, FaLink, FaQuestion } from 'react-icons/fa6'
import UploadDialog, { ContentUploadData } from './UploadDialog'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { useToast } from "@/Components/ui/use-toast"

interface ContentItem {
  id: string
  title: string
  type: string
  duration?: string
  icon: any
  description: string
  date: string
  link?: string
  fileUrl?: string
  uploadedBy: {
    username: string
    role: string
  }
}

const ContentPage: React.FC = () => {
  const { currentUser } = useGlobalState()
  const { toast } = useToast()
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [contentItems, setContentItems] = useState<ContentItem[]>([
    {
      id: '1',
      title: "Introduction to React",
      type: "Video",
      duration: "15 mins",
      icon: FaVideo,
      description: "Learn the basics of React and its core concepts",
      date: "Mar 15, 2024",
      uploadedBy: {
        username: "tutor1",
        role: "tutor"
      }
    },
    {
      id: '2',
      title: "React Components Guide",
      type: "Document",
      icon: FaFile,
      description: "Comprehensive guide about React components and their lifecycle",
      date: "Mar 16, 2024",
      uploadedBy: {
        username: "tutor1",
        role: "tutor"
      }
    },
    {
      id: '3',
      title: "React Official Documentation",
      type: "Link",
      icon: FaLink,
      description: "External resource for in-depth React learning",
      date: "Mar 17, 2024",
      link: "https://reactjs.org",
      uploadedBy: {
        username: "student1",
        role: "student"
      }
    }
  ])

  const handleUpload = async (data: ContentUploadData) => {
    try {
      // Here you would typically make an API call to upload the file
      // For now, we'll just simulate it
      const newContent: ContentItem = {
        id: Math.random().toString(),
        title: data.title,
        type: data.type,
        icon: getIconForType(data.type),
        description: data.description,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        link: data.link,
        fileUrl: data.file ? URL.createObjectURL(data.file) : undefined,
        uploadedBy: {
          username: currentUser.username,
          role: currentUser.role
        }
      }

      setContentItems(prev => [newContent, ...prev])
      toast({
        title: "Content uploaded",
        description: "Your content has been successfully uploaded.",
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your content. Please try again.",
        variant: "destructive"
      })
    }
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case 'Video':
        return FaVideo
      case 'Document':
        return FaFile
      case 'Link':
        return FaLink
      case 'Question':
        return FaQuestion
      default:
        return FaFile
    }
  }

  const handleContentClick = (item: ContentItem) => {
    if (item.link) {
      window.open(item.link, '_blank')
    } else if (item.fileUrl) {
      window.open(item.fileUrl, '_blank')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Course Content</h1>
          <p className="text-gray-500">Access your learning materials</p>
        </div>
        <Button 
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => setIsUploadOpen(true)}
        >
          <IoBookOutline className="mr-2" />
          Add New Content
        </Button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentItems.map((item) => (
          <Card 
            key={item.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleContentClick(item)}
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <item.icon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-500">{item.type}</p>
                  <span className="text-gray-300">•</span>
                  <p className="text-sm text-gray-500">By {item.uploadedBy.username}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{item.date}</span>
                {item.duration && <span>{item.duration}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <UploadDialog 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  )
}

export default ContentPage 