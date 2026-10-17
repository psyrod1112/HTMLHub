import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../api'
import type { Comment } from '../api/types'
import { useAuth } from '../context/AuthContext'
import { timeAgo } from '../lib/format'
import { LIMITS } from '../lib/validation'
import { Avatar } from './Header'
import { IconTrash } from './Icons'

export default function Comments({ projectId, onCountChange }: { projectId: number; onCountChange: (delta: number) => void }) {
  const { me } = useAuth()
  const [comments, setComments] = useState<Comment[] | null>(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setComments(null)
    api.listComments(projectId).then(setComments)
  }, [projectId])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const content = text.trim()
    if (!content) return
    setSending(true)
    setError('')
    try {
      const c = await api.createComment(projectId, content)
      setComments((prev) => [c, ...(prev ?? [])])
      onCountChange(1)
      setText('')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSending(false)
    }
  }

  const remove = async (id: number) => {
    if (!confirm('댓글을 삭제할까요?')) return
    await api.deleteComment(id)
    setComments((prev) => prev?.filter((c) => c.id !== id) ?? null)
    onCountChange(-1)
  }

  return (
    <section className="comments">
      <h2 className="section-title">댓글 {comments?.length ?? ''}개</h2>
      {me ? (
        <form className="comment-form" onSubmit={submit}>
          <Avatar name={me.nickname} size={36} />
          <div className="comment-input">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="댓글 추가..."
              maxLength={LIMITS.commentMax}
              rows={2}
            />
            {error && <p className="form-error">{error}</p>}
            <div className="comment-actions">
              <span className="muted small">{text.length}/{LIMITS.commentMax}</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setText('')} disabled={!text}>취소</button>
              <button className="btn btn-primary btn-sm" disabled={!text.trim() || sending}>댓글</button>
            </div>
          </div>
        </form>
      ) : (
        <p className="muted comment-login">
          <Link to="/login" className="link">로그인</Link>하고 댓글을 남겨보세요.
        </p>
      )}
      {comments === null ? (
        <p className="muted">불러오는 중...</p>
      ) : (
        <ul className="comment-list">
          {comments.map((c) => (
            <li key={c.id} className="comment">
              <Link to={`/u/${c.user.id}`}><Avatar name={c.user.nickname} size={36} /></Link>
              <div className="comment-body">
                <div className="comment-head">
                  <Link to={`/u/${c.user.id}`} className="comment-author">{c.user.nickname}</Link>
                  <span className="muted small">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="comment-text">{c.content}</p>
              </div>
              {me && (me.id === c.user.id || me.role === 'admin') && (
                <button className="icon-btn" onClick={() => remove(c.id)} aria-label="댓글 삭제">
                  <IconTrash width={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
