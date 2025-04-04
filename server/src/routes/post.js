import express from 'express'
import { createPost, getPostsByClass, deletePost } from '../db/post.js'
import { createComment, getCommentsByPost, deleteComment } from '../db/comment.js'
import { authenticateToken } from '../lib/auth.js'

const router = express.Router()

// Post endpoints
router.post('/', authenticateToken, async (req, res) => {
  const { classId, title, content } = req.body
  const userId = req.user.userId

  const result = await createPost({ userId, classId, title, content })
  res.status(result.status).json(result)
})

router.get('/class/:classId', authenticateToken, async (req, res) => {
  const { classId } = req.params
  const userId = req.user.id
  const result = await getPostsByClass(classId, userId)
  res.status(result.status).json(result)
})

router.delete('/:postId', authenticateToken, async (req, res) => {
  const { postId } = req.params
  const userId = req.user.userId
  const result = await deletePost({ postId, userId })
  res.status(result.status).json(result)
})

// Comment endpoints
router.post('/:postId/comments', authenticateToken, async (req, res) => {
  const { postId } = req.params
  const { commentContent } = req.body
  const userId = req.user.userId

  const result = await createComment({ userId, postId, commentContent })
  res.status(result.status).json(result)
})

router.get('/:postId/comments', authenticateToken, async (req, res) => {
  const { postId } = req.params
  const userId = req.user.id
  const result = await getCommentsByPost(postId, userId)
  res.status(result.status).json(result)
})

router.delete('/comments/:commentId', authenticateToken, async (req, res) => {
  const { commentId } = req.params
  const userId = req.user.userId
  const result = await deleteComment({ commentId, userId })
  res.status(result.status).json(result)
})

export default router 