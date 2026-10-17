import { useState, type ChangeEvent, type FormEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import * as api from '../api'
import { useAuth } from '../context/AuthContext'
import { validateEmail, validateNickname, validatePassword } from '../lib/validation'

function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <Link to="/" className="auth-logo"><img src="/logo-full.png" alt="HTML Hub" /></Link>
        <h1>{title}</h1>
        {children}
      </div>
    </div>
  )
}

function Field({ label, error, ...props }: { label: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} aria-invalid={!!error} />
      {error && <em className="form-error">{error}</em>}
    </label>
  )
}

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <AuthCard title="로그인">
      <form className="form" onSubmit={submit}>
        <Field label="이메일" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Field label="비밀번호" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? '로그인 중...' : '로그인'}</button>
      </form>
      <div className="auth-links">
        <Link to="/forgot-password" className="link">비밀번호 찾기</Link>
        <Link to="/signup" className="link">회원가입</Link>
      </div>
      <p className="muted small demo-hint">데모 계정: demo@htmlhub.dev / password123</p>
    </AuthCard>
  )
}

export function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nickname: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    const n = validateNickname(form.nickname)
    if (n) next.nickname = n
    const em = validateEmail(form.email.trim())
    if (em) next.email = em
    const pw = validatePassword(form.password)
    if (pw) next.password = pw
    if (form.password !== form.confirm) next.confirm = '비밀번호가 일치하지 않아요.'
    setErrors(next)
    if (Object.keys(next).length) return

    setBusy(true)
    try {
      await api.signup({ nickname: form.nickname.trim(), email: form.email.trim(), password: form.password })
      navigate('/login', { replace: true })
    } catch (err) {
      setErrors({ form: (err as Error).message })
      setBusy(false)
    }
  }

  return (
    <AuthCard title="회원가입">
      <form className="form" onSubmit={submit} noValidate>
        <Field label="닉네임" autoComplete="nickname" value={form.nickname} onChange={set('nickname')} error={errors.nickname} />
        <Field label="이메일" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
        <Field label="비밀번호 (8자 이상, 영문+숫자)" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} />
        <Field label="비밀번호 확인" type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
        {errors.form && <p className="form-error">{errors.form}</p>}
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? '가입 중...' : '가입하기'}</button>
      </form>
      <div className="auth-links">
        <span className="muted">이미 계정이 있나요?</span>
        <Link to="/login" className="link">로그인</Link>
      </div>
    </AuthCard>
  )
}

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const v = validateEmail(email.trim())
    if (v) return setError(v)
    setBusy(true)
    await api.requestPasswordReset(email.trim())
    setSent(true)
  }

  return (
    <AuthCard title="비밀번호 찾기">
      {sent ? (
        <p className="notice">
          <strong>{email}</strong>로 가입된 계정이 있다면 비밀번호 재설정 링크를 보냈어요. 링크는 30분 동안 유효해요.
        </p>
      ) : (
        <form className="form" onSubmit={submit} noValidate>
          <p className="muted">가입한 이메일을 입력하면 재설정 링크를 보내드려요.</p>
          <Field label="이메일" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? '보내는 중...' : '재설정 링크 받기'}</button>
        </form>
      )}
      <div className="auth-links">
        <Link to="/login" className="link">로그인으로 돌아가기</Link>
      </div>
    </AuthCard>
  )
}

export function ResetPassword() {
  const token = useSearchParams()[0].get('token') ?? ''
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    const pw = validatePassword(password)
    if (pw) next.password = pw
    if (password !== confirm) next.confirm = '비밀번호가 일치하지 않아요.'
    setErrors(next)
    if (Object.keys(next).length) return
    try {
      await api.resetPassword(token, password)
      setDone(true)
    } catch (err) {
      setErrors({ form: (err as Error).message })
    }
  }

  return (
    <AuthCard title="새 비밀번호 설정">
      {done ? (
        <>
          <p className="notice">비밀번호가 변경됐어요. 새 비밀번호로 로그인해주세요.</p>
          <button className="btn btn-primary btn-block" onClick={() => navigate('/login')}>로그인</button>
        </>
      ) : (
        <form className="form" onSubmit={submit} noValidate>
          <Field label="새 비밀번호" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
          <Field label="새 비밀번호 확인" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
          {errors.form && <p className="form-error">{errors.form}</p>}
          <button className="btn btn-primary btn-block">변경하기</button>
        </form>
      )}
    </AuthCard>
  )
}
