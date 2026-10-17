import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

export default function Layout() {
  const { pathname } = useLocation()
  // 플레이 화면은 유튜브처럼 사이드바를 기본으로 숨기고 드로어로만 연다
  const overlayOnly = pathname.startsWith('/p/')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const onMenu = () => {
    if (overlayOnly || window.innerWidth < 1100) setDrawerOpen((v) => !v)
    else setCollapsed((v) => !v)
  }

  return (
    <div className={`app ${overlayOnly ? 'overlay-only' : ''} ${collapsed ? 'collapsed' : ''}`}>
      <Header onMenu={onMenu} />
      <Sidebar open={drawerOpen} onNavigate={() => setDrawerOpen(false)} />
      {drawerOpen && <div className="scrim" onClick={() => setDrawerOpen(false)} />}
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
