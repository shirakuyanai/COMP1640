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
import { Label } from '@/Components/ui/label'

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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-xl shadow-md">
              <FaRegComment className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Class Discussion</h1>
              <p className="text-sm md:text-base text-gray-500">Share and discuss with your class</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowNewPostForm(!showNewPostForm)}
            className={`flex items-center gap-2 ${!showNewPostForm ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} shadow-sm transition-all`}
          >
            {showNewPostForm ? (
              <>
                <FaPlus size={14} className="rotate-45" />
                Cancel
              </>
            ) : (
              <>
                <FaPlus size={14} />
                New Post
              </>
            )}
          </Button>
        </div>
      </div>
      
      {showNewPostForm && (
        <Card className="border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-50 p-1.5 rounded-md">
                <FaPlus className="h-4 w-4 text-indigo-600" />
              </div>
              <CardTitle className="text-gray-800">Create New Post</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <Label htmlFor="post-title" className="text-xs md:text-sm font-medium text-gray-700 mb-1.5 block">Post Title</Label>
              <Input
                id="post-title"
                placeholder="Enter a descriptive title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <Label htmlFor="post-content" className="text-xs md:text-sm font-medium text-gray-700 mb-1.5 block">Post Content</Label>
              <Textarea
                id="post-content"
                placeholder="Share your thoughts or questions with the class..."
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 p-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setTitle('')
                setContent('')
                setShowNewPostForm(false)
              }}
              className="border-gray-300 text-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreatePost}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              Create Post
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-12 h-12 border-4 border-t-indigo-500 border-indigo-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading discussions...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaRegComment className="h-7 w-7 text-indigo-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No discussions yet</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Be the first to start a discussion in this class. Share your thoughts, questions, or resources with your peers.
          </p>
          <Button 
            onClick={() => setShowNewPostForm(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 mx-auto"
          >
            <FaPlus size={14} className="mr-2" />
            Start a Discussion
          </Button>
        </div>
      ) : (
        <div className="grid gap-5">
          {posts.map((post) => (
            <Card key={post.post.postId} className="border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
              <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-50 p-2 rounded-full border border-indigo-100 mt-1">
                      <FaRegComment className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <CardTitle 
                        className="text-lg text-indigo-700 cursor-pointer hover:text-indigo-800 transition-colors"
                        onClick={() => setSelectedPost(post.post.postId)}
                      >
                        {post.post.title}
                      </CardTitle>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <span className="bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium text-gray-700">
                          {post.author?.firstname?.charAt(0) || post.author?.username?.charAt(0) || "?"}
                        </span>
                        <span>
                          Posted by {post.author?.firstname && post.author?.lastname 
                            ? `${post.author.firstname} ${post.author.lastname}` 
                            : post.author?.username || "Unknown"}
                        </span>
                        <span>•</span>
                        <span>{formatDate(post.post.postDate)}</span>
                      </div>
                    </div>
                  </div>
                  {post.author.userId === currentUser.id && (
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-red-50 text-red-500 hover:text-red-600"
                        onClick={() => confirmDeletePost(post.post.postId)}
                      >
                        <FaTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                  {post.post.postContent}
                </p>
              </CardContent>
              <CardFooter className="justify-between border-t border-gray-100 bg-gray-50 py-3">
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                  onClick={() => setSelectedPost(post.post.postId)}
                >
                  <FaRegComment size={14} />
                  View Discussion
                </Button>
                <div className="bg-indigo-100 px-3 py-1 rounded-full text-xs text-indigo-700">
                  {getTimeSince(post.post.postDate)}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md border border-gray-100 shadow-xl">
          <div className="bg-red-50 p-4 rounded-lg mb-4 flex items-center gap-3">
            <div className="bg-red-500 p-2 rounded-full">
              <FaTrash className="h-4 w-4 text-white" />
            </div>
            <AlertDialogTitle className="m-0 text-red-700">Delete Post</AlertDialogTitle>
          </div>
          
          <AlertDialogHeader className="pb-0">
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to delete this post? This action cannot be undone and will permanently delete the post and all its comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4"></div>
          
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel
              onClick={() => setPostToDelete(null)}
              className="mt-0 border-gray-300 text-gray-700"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePost}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0"
            >
              Delete Post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default BlogPage 