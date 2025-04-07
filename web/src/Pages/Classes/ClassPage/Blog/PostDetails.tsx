import React, { useState, useEffect, useRef } from 'react'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { 
  getPostById, 
  getCommentsByPostId, 
  createComment, 
  updateComment, 
  deleteComment,
  updatePost
} from '@/actions/getData'
import { Button } from '@/Components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card'
import { Input } from '@/Components/ui/input'
import { Textarea } from '@/Components/ui/textarea'
import { useToast } from '@/Components/ui/use-toast'
import { Avatar, AvatarFallback } from '@/Components/ui/avatar'
import { FaEdit, FaTrash, FaReply } from 'react-icons/fa'
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

interface PostDetailsProps {
  postId: string
  onUpdate?: () => void
}

interface PostData {
  post: {
    postId: string
    userId: string
    classId: string
    title: string
    postContent: string
    postDate: string
  }
  author: {
    userId: string
    username: string
    firstname: string
    lastname: string
  }
}

interface Comment {
  comment: {
    commentId: string
    postId: string
    userId: string
    commentContent: string
    commentDate: string
  }
  author: {
    userId: string
    username: string
    firstname: string
    lastname: string
  }
}

const PostDetails: React.FC<PostDetailsProps> = ({ postId, onUpdate }) => {
  const { authToken, currentUser } = useGlobalState()
  const { toast } = useToast()
  
  const [post, setPost] = useState<PostData | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentContent, setCommentContent] = useState('')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editCommentContent, setEditCommentContent] = useState('')
  const [editingPost, setEditingPost] = useState(false)
  const [editPostTitle, setEditPostTitle] = useState('')
  const [editPostContent, setEditPostContent] = useState('')
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  const commentsEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (postId && authToken) {
      fetchPostDetails()
      fetchComments()
    }
  }, [postId, authToken])
  
  const fetchPostDetails = async () => {
    try {
      const postData = await getPostById({
        token: authToken,
        postId
      })
      
      if (postData) {
        setPost(postData)
        setEditPostTitle(postData.post.title)
        setEditPostContent(postData.post.postContent)
      }
    } catch (error) {
      console.error('Error fetching post details:', error)
      toast({
        title: 'Error',
        description: 'Failed to load post details',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }
  
  const fetchComments = async () => {
    try {
      const commentsData = await getCommentsByPostId({
        token: authToken,
        postId
      })
      
      setComments(commentsData || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast({
        title: 'Error',
        description: 'Failed to load comments',
        variant: 'destructive'
      })
    }
  }
  
  const handleSubmitComment = async () => {
    if (!commentContent.trim()) {
      toast({
        title: 'Error',
        description: 'Comment cannot be empty',
        variant: 'destructive'
      })
      return
    }
    
    try {
      await createComment({
        token: authToken,
        postId,
        userId: currentUser.id,
        commentContent: commentContent.trim()
      })
      
      setCommentContent('')
      toast({
        title: 'Success',
        description: 'Comment added successfully'
      })
      await fetchComments()
      
      // Scroll to the bottom of comments
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (error) {
      console.error('Error adding comment:', error)
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive'
      })
    }
  }
  
  const handleEditComment = async (commentId: string) => {
    if (!editCommentContent.trim()) {
      toast({
        title: 'Error',
        description: 'Comment cannot be empty',
        variant: 'destructive'
      })
      return
    }
    
    try {
      await updateComment({
        token: authToken,
        commentId,
        userId: currentUser.id,
        commentContent: editCommentContent.trim()
      })
      
      setEditingComment(null)
      toast({
        title: 'Success',
        description: 'Comment updated successfully'
      })
      await fetchComments()
    } catch (error) {
      console.error('Error updating comment:', error)
      toast({
        title: 'Error',
        description: 'Failed to update comment',
        variant: 'destructive'
      })
    }
  }
  
  const confirmDeleteComment = (commentId: string) => {
    setCommentToDelete(commentId)
    setDeleteDialogOpen(true)
  }
  
  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    
    try {
      await deleteComment({
        token: authToken,
        commentId: commentToDelete,
        userId: currentUser.id
      })
      
      setDeleteDialogOpen(false)
      setCommentToDelete(null)
      
      toast({
        title: 'Success',
        description: 'Comment deleted successfully'
      })
      await fetchComments()
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive'
      })
    }
  }
  
  const handleUpdatePost = async () => {
    if (!editPostTitle.trim() || !editPostContent.trim()) {
      toast({
        title: 'Error',
        description: 'Title and content cannot be empty',
        variant: 'destructive'
      })
      return
    }
    
    try {
      await updatePost({
        token: authToken,
        postId,
        userId: currentUser.id,
        title: editPostTitle.trim(),
        postContent: editPostContent.trim()
      })
      
      setEditingPost(false)
      toast({
        title: 'Success',
        description: 'Post updated successfully'
      })
      await fetchPostDetails()
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error updating post:', error)
      toast({
        title: 'Error',
        description: 'Failed to update post',
        variant: 'destructive'
      })
    }
  }
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }
  
  const getInitials = (firstname: string, lastname: string) => {
    return `${firstname?.[0] || ''}${lastname?.[0] || ''}`.toUpperCase()
  }
  
  if (loading) {
    return <div className="text-center py-10">Loading post details...</div>
  }
  
  if (!post) {
    return <div className="text-center py-10 text-red-500">Post not found</div>
  }
  
  return (
    <div className="space-y-6">
      <Card className="border border-gray-200">
        {editingPost ? (
          <>
            <CardHeader>
              <Input
                value={editPostTitle}
                onChange={(e) => setEditPostTitle(e.target.value)}
                className="text-xl font-bold"
              />
              <div className="text-sm text-gray-500 mt-1">
                Posted by {post.author?.firstname && post.author?.lastname 
                  ? `${post.author.firstname} ${post.author.lastname}` 
                  : post.author?.username || "Unknown"} on {formatDate(post.post.postDate)}
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editPostContent}
                onChange={(e) => setEditPostContent(e.target.value)}
                rows={8}
                className="w-full"
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditingPost(false)
                  setEditPostTitle(post.post.title)
                  setEditPostContent(post.post.postContent)
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdatePost}>Save Changes</Button>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{post.post.title}</CardTitle>
                  <div className="text-sm text-gray-500 mt-1">
                    Posted by {post.author?.firstname && post.author?.lastname 
                      ? `${post.author.firstname} ${post.author.lastname}` 
                      : post.author?.username || "Unknown"} on {formatDate(post.post.postDate)}
                  </div>
                </div>
                {post.author.userId === currentUser.id && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setEditingPost(true)}
                  >
                    <FaEdit className="text-blue-500" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{post.post.postContent}</p>
            </CardContent>
          </>
        )}
      </Card>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Comments ({comments.length})</h2>
        
        <div className="space-y-4 mb-6">
          {comments.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No comments yet. Be the first to comment!</div>
          ) : (
            comments.map((comment) => (
              <div key={comment.comment.commentId} className="flex space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-800">
                    {getInitials(comment.author.firstname, comment.author.lastname)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <div className="font-medium">
                        {comment.author.firstname} {comment.author.lastname}
                      </div>
                      {comment.author.userId === currentUser.id && (
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => {
                              setEditingComment(comment.comment.commentId)
                              setEditCommentContent(comment.comment.commentContent)
                            }}
                          >
                            <FaEdit className="text-blue-500" size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => confirmDeleteComment(comment.comment.commentId)}
                          >
                            <FaTrash className="text-red-500" size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {editingComment === comment.comment.commentId ? (
                      <div className="mt-2">
                        <Textarea
                          value={editCommentContent}
                          onChange={(e) => setEditCommentContent(e.target.value)}
                          rows={3}
                          className="w-full mb-2"
                        />
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingComment(null)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleEditComment(comment.comment.commentId)}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700 mt-1">{comment.comment.commentContent}</p>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(comment.comment.commentDate)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>
        
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Add a Comment</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Write your comment..."
              rows={3}
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="w-full"
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={handleSubmitComment}
              className="flex items-center gap-2"
            >
              <FaReply size={14} />
              Comment
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Delete Comment Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your comment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCommentToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteComment}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default PostDetails 