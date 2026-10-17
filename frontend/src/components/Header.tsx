import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { IconLogout, IconMenu, IconMoon, IconSun, IconUpload, IconUser } from './Icons'

export default function Header({ onMenu }: { onMenu: () => void }) {
  const { me, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <header className="header">
      <div className="header-left">
        <button className="icon-btn" onClick={onMenu} aria-label="메뉴">
          <IconMenu />
        </button>
        <Link to="/" className="brand" aria-label="HTML Hub 홈">
          <img src="/logo-mark.png" alt="" width={32} height={32} />
          <span className="brand-text">HTML Hub</span>
        </Link>
      </div>
      <div className="header-right">
        <button className="icon-btn" onClick={toggle} aria-label="테마 전환" title={theme === 'light' ? '다크 모드' : '라이트 모드'}>
          {theme === 'light' ? <IconMoon /> : <IconSun />}
        </button>
        {me ? (
          <>
            <Link to="/upload" className="btn btn-primary btn-upload">
              <IconUpload width={18} height={18} />
              <span>HTML 등록</span>
            </Link>
            <div className="user-menu" ref={menuRef}>
              <button className="avatar-btn" onClick={() => setOpen((v) => !v)} aria-label="내 메뉴">
                <Avatar name={me.nickname} />
              </button>
              {open && (
                <div className="dropdown" onClick={() => setOpen(false)}>
                  <div className="dropdown-head">
                    <strong>{me.nickname}</strong>
                    <span className="muted">{me.email}</span>
                  </div>
                  <Link to="/me" className="dropdown-item"><IconUser width={18} />마이페이지</Link>
                  <Link to={`/u/${me.id}`} className="dropdown-item"><IconUser width={18} />내 채널</Link>
                  <button
                    className="dropdown-item"
                    onClick={async () => {
                      await logout()
                      navigate('/')
                    }}
                  >
                    <IconLogout width={18} />로그아웃
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login" className="btn btn-outline">로그인</Link>
        )}
      </div>
    </header>
  )
}

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.45, background: `hsl(${h} 55% 45%)` }}>
      {name.slice(0, 1)}
    </span>
  )
}
