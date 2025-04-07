import { db } from '../config/db_config.js'
import Comment from '../schema/Comment.js'
import Post from '../schema/Post.js'
import User from '../schema/User.js'
import { eq, and, desc } from 'drizzle-orm'

export const createComment = async ({ postId, userId, commentContent }) => {
  try {
    // Check if post exists
    const postExists = await db.select().from(Post).where(eq(Post.postId, postId))
    if (!postExists || postExists.length === 0) {
      return {
        status: 404,
        item: { message: 'Post not found' }
      }
    }

    const newComment = await db.insert(Comment).values({
      postId,
      userId,
      commentContent,
      commentDate: new Date()
    }).returning()

    return {
      status: 201,
      item: newComment[0]
    }
  } catch (error) {
    console.error('Error creating comment:', error)
    return {
      status: 500,
      item: { message: 'Failed to create comment' }
    }
  }
}

export const getCommentsByPostId = async (postId) => {
  try {
    // Simplified select query that matches the database structure
    const comments = await db.select()
      .from(Comment)
      .leftJoin(User, eq(Comment.userId, User.userId))
      .where(eq(Comment.postId, postId))
      .orderBy(desc(Comment.commentDate))

    // Format the response to match the expected structure
    const formattedComments = comments.map(item => ({
      comment: {
        commentId: item.comment.commentId,
        postId: item.comment.postId,
        userId: item.comment.userId,
        commentContent: item.comment.commentContent,
        commentDate: item.comment.commentDate
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
      item: formattedComments
    }
  } catch (error) {
    console.error('Error getting comments:', error)
    return {
      status: 500,
      item: { message: 'Failed to get comments' }
    }
  }
}

export const updateComment = async ({ commentId, userId, commentContent }) => {
  try {
    // First check if comment exists and belongs to user
    const existingComment = await db.select().from(Comment).where(
      and(
        eq(Comment.commentId, commentId),
        eq(Comment.userId, userId)
      )
    )

    if (!existingComment || existingComment.length === 0) {
      return {
        status: 404,
        item: { message: 'Comment not found or you do not have permission to edit' }
      }
    }

    const updatedComment = await db.update(Comment)
      .set({
        commentContent,
      })
      .where(eq(Comment.commentId, commentId))
      .returning()

    return {
      status: 200,
      item: updatedComment[0]
    }
  } catch (error) {
    console.error('Error updating comment:', error)
    return {
      status: 500,
      item: { message: 'Failed to update comment' }
    }
  }
}

export const deleteComment = async ({ commentId, userId }) => {
  try {
    // First check if comment exists and belongs to user
    const existingComment = await db.select().from(Comment).where(
      and(
        eq(Comment.commentId, commentId),
        eq(Comment.userId, userId)
      )
    )

    if (!existingComment || existingComment.length === 0) {
      return {
        status: 404,
        item: { message: 'Comment not found or you do not have permission to delete' }
      }
    }

    await db.delete(Comment).where(eq(Comment.commentId, commentId))

    return {
      status: 200,
      item: { message: 'Comment deleted successfully' }
    }
  } catch (error) {
    console.error('Error deleting comment:', error)
    return {
      status: 500,
      item: { message: 'Failed to delete comment' }
    }
  }
} 