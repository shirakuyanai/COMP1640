import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { Button } from '@/Components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/Components/ui/card'
import { Input } from '@/Components/ui/input'
import { Textarea } from '@/Components/ui/textarea'
import { format } from 'date-fns'
import { FaRegComment, FaUserCircle, FaEdit, FaTrash } from 'react-icons/fa'
import { BiTime } from 'react-icons/bi'
import { toast } from 'sonner'
import { Skeleton } from '@/Components/ui/skeleton'
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

interface Post {
  postId: string
  title: string
  postContent: string
  postDate: string
  username: string
  userId: string
}

interface Comment {
  commentId: string
  commentContent: string
  commentDate: string
  username: string
  userId: string
}

// Create Post Form Component
const CreatePostForm = ({ classId, onPostCreated, editingPost = null }: { 
  classId: string, 
  onPostCreated: () => void,
  editingPost?: Post | null
}) => {
  const { authToken } = useGlobalState()
  const [newPostTitle, setNewPostTitle] = useState(editingPost?.title || '')
  const [newPostContent, setNewPostContent] = useState(editingPost?.postContent || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!classId) {
      toast.error('Class ID is missing')
      return
    }
    setIsSubmitting(true)
    try {
      const endpoint = editingPost ? 'updatePost' : 'createPost'
      const response = await fetch(`${import.meta.env.VITE_HOST}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authentication: `Bearer ${authToken}`,
          API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
        },
        body: JSON.stringify({
          ...(editingPost && { postId: editingPost.postId }),
          classId,
          title: newPostTitle,
          content: newPostContent,
        }),
      })
      const data = await response.json()
      if (response.ok) {
        setNewPostTitle('')
        setNewPostContent('')
        onPostCreated()
        toast.success(editingPost ? 'Post updated successfully' : 'Post created successfully')
      } else {
        toast.error(data.error || `Failed to ${editingPost ? 'update' : 'create'} post`)
      }
    } catch (error) {
      toast.error(`Failed to ${editingPost ? 'update' : 'create'} post`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">
          {editingPost ? 'Edit Post' : 'Create a New Post'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreatePost} className="space-y-4">
          <Input
            placeholder="Post Title"
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            required
            className="border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <Textarea
            placeholder="What's on your mind?"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            required
            className="border rounded-lg min-h-[120px] focus:ring-2 focus:ring-blue-500"
          />
          <Button 
            type="submit" 
            className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? (editingPost ? 'Updating...' : 'Creating...') : (editingPost ? 'Update Post' : 'Create Post')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Comments Component
const Comments = ({ postId, comments, onCommentAdded, currentUserId }: { 
  postId: string, 
  comments: Comment[], 
  onCommentAdded: () => void,
  currentUserId: string
}) => {
  const { authToken } = useGlobalState()
  const [newCommentContent, setNewCommentContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleCreateComment = async () => {
    if (!newCommentContent.trim()) return
    setIsSubmitting(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_HOST}/createComment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authentication: `Bearer ${authToken}`,
          API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
        },
        body: JSON.stringify({
          postId,
          commentContent: newCommentContent,
        }),
      })
      const data = await response.json()
      if (response.ok) {
        setNewCommentContent('')
        onCommentAdded()
        toast.success('Comment added successfully')
      } else {
        toast.error(data.error || 'Failed to add comment')
      }
    } catch (error) {
      toast.error('Failed to add comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) return
    setIsSubmitting(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_HOST}/updateComment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authentication: `Bearer ${authToken}`,
          API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
        },
        body: JSON.stringify({
          commentId,
          commentContent: editContent,
        }),
      })
      const data = await response.json()
      if (response.ok) {
        setEditingComment(null)
        setEditContent('')
        onCommentAdded()
        toast.success('Comment updated successfully')
      } else {
        toast.error(data.error || 'Failed to update comment')
      }
    } catch (error) {
      toast.error('Failed to update comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_HOST}/deleteComment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authentication: `Bearer ${authToken}`,
          API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
        },
        body: JSON.stringify({ commentId }),
      })
      const data = await response.json()
      if (response.ok) {
        onCommentAdded()
        toast.success('Comment deleted successfully')
      } else {
        toast.error(data.error || 'Failed to delete comment')
      }
    } catch (error) {
      toast.error('Failed to delete comment')
    }
    setDeleteConfirm(null)
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="border-t pt-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Write a comment..."
            value={newCommentContent}
            onChange={(e) => setNewCommentContent(e.target.value)}
            className="border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={handleCreateComment}
            disabled={isSubmitting}
            className="self-end bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors"
          >
            {isSubmitting ? '...' : 'Comment'}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {comments.map((comment) => (
          <div 
            key={comment.commentId} 
            className="bg-gray-50 rounded-lg p-3 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FaUserCircle className="text-gray-400 w-5 h-5" />
                <span className="font-medium text-gray-700">{comment.username}</span>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <BiTime />
                  {format(new Date(comment.commentDate), 'PPp')}
                </span>
              </div>
              {currentUserId === comment.userId && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-blue-600"
                    onClick={() => {
                      setEditingComment(comment.commentId)
                      setEditContent(comment.commentContent)
                    }}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-red-600"
                    onClick={() => setDeleteConfirm(comment.commentId)}
                  >
                    <FaTrash />
                  </Button>
                </div>
              )}
            </div>
            {editingComment === comment.commentId ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleUpdateComment(comment.commentId)}
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {isSubmitting ? 'Updating...' : 'Update'}
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingComment(null)
                      setEditContent('')
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">{comment.commentContent}</p>
            )}
          </div>
        ))}
      </div>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => deleteConfirm && handleDeleteComment(deleteConfirm)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Post Card Component
const PostCard = ({ post, comments, onCommentAdded, onPostDeleted, onPostEdit, currentUserId }: { 
  post: Post, 
  comments: Comment[], 
  onCommentAdded: () => void,
  onPostDeleted: () => void,
  onPostEdit: (post: Post) => void,
  currentUserId: string
}) => {
  const { authToken } = useGlobalState()
  const [isExpanded, setIsExpanded] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const handleDeletePost = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_HOST}/deletePost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authentication: `Bearer ${authToken}`,
          API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
        },
        body: JSON.stringify({ postId: post.postId }),
      })
      const data = await response.json()
      if (response.ok) {
        onPostDeleted()
        toast.success('Post deleted successfully')
      } else {
        toast.error(data.error || 'Failed to delete post')
      }
    } catch (error) {
      toast.error('Failed to delete post')
    }
    setDeleteConfirm(false)
  }

  return (
    <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-800">{post.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <FaUserCircle className="w-4 h-4" />
              <span>{post.username}</span>
              <span>•</span>
              <BiTime className="w-4 h-4" />
              <span>{format(new Date(post.postDate), 'PPp')}</span>
            </div>
          </div>
          {currentUserId === post.userId && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-blue-600"
                onClick={() => onPostEdit(post)}
              >
                <FaEdit />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-red-600"
                onClick={() => setDeleteConfirm(true)}
              >
                <FaTrash />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 whitespace-pre-wrap">{post.postContent}</p>
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <FaRegComment className="w-4 h-4" />
          <span>Comments ({comments?.length || 0})</span>
        </Button>
        
        {isExpanded && (
          <Comments 
            postId={post.postId} 
            comments={comments} 
            onCommentAdded={onCommentAdded}
            currentUserId={currentUserId}
          />
        )}
      </CardFooter>

      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
              All comments on this post will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDeletePost}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

// Main Post Page Component
export default function PostPage() {
  const { id: classId } = useParams()
  const { authToken, currentUser } = useGlobalState()
  const [posts, setPosts] = useState<Post[]>([])
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [editingPost, setEditingPost] = useState<Post | null>(null)

  const fetchPosts = async () => {
    if (!classId) return
    setIsLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_HOST}/getPostsByClass/${classId}`, {
        headers: {
          Authentication: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
        },
      })
      const data = await response.json()
      
      if (response.ok && data.item) {
        setPosts(data.item)
        // Fetch comments for each post
        data.item.forEach((post: Post) => fetchComments(post.postId))
      } else {
        console.error('Failed to fetch posts:', data.error)
        toast.error(data.error || 'Failed to fetch posts')
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Failed to fetch posts')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchComments = async (postId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_HOST}/getCommentsByPost/${postId}`, {
        headers: {
          Authentication: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          API: 'X-Api-Key ' + import.meta.env.VITE_APIKEY,
        },
      })
      const data = await response.json()
      
      if (response.ok) {
        setComments(prev => ({ 
          ...prev, 
          [postId]: data.item || [] 
        }))
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  useEffect(() => {
    if (!classId) {
      toast.error('Invalid class ID')
      return
    }
    fetchPosts()
  }, [classId])

  if (!classId) {
    return (
      <div className="text-center text-red-500">Invalid class ID. Please try again.</div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <CreatePostForm 
        classId={classId} 
        onPostCreated={() => {
          fetchPosts()
          setEditingPost(null)
        }}
        editingPost={editingPost}
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <Card key={n} className="bg-white">
              <CardHeader>
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/3 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.postId}
              post={post}
              comments={comments[post.postId] || []}
              onCommentAdded={() => fetchComments(post.postId)}
              onPostDeleted={fetchPosts}
              onPostEdit={setEditingPost}
              currentUserId={currentUser?.id || ''}
            />
          ))}
          {posts.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No posts yet. Be the first to create one!
            </div>
          )}
        </div>
      )}
    </div>
  )
} 