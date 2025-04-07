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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingContent ? 'Edit Content' : 'Upload New Content'}</DialogTitle>
          <DialogDescription>
            {editingContent 
              ? 'Update your content details below.'
              : 'Add a new piece of content to your course.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Document">Document</SelectItem>
                <SelectItem value="Video">Video</SelectItem>
                <SelectItem value="Link">Link</SelectItem>
                <SelectItem value="Question">Question</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {type === 'Link' ? (
            <div>
              <Label htmlFor="link">Link URL</Label>
              <Input
                id="link"
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                required={type === 'Link'}
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="file">File</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required={!editingContent || (editingContent && !editingContent.fileUrl)}
              />
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (editingContent ? 'Updating...' : 'Uploading...') 
                : (editingContent ? 'Update' : 'Upload')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UploadDialog 