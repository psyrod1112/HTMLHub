import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { me, loading } = useAuth()
  const location = useLocation()
  if (loading) return <p className="page-msg">불러오는 중...</p>
  if (!me) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}
