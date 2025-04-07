import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog"
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Textarea } from '@/Components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select"
import { FaEdit, FaFile, FaVideo, FaLink, FaQuestion } from 'react-icons/fa'
import { IoBookOutline } from 'react-icons/io5'

export interface ContentUploadData {
  title: string
  description: string
  type: string
  file: File
  link?: string
}

export interface ContentItem {
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

interface UploadDialogProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (data: ContentUploadData) => void
  editingContent?: ContentItem | null
}

const UploadDialog: React.FC<UploadDialogProps> = ({ isOpen, onClose, onUpload, editingContent }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('Document')
  const [file, setFile] = useState<File | null>(null)
  const [link, setLink] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (editingContent) {
      setTitle(editingContent.title)
      setDescription(editingContent.description)
      setType(editingContent.type)
      if (editingContent.link) {
        setLink(editingContent.link)
      }
    } else {
      // Reset form when not editing
      setTitle('')
      setDescription('')
      setType('Document')
      setFile(null)
      setLink('')
    }
  }, [editingContent])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file && !link) {
      alert('Please select a file or provide a link')
      return
    }

    setIsSubmitting(true)
    try {
      await onUpload({
        title,
        description,
        type,
        file: file!,
        link
      })
      
      // Reset form
      setTitle('')
      setDescription('')
      setType('Document')
      setFile(null)
      setLink('')
      onClose()
    } catch (error) {
      console.error('Error uploading:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg w-[95vw] p-4 sm:p-6 border border-gray-100 shadow-xl">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-2 rounded-lg">
              {editingContent ? (
                <FaEdit className="h-4 w-4 text-white" />
              ) : (
                <IoBookOutline className="h-4 w-4 text-white" />
              )}
            </div>
            <DialogTitle className="text-lg md:text-xl text-gray-800">
              {editingContent ? 'Edit Content' : 'Upload New Content'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs md:text-sm text-gray-500">
            {editingContent 
              ? 'Update your content details below.'
              : 'Add a new piece of content to your course.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2"></div>
        
        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4 pt-2">
          <div>
            <Label htmlFor="title" className="text-xs md:text-sm font-medium text-gray-700">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 text-sm h-9 md:h-10 focus:border-purple-500 focus:ring-purple-500"
              placeholder="Enter a descriptive title"
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-xs md:text-sm font-medium text-gray-700">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="mt-1 text-sm min-h-[80px] focus:border-purple-500 focus:ring-purple-500"
              placeholder="Provide a brief description of this content"
            />
          </div>
          <div>
            <Label htmlFor="type" className="text-xs md:text-sm font-medium text-gray-700">Content Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="mt-1 text-sm h-9 md:h-10 focus:border-purple-500 focus:ring-purple-500">
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Document">
                  <div className="flex items-center gap-2">
                    <FaFile className="h-3.5 w-3.5 text-purple-600" />
                    <span>Document</span>
                  </div>
                </SelectItem>
                <SelectItem value="Video">
                  <div className="flex items-center gap-2">
                    <FaVideo className="h-3.5 w-3.5 text-red-600" />
                    <span>Video</span>
                  </div>
                </SelectItem>
                <SelectItem value="Link">
                  <div className="flex items-center gap-2">
                    <FaLink className="h-3.5 w-3.5 text-blue-600" />
                    <span>Link</span>
                  </div>
                </SelectItem>
                <SelectItem value="Question">
                  <div className="flex items-center gap-2">
                    <FaQuestion className="h-3.5 w-3.5 text-amber-600" />
                    <span>Question</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {type === 'Link' ? (
            <div>
              <Label htmlFor="link" className="text-xs md:text-sm font-medium text-gray-700">Link URL</Label>
              <Input
                id="link"
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                required={type === 'Link'}
                className="mt-1 text-sm h-9 md:h-10 focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="file" className="text-xs md:text-sm font-medium text-gray-700">File</Label>
              <div className="mt-1 border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-purple-300 transition-colors">
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required={!editingContent || (editingContent && !editingContent.fileUrl)}
                  className="hidden"
                />
                <label htmlFor="file" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-2 bg-purple-50 rounded-full">
                      <FaFile className="h-4 w-4 text-purple-500" />
                    </div>
                    <span className="text-sm font-medium text-purple-600">
                      {file ? file.name : 'Click to select a file'}
                    </span>
                    <p className="text-xs text-gray-500">
                      {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Max file size: 10MB'}
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}
          
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2"></div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 pt-2 md:pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto text-sm h-9 md:h-10 border-gray-300 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto text-sm h-9 md:h-10 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {isSubmitting 
                ? (editingContent ? 'Updating...' : 'Uploading...') 
                : (editingContent ? 'Update Content' : 'Upload Content')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UploadDialog 