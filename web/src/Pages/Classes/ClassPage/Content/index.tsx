import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import { IoBookOutline } from 'react-icons/io5'
import { FaVideo, FaFile, FaLink, FaQuestion, FaEdit, FaTrash, FaDownload } from 'react-icons/fa'
import UploadDialog, { ContentUploadData } from './UploadDialog'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { useToast } from "@/Components/ui/use-toast"
import { supabase } from '@/lib/supabase'
import { useParams } from 'react-router-dom'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/Components/ui/alert-dialog"

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
  fileName?: string
  ownerId?: string
  uploadedBy: {
    username: string
    role: string
  }
}

const ContentPage: React.FC = () => {
  const { currentUser } = useGlobalState()
  const { toast } = useToast()
  const { id: classId } = useParams<{ id: string }>()
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (classId) {
      fetchContent()
    }
  }, [classId])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const { data: files, error } = await supabase
        .storage
        .from('content-files')
        .list(classId, {
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (error) throw error

      // Get metadata for each file to check ownership
      const contentItems = await Promise.all(files.map(async file => {
        const { data: metadata } = await supabase
          .storage
          .from('content-files')
          .getPublicUrl(`${classId}/${file.name}`)

        // For now, set the owner as the current user for testing
        const ownerId = currentUser?.id

        // Parse filename to get title and description
        const [timestamp, ...rest] = file.name.split('-')
        const remainingParts = rest.join('-')
        const [title, description, originalFileName] = remainingParts.split('__')

        return {
          id: `${file.name}-${file.created_at}`,
          title: title || originalFileName,
          type: 'Document',
          icon: FaFile,
          description: description || `File uploaded on ${new Date(file.created_at).toLocaleDateString()}`,
          date: new Date(file.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          fileUrl: metadata.publicUrl,
          fileName: file.name,
          ownerId: ownerId,
          uploadedBy: {
            username: currentUser?.username || 'Unknown',
            role: currentUser?.role || 'Unknown'
          }
        }
      }))

      setContentItems(contentItems)
    } catch (error) {
      console.error('Error fetching content:', error)
      toast({
        title: "Error",
        description: "Failed to fetch content. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (data: ContentUploadData) => {
    try {
      if (!data.file || !classId) {
        throw new Error('No file selected or class ID missing')
      }

      const fileExt = data.file.name.split('.').pop()
      // Include title and description in filename
      const fileName = `${Date.now()}-${data.title}__${data.description}__${data.file.name}`

      const { error: uploadError } = await supabase
        .storage
        .from('content-files')
        .upload(`${classId}/${fileName}`, data.file)

      if (uploadError) throw uploadError

      await fetchContent() // Refresh the content list
      
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

  const handleUpdateContent = async (data: ContentUploadData) => {
    try {
      if (!editingContent || !classId) {
        throw new Error('No content selected or class ID missing')
      }

      // Delete the old file
      const { error: deleteError } = await supabase
        .storage
        .from('content-files')
        .remove([`${classId}/${editingContent.fileName}`])

      if (deleteError) throw deleteError

      // Upload the new file
      const fileName = `${Date.now()}-${data.title}__${data.description}__${data.file.name}`
      const { error: uploadError } = await supabase
        .storage
        .from('content-files')
        .upload(`${classId}/${fileName}`, data.file)

      if (uploadError) throw uploadError

      await fetchContent() // Refresh the content list
      setEditingContent(null)
      
      toast({
        title: "Content updated",
        description: "Your content has been successfully updated.",
      })
    } catch (error) {
      console.error('Update error:', error)
      toast({
        title: "Update failed",
        description: "There was an error updating your content. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteContent = async (fileName: string) => {
    try {
      const { error } = await supabase
        .storage
        .from('content-files')
        .remove([`${classId}/${fileName}`])

      if (error) throw error

      await fetchContent() // Refresh the content list
      setDeleteConfirm(null)
      
      toast({
        title: "Content deleted",
        description: "The content has been successfully deleted.",
      })
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: "Delete failed",
        description: "There was an error deleting the content. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDownload = async (item: ContentItem) => {
    try {
      if (!item.fileName) throw new Error('File name is missing')
      
      const { data, error } = await supabase
        .storage
        .from('content-files')
        .download(`${classId}/${item.fileName}`)

      if (error) throw error

      // Create a download link
      const url = window.URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = item.fileName.split('__').pop() || item.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "Download failed",
        description: "There was an error downloading the content. Please try again.",
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

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      {/* Header Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-3 rounded-xl shadow-md">
              <IoBookOutline className="h-6 w-6 md:h-7 md:w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Course Content</h1>
              <p className="text-sm md:text-base text-gray-500">Access your learning materials</p>
            </div>
          </div>
          <Button 
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md w-full sm:w-auto transition-all"
            onClick={() => setIsUploadOpen(true)}
          >
            <IoBookOutline className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Add New Content
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="text-center py-10 md:py-12 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-100 shadow-sm">
          <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-t-purple-500 border-purple-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your content...</p>
        </div>
      ) : contentItems.length === 0 ? (
        <Card className="p-8 md:p-12 text-center border border-gray-100">
          <div className="mx-auto w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
            <IoBookOutline className="h-8 w-8 text-purple-500" />
          </div>
          <CardTitle className="text-gray-700 mb-2 text-base md:text-lg">No Content Found</CardTitle>
          <p className="text-xs md:text-sm text-gray-500 max-w-md mx-auto mb-6">
            Your course content will appear here. Upload learning materials like documents, videos, or links to get started.
          </p>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 mx-auto"
            onClick={() => setIsUploadOpen(true)}
          >
            <IoBookOutline className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Upload Your First Content
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {contentItems.map((item) => (
            <Card 
              key={item.id} 
              className="hover:shadow-lg transition-shadow relative group overflow-hidden border border-gray-100"
            >
              {/* Colorful top accent bar based on content type */}
              <div className={`h-1.5 w-full absolute top-0 left-0 ${
                item.type === 'Document' ? 'bg-purple-500' : 
                item.type === 'Video' ? 'bg-red-500' : 
                item.type === 'Link' ? 'bg-blue-500' : 
                'bg-amber-500'
              }`} />
              
              <CardHeader className="p-4 md:p-6 pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 md:p-3 rounded-lg ${
                    item.type === 'Document' ? 'bg-purple-100' : 
                    item.type === 'Video' ? 'bg-red-100' : 
                    item.type === 'Link' ? 'bg-blue-100' : 
                    'bg-amber-100'
                  }`}>
                    <item.icon className={`h-5 w-5 md:h-6 md:w-6 ${
                      item.type === 'Document' ? 'text-purple-600' : 
                      item.type === 'Video' ? 'text-red-600' : 
                      item.type === 'Link' ? 'text-blue-600' : 
                      'text-amber-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base md:text-lg truncate">{item.title}</CardTitle>
                    <p className="text-xs md:text-sm text-gray-500">{item.type}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 line-clamp-2">{item.description}</p>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 border-t border-gray-100 pt-3">
                  <span className="text-xs md:text-sm text-gray-500 order-2 sm:order-1">{item.date}</span>
                  <div className="flex flex-wrap items-center gap-1 md:gap-2 order-1 sm:order-2 w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 text-xs md:text-sm text-gray-600 hover:text-blue-600 h-8 md:h-9 px-2 md:px-3 py-1"
                      onClick={() => handleDownload(item)}
                    >
                      <FaDownload className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                    {item.ownerId === currentUser?.id && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1 text-xs md:text-sm text-gray-600 hover:text-blue-600 h-8 md:h-9 px-2 md:px-3 py-1"
                          onClick={() => setEditingContent(item)}
                        >
                          <FaEdit className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1 text-xs md:text-sm text-gray-600 hover:text-red-600 h-8 md:h-9 px-2 md:px-3 py-1"
                          onClick={() => setDeleteConfirm(item.fileName || null)}
                        >
                          <FaTrash className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <UploadDialog 
        isOpen={isUploadOpen || !!editingContent}
        onClose={() => {
          setIsUploadOpen(false)
          setEditingContent(null)
        }}
        onUpload={editingContent ? handleUpdateContent : handleUpload}
        editingContent={editingContent}
      />

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="max-w-md border border-gray-100 shadow-xl">
          <div className="bg-red-50 p-4 rounded-lg mb-4 flex items-center gap-3">
            <div className="bg-red-500 p-2 rounded-full">
              <FaTrash className="h-4 w-4 text-white" />
            </div>
            <AlertDialogTitle className="m-0 text-red-700">Delete Content</AlertDialogTitle>
          </div>
          
          <AlertDialogHeader className="pb-0">
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to delete this content? This action cannot be undone and the content will be permanently removed from the course.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4"></div>
          
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="mt-0 border-gray-300 text-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0"
              onClick={() => deleteConfirm && handleDeleteContent(deleteConfirm)}
            >
              Delete Content
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ContentPage 