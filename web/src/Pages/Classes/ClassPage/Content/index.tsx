import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import { IoBookOutline } from 'react-icons/io5'
import { FaVideo, FaFile, FaLink, FaQuestion } from 'react-icons/fa6'
import { FaEdit, FaTrash, FaDownload } from 'react-icons/fa'
import UploadDialog, { ContentUploadData, ContentItem } from './UploadDialog'
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
          ownerId: ownerId, // Set owner ID
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
      {loading ? (
        <div className="text-center py-8">Loading content...</div>
      ) : contentItems.length === 0 ? (
        <Card className="p-8 text-center">
          <CardTitle className="text-gray-500 mb-2">No Content Found</CardTitle>
          <p className="text-gray-500">Upload your first content to get started.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contentItems.map((item) => (
            <Card 
              key={item.id} 
              className="hover:shadow-lg transition-shadow relative group"
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <item.icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <p className="text-sm text-gray-500">{item.type}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{item.date}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
                      onClick={() => handleDownload(item)}
                    >
                      <FaDownload className="h-4 w-4" />
                      <span>Download</span>
                    </Button>
                    {/* Show edit/delete for all content temporarily for testing */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
                      onClick={() => setEditingContent(item)}
                    >
                      <FaEdit className="h-4 w-4" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 text-gray-600 hover:text-red-600"
                      onClick={() => setDeleteConfirm(item.fileName)}
                    >
                      <FaTrash className="h-4 w-4" />
                      <span>Delete</span>
                    </Button>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this content? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => deleteConfirm && handleDeleteContent(deleteConfirm)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ContentPage 