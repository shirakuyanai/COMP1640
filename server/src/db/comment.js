import { eq, and } from 'drizzle-orm'
import { db } from '../config/db_config.js'
import Comment from '../schema/Comment.js'
import User from '../schema/User.js'
import Post from '../schema/Post.js'
import Class from '../schema/Class.js'
import Student from '../schema/Student.js'
import Tutor from '../schema/Tutor.js'
import { Log, logError } from '../lib/logger.js'

export const createComment = async ({ userId, postId, commentContent }) => {
  try {
    const comment = await db
      .insert(Comment)
      .values({
        userId,
        postId,
        commentContent
      })
      .returning()

    if (!comment || comment.length === 0) {
      logError('create comment', 'comment not created')
      return { status: 400, error: 'Failed to create comment' }
    }

    // Get user info for the comment
    const user = await db
      .select({
        username: User.username
      })
      .from(User)
      .where(eq(User.userId, userId))
      .limit(1)

    Log('comment created')
    return { 
      status: 200, 
      item: {
        ...comment[0],
        username: user[0].username
      }
    }
  } catch (err) {
    logError('create comment', err)
    return { status: 500, error: err.message }
  }
}

export const getCommentsByPost = async (postId, userId) => {
  try {
    if (!postId || !userId) {
      return { 
        status: 400, 
        error: 'Missing required parameters',
        item: null 
      }
    }

    // First get the post to check class access
    const post = await db
      .select()
      .from(Post)
      .where(eq(Post.postId, postId))
      .limit(1)

    if (!post || post.length === 0) {
      logError('get comments', 'post not found')
      return { 
        status: 404, 
        error: 'Post not found',
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
      logError('get comments', 'user not authorized')
      return { 
        status: 403, 
        error: 'You must be a student or tutor to view comments',
        item: null 
      }
    }

    const comments = await db
      .select({
        commentId: Comment.commentId,
        commentContent: Comment.commentContent,
        commentDate: Comment.commentDate,
        username: User.username,
        userId: Comment.userId,
        postId: Comment.postId
      })
      .from(Comment)
      .innerJoin(User, eq(User.userId, Comment.userId))
      .where(eq(Comment.postId, postId))
      .orderBy(Comment.commentDate)

    Log('comments found')
    return { 
      status: 200, 
      error: null,
      item: comments || [] 
    }

  } catch (err) {
    logError('get comments', err)
    return { 
      status: 500, 
      error: err.message || 'Internal server error',
      item: null 
    }
  }
}

export const deleteComment = async ({ commentId, userId }) => {
  try {
    // Check if user owns the comment
    const comment = await db
      .select()
      .from(Comment)
      .where(
        and(
          eq(Comment.commentId, commentId),
          eq(Comment.userId, userId)
        )
      )
      .limit(1)

    if (!comment || comment.length === 0) {
      logError('delete comment', 'comment not found or user not authorized')
      return { status: 404, error: 'Comment not found or you are not authorized to delete it' }
    }

    await db
      .delete(Comment)
      .where(eq(Comment.commentId, commentId))

    Log('comment deleted')
    return { status: 200, item: 'Comment deleted successfully' }
  } catch (err) {
    logError('delete comment', err)
    return { status: 500, error: err.message }
  }
} 