import { eq, and } from 'drizzle-orm'
import { db } from '../config/db_config.js'
import Post from '../schema/Post.js'
import User from '../schema/User.js'
import Class from '../schema/Class.js'
import Student from '../schema/Student.js'
import Tutor from '../schema/Tutor.js'
import { Log, logError } from '../lib/logger.js'

export const createPost = async ({ userId, classId, title, content }) => {
  try {
    const post = await db
      .insert(Post)
      .values({
        userId,
        classId,
        title,
        postContent: content
      })
      .returning()

    if (!post || post.length === 0) {
      logError('create post', 'post not created')
      return { status: 400, error: 'Failed to create post' }
    }

    // Get user info for the post
    const user = await db
      .select({
        username: User.username
      })
      .from(User)
      .where(eq(User.userId, userId))
      .limit(1)

    Log('post created')
    return { 
      status: 200, 
      item: {
        ...post[0],
        username: user[0].username
      }
    }
  } catch (err) {
    logError('create post', err)
    return { status: 500, error: err.message }
  }
}

export const getPostsByClass = async (classId, userId) => {
  try {
    // Check if classId and userId are provided
    if (!classId || !userId) {
      return { 
        status: 400, 
        error: 'Missing required parameters',
        item: null 
      }
    }

    // Check if user is a member of the class (either student or tutor)
    const classAccess = await db
      .select()
      .from(Class)
      .where(eq(Class.id, classId))
      .limit(1)

    if (!classAccess || classAccess.length === 0) {
      logError('get posts', 'class not found')
      return { 
        status: 404, 
        error: 'Class not found',
        item: null 
      }
    }

    // Check if user is a student or tutor
    const isStudent = await db
      .select()
      .from(Student)
      .where(eq(Student.userId, userId))
      .limit(1)

    const isTutor = await db
      .select()
      .from(Tutor)
      .where(eq(Tutor.userId, userId))
      .limit(1)

    if (!isStudent.length && !isTutor.length) {
      logError('get posts', 'user not authorized')
      return { 
        status: 403, 
        error: 'You must be a student or tutor to view posts',
        item: null 
      }
    }

    const posts = await db
      .select({
        postId: Post.postId,
        title: Post.title,
        postContent: Post.postContent,
        postDate: Post.postDate,
        username: User.username,
        userId: Post.userId,
        classId: Post.classId
      })
      .from(Post)
      .innerJoin(User, eq(User.userId, Post.userId))
      .where(eq(Post.classId, classId))
      .orderBy(Post.postDate)

    Log('posts found')
    return { 
      status: 200, 
      error: null,
      item: posts || [] 
    }

  } catch (err) {
    logError('get posts', err)
    return { 
      status: 500, 
      error: err.message || 'Internal server error',
      item: null 
    }
  }
}

export const deletePost = async ({ postId, userId }) => {
  try {
    // Check if user owns the post
    const post = await db
      .select()
      .from(Post)
      .where(
        and(
          eq(Post.postId, postId),
          eq(Post.userId, userId)
        )
      )
      .limit(1)

    if (!post || post.length === 0) {
      logError('delete post', 'post not found or user not authorized')
      return { status: 404, error: 'Post not found or you are not authorized to delete it' }
    }

    await db
      .delete(Post)
      .where(eq(Post.postId, postId))

    Log('post deleted')
    return { status: 200, item: 'Post deleted successfully' }
  } catch (err) {
    logError('delete post', err)
    return { status: 500, error: err.message }
  }
} 