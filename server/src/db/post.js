import { db } from '../config/db_config.js'
import Post from '../schema/Post.js'
import { eq, and, desc } from 'drizzle-orm'
import Class from '../schema/Class.js'
import User from '../schema/User.js'
import Comment from '../schema/Comment.js'

export const createPost = async ({ userId, classId, title, postContent }) => {
  try {
    // Check if class exists
    const classExists = await db.select().from(Class).where(eq(Class.id, classId))
    if (!classExists || classExists.length === 0) {
      return {
        status: 404,
        item: { message: 'Class not found' }
      }
    }

    const newPost = await db.insert(Post).values({
      userId,
      classId,
      title,
      postContent,
      postDate: new Date()
    }).returning()

    return {
      status: 201,
      item: newPost[0]
    }
  } catch (error) {
    console.error('Error creating post:', error)
    return {
      status: 500,
      item: { message: 'Failed to create post' }
    }
  }
}

export const getPostsByClassId = async (classId) => {
  try {
    // Simplified select query that matches the database structure
    const posts = await db.select()
      .from(Post)
      .leftJoin(User, eq(Post.userId, User.userId))
      .where(eq(Post.classId, classId))
      .orderBy(desc(Post.postDate))

    // Format the response to match the expected structure
    const formattedPosts = posts.map(item => ({
      post: {
        postId: item.post.postId,
        userId: item.post.userId,
        classId: item.post.classId,
        title: item.post.title,
        postContent: item.post.postContent,
        postDate: item.post.postDate
      },
      author: {
        userId: item.user?.userId,
        username: item.user?.username,
        firstname: item.user?.firstname,
        lastname: item.user?.lastname
      }
    }))

    return {
      status: 200,
      item: formattedPosts
    }
  } catch (error) {
    console.error('Error getting posts:', error)
    return {
      status: 500,
      item: { message: 'Failed to get posts' }
    }
  }
}

export const getPostById = async (postId) => {
  try {
    // Simplified select query that matches the database structure
    const posts = await db.select()
      .from(Post)
      .leftJoin(User, eq(Post.userId, User.userId))
      .where(eq(Post.postId, postId))

    if (!posts || posts.length === 0) {
      return {
        status: 404,
        item: { message: 'Post not found' }
      }
    }

    // Format the response to match the expected structure
    const post = {
      post: {
        postId: posts[0].post.postId,
        userId: posts[0].post.userId,
        classId: posts[0].post.classId,
        title: posts[0].post.title,
        postContent: posts[0].post.postContent,
        postDate: posts[0].post.postDate
      },
      author: {
        userId: posts[0].user?.userId,
        username: posts[0].user?.username,
        firstname: posts[0].user?.firstname,
        lastname: posts[0].user?.lastname
      }
    }

    return {
      status: 200,
      item: post
    }
  } catch (error) {
    console.error('Error getting post:', error)
    return {
      status: 500,
      item: { message: 'Failed to get post' }
    }
  }
}

export const updatePost = async ({ postId, userId, title, postContent }) => {
  try {
    // First check if post exists and belongs to user
    const existingPost = await db.select().from(Post).where(
      and(
        eq(Post.postId, postId),
        eq(Post.userId, userId)
      )
    )

    if (!existingPost || existingPost.length === 0) {
      return {
        status: 404,
        item: { message: 'Post not found or you do not have permission to edit' }
      }
    }

    const updatedPost = await db.update(Post)
      .set({
        title,
        postContent,
      })
      .where(eq(Post.postId, postId))
      .returning()

    return {
      status: 200,
      item: updatedPost[0]
    }
  } catch (error) {
    console.error('Error updating post:', error)
    return {
      status: 500,
      item: { message: 'Failed to update post' }
    }
  }
}

export const deletePost = async ({ postId, userId }) => {
  try {
    // First check if post exists and belongs to user
    const existingPost = await db.select().from(Post).where(
      and(
        eq(Post.postId, postId),
        eq(Post.userId, userId)
      )
    )

    if (!existingPost || existingPost.length === 0) {
      return {
        status: 404,
        item: { message: 'Post not found or you do not have permission to delete' }
      }
    }

    // Delete all comments associated with this post first
    await db.delete(Comment).where(eq(Comment.postId, postId))

    // Then delete the post
    await db.delete(Post).where(eq(Post.postId, postId))

    return {
      status: 200,
      item: { message: 'Post and all its comments deleted successfully' }
    }
  } catch (error) {
    console.error('Error deleting post:', error)
    return {
      status: 500,
      item: { message: 'Failed to delete post' }
    }
  }
}

export const deletePostsByClassId = async (classId) => {
  try {
    // First check if there are any posts for this class
    const posts = await db
      .select({
        postId: Post.postId
      })
      .from(Post)
      .where(eq(Post.classId, classId));
    
    if (posts.length === 0) {
      // No posts found for this class
      return { 
        status: 200, 
        item: { 
          message: 'No posts to delete', 
          count: 0 
        } 
      };
    }

    // For each post, delete all its comments first
    for (const post of posts) {
      await db.delete(Comment).where(eq(Comment.postId, post.postId));
    }

    // Then delete all posts for this class
    const deletedPosts = await db
      .delete(Post)
      .where(eq(Post.classId, classId))
      .returning();

    return { 
      status: 200, 
      item: { 
        message: 'All posts and their comments deleted successfully', 
        count: deletedPosts.length 
      } 
    };
  } catch (error) {
    console.error('Error in deletePostsByClassId:', error);
    return {
      status: 500,
      error: error.message || 'Failed to delete posts'
    };
  }
} 