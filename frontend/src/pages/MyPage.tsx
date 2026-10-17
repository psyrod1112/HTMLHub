import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import * as api from '../api'
import type { Project } from '../api/types'
import { Avatar } from '../components/Header'
import { IconTrash } from '../components/Icons'
import { ProjectGrid } from '../components/ProjectCard'
import { useAuth } from '../context/AuthContext'
import { useSubscriptions } from '../context/SubscriptionsContext'
import { compactCount, timeAgo } from '../lib/format'

const TABS = [
  ['projects', '내 게임'],
  ['likes', '좋아요'],
  ['subs', '구독'],
  ['account', '계정'],
] as const
type Tab = (typeof TABS)[number][0]

export default function MyPage() {
  const { me } = useAuth()
  const [params, setParams] = useSearchParams()
  const tab = (TABS.some(([k]) => k === params.get('tab')) ? params.get('tab') : 'projects') as Tab

  return (
    <div className="page">
      <div className="channel-head">
        <Avatar name={me!.nickname} size={72} />
        <div className="channel-info">
          <h1>{me!.nickname}</h1>
          <p className="muted">{me!.email}</p>
        </div>
      </div>
      <div className="tabs" role="tablist">
        {TABS.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setParams({ tab: k })}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'projects' && <MyProjects userId={me!.id} />}
      {tab === 'likes' && <MyLikes />}
      {tab === 'subs' && <MySubs />}
      {tab === 'account' && <Account />}
    </div>
  )
}

function MyProjects({ userId }: { userId: number }) {
  const [items, setItems] = useState<Project[] | null>(null)
  useEffect(() => {
    api.getUserProjects(userId).then(setItems)
  }, [userId])

  const remove = async (p: Project) => {
    if (!confirm(`"${p.title}"을(를) 삭제할까요? 댓글과 좋아요도 함께 삭제되고 되돌릴 수 없어요.`)) return
    await api.deleteProject(p.id)
    setItems((prev) => prev?.filter((x) => x.id !== p.id) ?? null)
  }

  if (!items) return <p className="page-msg">불러오는 중...</p>
  if (!items.length)
    return (
      <div className="page-msg">
        <p>아직 올린 HTML이 없어요.</p>
        <Link to="/upload" className="btn btn-primary">첫 HTML 등록하기</Link>
      </div>
    )
  return (
    <table className="table">
      <thead>
        <tr><th>프로젝트</th><th>등록일</th><th>조회수</th><th>좋아요</th><th>댓글</th><th /></tr>
      </thead>
      <tbody>
        {items.map((p) => (
          <tr key={p.id}>
            <td>
              <Link to={`/p/${p.id}`} className="table-project">
                <img src={p.thumbnailUrl} alt="" />
                <span>{p.title}</span>
              </Link>
            </td>
            <td data-label="등록일">{timeAgo(p.createdAt)}</td>
            <td data-label="조회수">{compactCount(p.viewCount)}</td>
            <td data-label="좋아요">{compactCount(p.likeCount)}</td>
            <td data-label="댓글">{compactCount(p.commentCount)}</td>
            <td>
              <button className="icon-btn danger" onClick={() => remove(p)} aria-label="삭제" title="삭제">
                <IconTrash width={18} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function MyLikes() {
  const [items, setItems] = useState<Project[] | null>(null)
  useEffect(() => {
    api.getMyLikes().then(setItems)
  }, [])
  if (!items) return <p className="page-msg">불러오는 중...</p>
  if (!items.length) return <p className="page-msg">좋아요한 HTML이 없어요.</p>
  return <ProjectGrid projects={items} />
}

function MySubs() {
  const { channels } = useSubscriptions()
  if (!channels.length) return <p className="page-msg">구독한 크리에이터가 없어요.</p>
  return (
    <ul className="sub-list">
      {channels.map((c) => (
        <li key={c.id}>
          <Link to={`/u/${c.id}`} className="sub-item">
            <Avatar name={c.nickname} size={48} />
            <strong>{c.nickname}</strong>
          </Link>
        </li>
      ))}
    </ul>
  )
}

function Account() {
  const { clear } = useAuth()
  const navigate = useNavigate()
  const [confirmText, setConfirmText] = useState('')
  const [busy, setBusy] = useState(false)

  const withdraw = async () => {
    setBusy(true)
    await api.deleteAccount()
    clear()
    navigate('/')
  }

  return (
    <div className="danger-zone">
      <h2>회원탈퇴</h2>
      <p>탈퇴하면 내가 올린 프로젝트, 댓글, 좋아요, 구독 정보가 <strong>모두 즉시 삭제</strong>되고 복구할 수 없어요.</p>
      <label className="field">
        <span>계속하려면 <code>탈퇴합니다</code>를 입력하세요.</span>
        <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
      </label>
      <button className="btn btn-danger" disabled={confirmText !== '탈퇴합니다' || busy} onClick={withdraw}>
        {busy ? '처리 중...' : '회원탈퇴'}
      </button>
    </div>
  )
}
