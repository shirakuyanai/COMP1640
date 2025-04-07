import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useGlobalState } from '@/misc/GlobalStateContext'
import { createPost, getPostsByClassId, deletePost } from '@/actions/getData'
import { Button } from '@/Components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card'
import { Input } from '@/Components/ui/input'
import { Textarea } from '@/Components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs'
import { useToast } from '@/Components/ui/use-toast'
import PostDetails from './PostDetails'
import { FaRegComment } from 'react-icons/fa'
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/Components/ui/alert-dialog"

interface Post {
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

const BlogPage: React.FC = () => {
  const { id: classId } = useParams<{ id: string }>()
  const { authToken, currentUser } = useGlobalState()
  const { toast } = useToast()
  
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedPost, setSelectedPost] = useState<string | null>(null)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  useEffect(() => {
    if (classId && authToken) {
      fetchPosts()
    }
  }, [classId, authToken])
  
  const fetchPosts = async () => {
    setLoading(true)
    try {
      const fetchedPosts = await getPostsByClassId({
        token: authToken,
        classId: classId || ''
      })
      setPosts(fetchedPosts || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast({
        title: 'Error',
        description: 'Failed to load posts',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }
  
  const handleCreatePost = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title and content are required',
        variant: 'destructive'
      })
      return
    }
    
    try {
      await createPost({
        token: authToken,
        userId: currentUser.id,
        classId: classId || '',
        title: title.trim(),
        postContent: content.trim()
      })
      
      setTitle('')
      setContent('')
      setShowNewPostForm(false)
      toast({
        title: 'Success',
        description: 'Post created successfully'
      })
      fetchPosts() // Refresh posts list
    } catch (error) {
      console.error('Error creating post:', error)
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive'
      })
    }
  }
  
  const confirmDeletePost = (postId: string) => {
    setPostToDelete(postId)
    setDeleteDialogOpen(true)
  }
  
  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    try {
      await deletePost({
        token: authToken,
        postId: postToDelete,
        userId: currentUser.id
      })
      
      setDeleteDialogOpen(false)
      setPostToDelete(null)
      
      toast({
        title: 'Success',
        description: 'Post and all its comments deleted successfully'
      })
      fetchPosts() // Refresh posts list
    } catch (error) {
      console.error('Error deleting post:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete post',
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
  
  if (selectedPost) {
    return (
      <div>
        <Button 
          variant="outline" 
          onClick={() => setSelectedPost(null)}
          className="mb-4"
        >
          Back to Posts
        </Button>
        <PostDetails 
          postId={selectedPost} 
          onUpdate={fetchPosts}
        />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Class Discussion</h1>
        <Button 
          onClick={() => setShowNewPostForm(!showNewPostForm)}
          className="flex items-center gap-2"
        >
          <FaPlus size={14} />
          {showNewPostForm ? 'Cancel' : 'New Post'}
        </Button>
      </div>
      
      {showNewPostForm && (
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <Textarea
                placeholder="Content"
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setTitle('')
                setContent('')
                setShowNewPostForm(false)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreatePost}>Post</Button>
          </CardFooter>
        </Card>
      )}
      
      {loading ? (
        <div className="text-center py-10">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No posts yet. Be the first to start a discussion!
        </div>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <Card key={post.post.postId} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle 
                      className="text-xl text-blue-600 cursor-pointer hover:underline"
                      onClick={() => setSelectedPost(post.post.postId)}
                    >
                      {post.post.title}
                    </CardTitle>
                    <div className="text-sm text-gray-500 mt-1">
                      Posted by {post.author?.firstname && post.author?.lastname 
                        ? `${post.author.firstname} ${post.author.lastname}` 
                        : post.author?.username || "Unknown"} on {formatDate(post.post.postDate)}
                    </div>
                  </div>
                  {post.author.userId === currentUser.id && (
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => confirmDeletePost(post.post.postId)}
                      >
                        <FaTrash className="text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  {post.post.postContent.length > 300 
                    ? `${post.post.postContent.substring(0, 300)}...` 
                    : post.post.postContent}
                </p>
              </CardContent>
              <CardFooter className="justify-between">
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 text-blue-600"
                  onClick={() => setSelectedPost(post.post.postId)}
                >
                  <FaRegComment size={16} />
                  View Discussion
                </Button>
                <div className="text-sm text-gray-500">
                  {/* Will add comment count here */}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post
              and all its comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPostToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePost}
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

export default BlogPage 