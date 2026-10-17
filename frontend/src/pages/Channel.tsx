import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as api from '../api'
import type { Project, User } from '../api/types'
import { Avatar } from '../components/Header'
import { ProjectGrid } from '../components/ProjectCard'
import SubscribeButton from '../components/SubscribeButton'
import { useSubscriptions } from '../context/SubscriptionsContext'
import { compactCount } from '../lib/format'

export default function Channel() {
  const id = Number(useParams().id)
  const { refresh } = useSubscriptions()
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setUser(null)
    setError('')
    api.getUser(id).then(setUser).catch((e) => setError(e.message))
    api.getUserProjects(id).then(setProjects)
    api.markChannelSeen(id).then(refresh)
  }, [id, refresh])

  if (error) return <p className="page-msg">{error}</p>
  if (!user) return <p className="page-msg">불러오는 중...</p>

  return (
    <div className="page">
      <div className="channel-head">
        <Avatar name={user.nickname} size={88} />
        <div className="channel-info">
          <h1>{user.nickname}</h1>
          <p className="muted">
            구독자 {compactCount(user.subscriberCount)}명 · 프로젝트 {user.projectCount}개
          </p>
          <SubscribeButton
            userId={user.id}
            subscribed={user.subscribedByMe}
            onChange={(v) => setUser({ ...user, subscribedByMe: v, subscriberCount: user.subscriberCount + (v ? 1 : -1) })}
          />
        </div>
      </div>
      <h2 className="section-title">프로젝트</h2>
      {projects && projects.length === 0 ? <p className="page-msg">아직 올린 HTML이 없어요.</p> : <ProjectGrid projects={projects ?? []} />}
    </div>
  )
}
