import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

interface UploadDialogProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (data: ContentUploadData) => void
}

export interface ContentUploadData {
  title: string
  type: string
  description: string
  file?: File
  link?: string
}

const UploadDialog: React.FC<UploadDialogProps> = ({ isOpen, onClose, onUpload }) => {
  const [formData, setFormData] = useState<ContentUploadData>({
    title: '',
    type: '',
    description: '',
  })
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpload({
      ...formData,
      file: file || undefined,
    })
    // Reset form
    setFormData({
      title: '',
      type: '',
      description: '',
    })
    setFile(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload Content</DialogTitle>
            <DialogDescription>
              Add new learning materials or questions to your class.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                className="col-span-3"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Document">Document</SelectItem>
                  <SelectItem value="Video">Video</SelectItem>
                  <SelectItem value="Link">Link</SelectItem>
                  <SelectItem value="Question">Question</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                className="col-span-3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            {formData.type !== 'Link' ? (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file" className="text-right">
                  File
                </Label>
                <Input
                  id="file"
                  type="file"
                  className="col-span-3"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required={formData.type !== 'Link'}
                />
              </div>
            ) : (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="link" className="text-right">
                  Link
                </Label>
                <Input
                  id="link"
                  type="url"
                  className="col-span-3"
                  value={formData.link || ''}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  required={formData.type === 'Link'}
                  placeholder="https://"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Upload</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UploadDialog 