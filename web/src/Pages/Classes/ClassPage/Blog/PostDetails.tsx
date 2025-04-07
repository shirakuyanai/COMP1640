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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const getInitials = (firstname: string, lastname: string) => {
    if (!firstname && !lastname) return '?';
    
    const firstInitial = firstname ? firstname.charAt(0).toUpperCase() : '';
    const lastInitial = lastname ? lastname.charAt(0).toUpperCase() : '';
    
    return `${firstInitial}${lastInitial}`;
  };
  
  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return interval === 1 ? '1 year ago' : `${interval} years ago`;
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return interval === 1 ? '1 month ago' : `${interval} months ago`;
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return interval === 1 ? '1 day ago' : `${interval} days ago`;
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
    }
    
    return seconds < 10 ? 'just now' : `${Math.floor(seconds)} seconds ago`;
  };
  
  if (loading || !post) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="w-12 h-12 border-4 border-t-indigo-500 border-indigo-200 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading discussion...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card className="border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
        {editingPost ? (
          <>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-indigo-50 p-1.5 rounded-md">
                  <FaEdit className="h-4 w-4 text-indigo-600" />
                </div>
                <CardTitle className="text-gray-800">Edit Discussion</CardTitle>
              </div>
              <div>
                <label htmlFor="edit-post-title" className="text-xs md:text-sm font-medium text-gray-700 mb-1.5 block">
                  Post Title
                </label>
              <Input
                  id="edit-post-title"
                value={editPostTitle}
                onChange={(e) => setEditPostTitle(e.target.value)}
                  className="focus:border-indigo-500 focus:ring-indigo-500"
              />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <label htmlFor="edit-post-content" className="text-xs md:text-sm font-medium text-gray-700 mb-1.5 block">
                  Post Content
                </label>
              <Textarea
                  id="edit-post-content"
                value={editPostContent}
                onChange={(e) => setEditPostContent(e.target.value)}
                rows={8}
                  className="min-h-[200px] focus:border-indigo-500 focus:ring-indigo-500"
              />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 p-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditingPost(false)
                  setEditPostTitle(post.post.title)
                  setEditPostContent(post.post.postContent)
                }}
                className="border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdatePost}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Save Changes
              </Button>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="bg-indigo-50 p-2 rounded-full border border-indigo-100 mt-1">
                    <Avatar className="h-8 w-8 bg-indigo-100 text-indigo-700 border border-indigo-200">
                      <AvatarFallback>
                        {getInitials(post.author?.firstname || '', post.author?.lastname || '')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                <div>
                    <CardTitle className="text-xl md:text-2xl font-bold text-indigo-700">
                      {post.post.title}
                    </CardTitle>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      <span>
                    Posted by {post.author?.firstname && post.author?.lastname 
                      ? `${post.author.firstname} ${post.author.lastname}` 
                          : post.author?.username || "Unknown"}
                      </span>
                      <span>•</span>
                      <span>{formatDate(post.post.postDate)}</span>
                      <span>•</span>
                      <span className="text-indigo-600 font-medium">{getTimeSince(post.post.postDate)}</span>
                    </div>
                  </div>
                </div>
                {post.author.userId === currentUser.id && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-indigo-50 text-indigo-600 hover:text-indigo-800"
                    onClick={() => setEditingPost(true)}
                  >
                    <FaEdit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{post.post.postContent}</p>
            </CardContent>
          </>
        )}
      </Card>
      
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg shadow-sm">
            <FaReply className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
          </h2>
        </div>
        
        <div className="space-y-4 max-h-[500px] overflow-y-auto mb-6 pr-1">
          {comments.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaReply className="h-5 w-5 text-indigo-400" />
              </div>
              <p className="text-gray-500">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div 
                key={comment.comment.commentId} 
                className="bg-gray-50 rounded-lg p-4 border border-gray-100"
              >
                {editingComment === comment.comment.commentId ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 bg-indigo-100 text-indigo-700 border border-indigo-200">
                        <AvatarFallback>
                          {getInitials(comment.author?.firstname || '', comment.author?.lastname || '')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {comment.author?.firstname && comment.author?.lastname 
                            ? `${comment.author.firstname} ${comment.author.lastname}` 
                            : comment.author?.username || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(comment.comment.commentDate)}</p>
                      </div>
                    </div>
                    <Textarea
                      value={editCommentContent}
                      onChange={(e) => setEditCommentContent(e.target.value)}
                      className="min-h-[100px] focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <div className="flex justify-end gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingComment(null)}
                        className="border-gray-300 text-gray-700"
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleEditComment(comment.comment.commentId)}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 bg-indigo-100 text-indigo-700 border border-indigo-200">
                          <AvatarFallback>
                            {getInitials(comment.author?.firstname || '', comment.author?.lastname || '')}
                  </AvatarFallback>
                </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {comment.author?.firstname && comment.author?.lastname 
                              ? `${comment.author.firstname} ${comment.author.lastname}` 
                              : comment.author?.username || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <span>{formatDate(comment.comment.commentDate)}</span>
                            <span>•</span> 
                            <span className="text-indigo-600">{getTimeSince(comment.comment.commentDate)}</span>
                          </p>
                        </div>
                      </div>
                      
                      {comment.author.userId === currentUser.id && (
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-7 w-7 rounded-full hover:bg-indigo-50 text-indigo-600"
                            onClick={() => {
                              setEditingComment(comment.comment.commentId)
                              setEditCommentContent(comment.comment.commentContent)
                            }}
                          >
                            <FaEdit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-7 w-7 rounded-full hover:bg-red-50 text-red-500"
                            onClick={() => confirmDeleteComment(comment.comment.commentId)}
                          >
                            <FaTrash className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 pl-10">{comment.comment.commentContent}</p>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>
        
        <div className="relative">
          <div className="absolute -left-12 top-0 bottom-0 w-px bg-indigo-200 hidden md:block"></div>
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8 bg-indigo-100 text-indigo-700 border border-indigo-200">
              <AvatarFallback>
                {getInitials(currentUser.firstname || '', currentUser.lastname || '')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
            <Textarea
                placeholder="Write a comment..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
                className="min-h-[80px] focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            />
              <div className="flex justify-end mt-2">
            <Button 
              onClick={handleSubmitComment}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
                  <FaReply className="h-3 w-3 mr-2" /> 
              Post Comment
            </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md border border-gray-100 shadow-xl">
          <div className="bg-red-50 p-4 rounded-lg mb-4 flex items-center gap-3">
            <div className="bg-red-500 p-2 rounded-full">
              <FaTrash className="h-4 w-4 text-white" />
            </div>
            <AlertDialogTitle className="m-0 text-red-700">Delete Comment</AlertDialogTitle>
          </div>
          
          <AlertDialogHeader className="pb-0">
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4"></div>
          
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel
              onClick={() => setCommentToDelete(null)}
              className="mt-0 border-gray-300 text-gray-700"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteComment}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0"
            >
              Delete Comment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default PostDetails 