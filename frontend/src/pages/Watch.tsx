import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import * as api from '../api'
import type { Project, User } from '../api/types'
import Comments from '../components/Comments'
import GamePlayer from '../components/GamePlayer'
import { Avatar } from '../components/Header'
import { IconHeart, IconTrash } from '../components/Icons'
import ProjectCard from '../components/ProjectCard'
import SubscribeButton from '../components/SubscribeButton'
import { useAuth } from '../context/AuthContext'
import { compactCount, timeAgo } from '../lib/format'

export default function Watch() {
  const id = Number(useParams().id)
  const { me } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [owner, setOwner] = useState<User | null>(null)
  const [recs, setRecs] = useState<Project[]>([])
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setProject(null)
    setError('')
    setExpanded(false)
    api
      .recordView(id)
      .then(() => api.getProject(id))
      .then((p) => {
        setProject(p)
        document.title = `${p.title} - HTML Hub`
        return api.getUser(p.owner.id).then(setOwner)
      })
      .catch((e) => setError(e.message))
    api.getRecommendations(id).then(setRecs)
    window.scrollTo(0, 0)
    return () => {
      document.title = 'HTML Hub'
    }
  }, [id])

  if (error) return <p className="page-msg">{error}</p>
  if (!project) return <p className="page-msg">불러오는 중...</p>

  const toggleLike = async () => {
    if (!me) return navigate('/login')
    const liked = project.likedByMe
    setProject({ ...project, likedByMe: !liked, likeCount: project.likeCount + (liked ? -1 : 1) })
    try {
      await (liked ? api.unlikeProject(id) : api.likeProject(id))
    } catch {
      setProject(project)
    }
  }

  const remove = async () => {
    if (!confirm('이 프로젝트를 삭제할까요? 댓글과 좋아요도 함께 삭제되고 되돌릴 수 없어요.')) return
    await api.deleteProject(id)
    navigate('/me')
  }

  const canDelete = me && (me.id === project.owner.id || me.role === 'admin')

  return (
    <div className="watch">
      <div className="watch-main">
        <GamePlayer src={project.playUrl} title={project.title} />
        <h1 className="watch-title">{project.title}</h1>
        <div className="watch-row">
          <div className="owner">
            <Link to={`/u/${project.owner.id}`}><Avatar name={project.owner.nickname} size={40} /></Link>
            <div>
              <Link to={`/u/${project.owner.id}`} className="owner-name">{project.owner.nickname}</Link>
              <span className="muted small">구독자 {compactCount(owner?.subscriberCount ?? 0)}명</span>
            </div>
            {owner && (
              <SubscribeButton
                userId={owner.id}
                subscribed={owner.subscribedByMe}
                onChange={(v) => setOwner({ ...owner, subscribedByMe: v, subscriberCount: owner.subscriberCount + (v ? 1 : -1) })}
              />
            )}
          </div>
          <div className="watch-actions">
            <button className={`btn btn-muted ${project.likedByMe ? 'liked' : ''}`} onClick={toggleLike}>
              <IconHeart width={18} filled={project.likedByMe} />
              {compactCount(project.likeCount)}
            </button>
            {canDelete && (
              <button className="btn btn-muted" onClick={remove}>
                <IconTrash width={18} />삭제
              </button>
            )}
          </div>
        </div>
        <div className={`description ${expanded ? 'expanded' : ''}`} onClick={() => setExpanded(true)}>
          <strong>조회수 {project.viewCount.toLocaleString()}회 · {timeAgo(project.createdAt)}</strong>
          <p>{project.description}</p>
          {!expanded && project.description.length > 120 && <span className="more">...더보기</span>}
        </div>
        <Comments
          projectId={id}
          onCountChange={(d) => setProject((p) => (p ? { ...p, commentCount: p.commentCount + d } : p))}
        />
      </div>
      <aside className="watch-side">
        {recs.map((p) => (
          <ProjectCard key={p.id} project={p} compact />
        ))}
      </aside>
    </div>
  )
}
