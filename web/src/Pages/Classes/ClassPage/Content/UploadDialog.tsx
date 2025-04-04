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

interface UploadDialogProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (data: ContentUploadData) => void
  editingContent?: ContentItem | null
}

export interface ContentUploadData {
  title: string
  description: string
  file: File
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
  fileName: string
  ownerId: string
  uploadedBy: {
    username: string
    role: string
  }
}

const UploadDialog: React.FC<UploadDialogProps> = ({ isOpen, onClose, onUpload, editingContent }) => {
  const [formData, setFormData] = useState<ContentUploadData>({
    title: '',
    description: '',
    file: null as any
  })

  useEffect(() => {
    if (editingContent) {
      setFormData({
        title: editingContent.title,
        description: editingContent.description,
        file: null as any
      })
    } else {
      setFormData({
        title: '',
        description: '',
        file: null as any
      })
    }
  }, [editingContent])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.file && !editingContent) {
      return
    }
    onUpload(formData)
    // Reset form
    setFormData({
      title: '',
      description: '',
      file: null as any
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editingContent ? 'Edit Content' : 'Upload Content'}</DialogTitle>
            <DialogDescription>
              {editingContent ? 'Update the content details' : 'Add a title and description for your content'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                placeholder="Enter a title for your content"
                className="col-span-3"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe what this content is about"
                className="col-span-3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file" className="text-right">
                File
              </Label>
              <Input
                id="file"
                type="file"
                className="col-span-3"
                onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] as File })}
                required={!editingContent}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{editingContent ? 'Update' : 'Upload'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UploadDialog 