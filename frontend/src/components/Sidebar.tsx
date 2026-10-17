import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSubscriptions } from '../context/SubscriptionsContext'
import { Avatar } from './Header'
import { IconCheck, IconHome, IconSubs, IconUser } from './Icons'

export default function Sidebar({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const { me } = useAuth()
  const { channels } = useSubscriptions()

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`} onClick={(e) => (e.target as HTMLElement).closest('a') && onNavigate()}>
      <nav className="side-section">
        <NavLink to="/" end className="side-item"><IconHome />홈</NavLink>
        <NavLink to="/feed/subscriptions" className="side-item"><IconSubs />구독</NavLink>
        <NavLink to="/me" className="side-item"><IconUser />마이페이지</NavLink>
      </nav>
      <div className="side-section">
        <h3 className="side-title">구독</h3>
        {!me && (
          <div className="side-empty">
            <p>로그인하면 구독한 크리에이터의 새 HTML을 볼 수 있어요.</p>
            <Link to="/login" className="btn btn-outline btn-sm">로그인</Link>
          </div>
        )}
        {me && channels.length === 0 && <p className="side-empty">아직 구독한 크리에이터가 없어요.</p>}
        {channels.map((c) => (
          <NavLink key={c.id} to={`/u/${c.id}`} className="side-item">
            <Avatar name={c.nickname} size={24} />
            <span className="side-name">{c.nickname}</span>
            {c.hasNew && (
              <span className="new-badge" title="새 HTML 등록됨">
                <IconCheck width={12} height={12} />
              </span>
            )}
          </NavLink>
        ))}
      </div>
      <footer className="side-footer">© 2026 HTML Hub</footer>
    </aside>
  )
}
